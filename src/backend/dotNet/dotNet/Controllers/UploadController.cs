using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using Microsoft.VisualBasic.FileIO;
using Newtonsoft.Json;
using System.IO;
using dotNet.DBFunkcije;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;
using dotNet.Models;
using dotNet.MLService;
using Newtonsoft.Json.Linq;

namespace dotNet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private IConfiguration _config;
        DB db;
        //private static MLExperiment? experiment = null;

        public UploadController(IConfiguration config)
        {
            _config = config;
            db = new DB(_config);
        }

        [HttpPost("upload/{idEksperimenta}")]
        public IActionResult Upload(IFormFile file,int idEksperimenta)
        {
            
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (file == null)
                return BadRequest("Fajl nije unet.");

            // kreiranje foldera 
            string folder = Path.Combine(Directory.GetCurrentDirectory() , "Files" , korisnik.Id.ToString());

            if (!System.IO.Directory.Exists(folder))
            {
                Directory.CreateDirectory(folder);
            }

            // kreiranje foldera sa nazivom eksperimenta
            string folderEksperiment = Path.Combine(folder , idEksperimenta.ToString());

            if (!System.IO.Directory.Exists(folderEksperiment))
            {
                Directory.CreateDirectory(folderEksperiment);
            }

            // cuvanje fajla - putanja 
            string fileName = file.FileName;
            string path = Path.Combine(folderEksperiment , fileName);

            string[] lines = { };
            List<string> lines2 = new List<string>();

            using (TextFieldParser csvParse = new TextFieldParser(file.OpenReadStream()))
            {
                csvParse.CommentTokens = new string[] { "#" };
                csvParse.SetDelimiters(",");
                csvParse.HasFieldsEnclosedInQuotes = true;

                while (!csvParse.EndOfData)
                {
                    string[] line = csvParse.ReadFields();

                    for (var i = 0; i < line.Length; i++)
                    {
                        if (line[i].Contains(','))
                        {
                            line[i] = "\"" + line[i] + "\"";
                        }
                    }
                    string linija = string.Join(",", line);

                    lines2.Add(linija);
                }
            }
            lines = lines2.ToArray();

            StringBuilder sb = new StringBuilder();

            foreach (string line in lines)
            {
                sb.AppendLine(line);
            }

            // upis csv-a u bazu 
            bool fajlNijeSmesten = db.dbeksperiment.dodajCsv(idEksperimenta, fileName);
            
            // upis u fajl 
            System.IO.File.WriteAllText(path, sb.ToString());
            eksperiment.LoadDataset(idEksperimenta, fileName);

            if(!fajlNijeSmesten)
            {
                Console.WriteLine("Fajl nije upisan u bazu");
                return BadRequest("Neuspesan upis csv-a u bazu");
            }
            return Ok("Fajl je upisan.");      
        }
        [HttpPost("fileUpload/{idEksperimenta}")]
        public IActionResult UploadAnyFile(IFormFile file, int idEksperimenta)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (file == null)
                return BadRequest("Fajl nije unet.");

            if (CheckFileType(file.FileName))
            {
                Console.WriteLine("Unet je nedozvoljen tip fajla.");
                return BadRequest("Unet nedozvoljen tip fajla.");
            }

            // kreiranje foldera 
            string folder = Path.Combine(Directory.GetCurrentDirectory() ,"Files" , korisnik.Id.ToString());

            if (!System.IO.Directory.Exists(folder))
            {
                Directory.CreateDirectory(folder);
            }

            // kreiranje foldera sa nazivom eksperimenta
            string folderEksperiment = Path.Combine(folder , idEksperimenta.ToString());

            if (!System.IO.Directory.Exists(folderEksperiment))
            {
                Directory.CreateDirectory(folderEksperiment);
            }

            // cuvanje fajla - putanja 
            string fileName = file.FileName;
            string path = Path.Combine(folderEksperiment, fileName);

            // citanje fajla 
            long length = file.Length;
            using var fileStream = file.OpenReadStream();
            byte[] bytes = new byte[length];
            fileStream.Read(bytes, 0, (int)file.Length);

            // upis csv-a u bazu 
            bool fajlNijeSmesten = db.dbeksperiment.dodajCsv(idEksperimenta, fileName);

            // upis u fajl 
            System.IO.File.WriteAllBytes(path, bytes);

            eksperiment.LoadDataset(idEksperimenta, fileName);

            if (!fajlNijeSmesten)
            {
                Console.WriteLine("Fajl nije upisan u bazu");
                return BadRequest("Neuspesan upis csv-a u bazu");
            }
            return Ok("Fajl je upisan.");
        }
        private static bool CheckFileType(string filename)
        {
            string extension = System.IO.Path.GetExtension(filename);

            if (String.Compare(extension, ".csv", true) == 0)
            {
                return false;
            }
            if (String.Compare(extension, ".json", true) == 0)
            {
                return false;
            }
            if (String.Compare(extension, ".xlsx", true) == 0)
            {
                return false;
            }
            if (String.Compare(extension, ".xls", true) == 0)
            {
                return false;
            }
            if (String.Compare(extension, ".xlsm", true) == 0)
            {
                return false;
            }
            if (String.Compare(extension, ".xlsb", true) == 0)
            {
                return false;
            }
            if (String.Compare(extension, ".odf", true) == 0)
            {
                return false;
            }
            if (String.Compare(extension, ".ods", true) == 0)
            {
                return false;
            }
            if (String.Compare(extension, ".odt", true) == 0)
            {
                return false;
            }

            return true;
        }

        [HttpGet("paging/{page}/{size}")]
        public Paging Proba(int page, int size)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                //korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return new Paging(null, 1);
            }
            else
                return new Paging(null, 1);

            var j = page * size - size;
            int ukupanBrRedovaFajla = eksperiment.GetRowCount();

            if (j + size - 1 > ukupanBrRedovaFajla)
            {
                size = ukupanBrRedovaFajla - j;
            }

            int[] niz = new int[size];
            

            for (var i = 0; i < size; i++)
            {
                Console.WriteLine("Vrednost j: " + j);
                niz[i] = j++;
            }

            var redovi = eksperiment.GetRows(niz);

            Console.WriteLine($"Page: {page}  Size: {size}");

            Paging page1 = new Paging(redovi, ukupanBrRedovaFajla);
            //Console.WriteLine(redovi);

            return page1;
        }

        [HttpPost("oneHotEncoding")]
        public IActionResult OneHotEncoding(int[] niz)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                //korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return Ok("");
            }
            else
                return Ok("");

            if (niz == null)
               return BadRequest("Nisu unete kolone");

            eksperiment.OneHotEncoding(niz);

            return Ok("OneHotEncoding izvrseno");
        }

        [HttpPost("labelEncoding")]
        public IActionResult LabelEncoding(int[] niz)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                //korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return Ok("");
            }
            else
                return Ok("");

            if (niz == null)
                return BadRequest("Nisu unete kolone");

            eksperiment.LabelEncoding(niz);

            return Ok("LabelEncoding izvrseno");
        }

        [HttpGet("statistika")]
        public string getStat()
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                //korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return null;
            }
            else
                return null;

            string statistika = eksperiment.ColumnStatistics();
            return statistika;
        }
        [HttpPost("uploadTest/{idEksperimenta}")]
        public IActionResult UploadTest(IFormFile file, int idEksperimenta)
        {

            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (file == null)
                return BadRequest("Fajl nije unet.");

            // kreiranje foldera 
            string folder = Path.Combine(Directory.GetCurrentDirectory(), "Files", korisnik.Id.ToString());

            if (!System.IO.Directory.Exists(folder))
            {
                return BadRequest("Folder korisnika ne postoji");
            }

            string folderEksperiment = Path.Combine(folder, idEksperimenta.ToString());

            if (!System.IO.Directory.Exists(folderEksperiment))
            {
                return BadRequest("Eksperiment nije kreiran");
            }

            // ucitavanje bilo kog fajla 
            long length = file.Length;
            using var fileStream = file.OpenReadStream();
            byte[] bytes = new byte[length];
            fileStream.Read(bytes, 0, (int)file.Length);

            //System.IO.File.WriteAllBytes(path, bytes);
            eksperiment.LoadDatasetTest(bytes, file.FileName);

            return Ok("Testni skup ucitan.");
        }
        [HttpPost("setRatio/{ratio}")]
        public IActionResult setRatio(float ratio)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                //korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (float.IsNaN(ratio))
                return BadRequest("Nije unet ratio.");

           
            eksperiment.TrainTestSplit(ratio);

            return Ok("Dodat ratio.");
        }
        [HttpPost("deleteColumns")]
        public IActionResult deleteColumns(int[] niz)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                //korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (niz.Length == 0)
                return BadRequest("Prazan niz");

            foreach(var i in niz)
            {
                eksperiment.DeleteColumn(i);
            }

            return Ok("Obrisane zeljene kolone");
        }
        [HttpPost("fillWithMean")]
        public IActionResult fillNaWithMean(int[] niz)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                //korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            eksperiment.FillNAWithMean(niz);

            return Ok("Mean");
        }
        [HttpPost("fillWithMedian")]
        public IActionResult fillNaWithMedian(int[] niz)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                //korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            eksperiment.FillNAWithMedian(niz);

            return Ok("Median");
        }
        [HttpPost("fillWithMode")]
        public IActionResult fillNaWithMode(int[] niz)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                //korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            eksperiment.FillNAWithMode(niz);

            return Ok("Mode");
        }
        [HttpPost("replaceEmpty")]
        public IActionResult replaceEmpty(int[] niz)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                //korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (niz.Length == 0)
                return BadRequest("Vrednosti za zamenu ne postoje");

            eksperiment.ReplaceEmptyWithNA(niz);

            return Ok("Zamenjene string vrednosti sa NA");
        }
        [HttpPost("replaceZero")]
        public IActionResult replaceZero(int[] niz)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                //korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (niz.Length == 0)
                return BadRequest("Vrednosti za zamenu ne postoje");

            eksperiment.ReplaceZeroWithNA(niz);

            return Ok("Zamenjene 0 vrednosti sa NA");
        }
        [HttpPost("deleteRows")]
        public string deleteRows(int[] niz)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                //korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return "Korisnik nije pronadjen"; //BadRequest
            }
            else
                return "Token nije setovan";  

            if (niz.Length == 0)
                return "Redovi za brisanje nisu izabrani";
            
            eksperiment.DeleteRows(niz);
            
            // Ukupan broj redova ucitanog fajla
            return eksperiment.GetRowCount().ToString();
        }
        [HttpPut("updateValue/{row}/{column}/{data}")]
        public IActionResult updateAValue(int row,int column, string data)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            
            Console.WriteLine("DATA: " + data);
            eksperiment.UpdataValue(row, column, data);

            return Ok("Polje je izmenjeno"); 
        }
        [HttpPost("sacuvajIzmene")]
        public IActionResult saveChanges()
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            eksperiment.SaveDataset();

            return Ok("Izmene sacuvane");
        }
        [HttpPost("absoluteMaxScaling")]
        public IActionResult absoluteMaxScaling(int[] kolone)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (kolone == null)
                return BadRequest("Nije odabrana nijedna kolona.");

            eksperiment.ScaleAbsoluteMax(kolone);

            return Ok("Absolute Max Scaling izvrseno");
        }

        [HttpPost("minMaxScaling")]
        public IActionResult minMaxScaling(int[] kolone)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (kolone == null)
                return BadRequest("Nije odabrana nijedna kolona.");

            eksperiment.ScaleMinMax(kolone);

            return Ok("Min-Max Scaling izvrseno");
        }

        [HttpPost("zScoreScaling")]
        public IActionResult zScoreScaling(int[] kolone)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (kolone == null)
                return BadRequest("Nije odabrana nijedna kolona.");

            eksperiment.ScaleZScore(kolone);

            return Ok("Z-Score Scaling izvrseno");
        }

        [HttpPost("standardDeviation/{threshold}")]
        public IActionResult RemoveStandardDeviation(int[] kolone,float threshold)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (kolone == null)
                return BadRequest("Nije odabrana nijedna kolona.");

            eksperiment.RemoveOutliersStandardDeviation(kolone, threshold);

            return Ok("Standard Deviation");
        }
        [HttpPost("outliersQuantiles/{threshold}")]
        public IActionResult RemoveQuantiles(int[] kolone,float threshold)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (kolone == null)
                return BadRequest("Nije odabrana nijedna kolona.");

            eksperiment.RemoveOutliersQuantiles(kolone, threshold);

            return Ok("Quantiles");
        }
        [HttpPost("outliersZScore/{threshold}")]
        public IActionResult RemoveZScore(int[] kolone,float threshold)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (kolone == null)
                return BadRequest("Nije odabrana nijedna kolona.");

            eksperiment.RemoveOutliersZScore(kolone, threshold);

            return Ok("ZScore izvresno");
        }
        [HttpPost("outliersIQR")]
        public IActionResult RemoveIQR(int[] kolone)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (kolone == null)
                return BadRequest("Nije odabrana nijedna kolona.");

            eksperiment.RemoveOutliersIQR(kolone);

            return Ok("Z-Score Scaling izvrseno");
        }
        [HttpPost("outliersIsolationForest")]
        public IActionResult RemoveIsolationForest(int[] kolone)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (kolone == null)
                return BadRequest("Nije odabrana nijedna kolona.");

            eksperiment.RemoveOutliersIsolationForest(kolone);

            return Ok("Forest Isolation");
        }
        [HttpPost("outliersOneClassSVM")]
        public IActionResult RemoveOneClassSVM(int[] kolone)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (kolone == null)
                return BadRequest("Nije odabrana nijedna kolona.");

            eksperiment.RemoveOutliersOneClassSVM(kolone);

            return Ok("One Class SVM");
        }
        [HttpPost("outliersByLocalFactor")]
        public IActionResult RemoveByLocalFactor(int[] kolone)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (kolone == null)
                return BadRequest("Nije odabrana nijedna kolona.");

            eksperiment.RemoveOutliersByLocalFactor(kolone);

            return Ok("Local Factor");
        }
        [HttpPost("deleteAllColumnsNA")]
        public IActionResult DeleteAllNAColumns()
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            eksperiment.DropNAColumns();

            return Ok("Kolone sa NA vrednostima su obrisane");
        }
       
        [HttpPost("deleteAllRowsNA")]
        public IActionResult DeleteAllNARows()
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            eksperiment.DropNAListwise();

            return Ok("Redovi sa NA vrednostima su obrisani");
        }
        [HttpPost("deleteNARowsForColumns")]
        public IActionResult DeleteAllNARowsForColumns(int[] kolone)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            if (kolone == null)
                return BadRequest("Nije uneta nijedna kolona");

            eksperiment.DropNAPairwise(kolone);

            return Ok("Redovi sa NA vrednostima su obrisani za date kolone");
        }
        [HttpPost("linearRegression/{idKolone}")]
        public IActionResult FillNALinearRegression(int idKolone, int[] niz)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment eksperiment;

            if (tokenS != null)
            {
                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");

            try
            {
                eksperiment.FillNAWithRegression(idKolone, niz);
            }
            catch(MLException e)
            {
                Console.WriteLine(e.StackTrace);
            }

            return Ok("Linearna regresija - uspesno");
        }

    }
}
