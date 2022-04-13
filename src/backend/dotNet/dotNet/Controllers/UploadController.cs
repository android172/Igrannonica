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
            string folder = Directory.GetCurrentDirectory() + "\\Files\\" + korisnik.Id;

            if (!System.IO.Directory.Exists(folder))
            {
                Directory.CreateDirectory(folder);
            }

            // kreiranje foldera sa nazivom eksperimenta
            string folderEksperiment = folder + "\\" + idEksperimenta;

            if (!System.IO.Directory.Exists(folderEksperiment))
            {
                Directory.CreateDirectory(folderEksperiment);
            }

            // cuvanje fajla - putanja 
            string fileName = file.FileName;
            string path = folderEksperiment + "\\" + fileName;

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
            
            // upis u fajl 
            System.IO.File.WriteAllText(path, sb.ToString());
            eksperiment.LoadDataset(idEksperimenta, fileName);

            // upis csv-a u bazu 
            bool fajlNijeSmesten = db.dbeksperiment.dodajCsv(idEksperimenta, fileName);

            if(!fajlNijeSmesten)
            {
                Console.WriteLine("Fajl nije upisan u bazu");
                return BadRequest("Neuspesan upis csv-a u bazu");
            }
            return Ok("Fajl je upisan.");      
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
            string folder = Directory.GetCurrentDirectory() + "\\Files\\" + korisnik.Id;

            if (!System.IO.Directory.Exists(folder))
            {
                return BadRequest("Folder korisnika ne postoji");
            }

            string folderEksperiment = folder + "\\" + idEksperimenta;

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
                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

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
                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

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
                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

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
                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

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
                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

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
                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

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
                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

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
                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return "6"; //BadRequest();
            }
            else
                return "7"; // BadRequest("Korisnik nije ulogovan.");

            if (niz.Length == 0)
                return "8";// BadRequest("Niz je prazan");
            
            foreach(var i in niz)
            {
                eksperiment.DeleteRow(i);
            }

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
    }
}
