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
using Microsoft.AspNetCore.Authorization;

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

        private string kreirajFoldere(int korisnikid, int eksperimentid)
        {
            try
            {
                string folder = Path.Combine(Directory.GetCurrentDirectory(), "Files", korisnikid.ToString());

                if (!System.IO.Directory.Exists(folder))
                {
                    Directory.CreateDirectory(folder);
                }

                // kreiranje foldera sa nazivom eksperimenta
                string folderEksperiment = Path.Combine(folder, eksperimentid.ToString());

                if (!System.IO.Directory.Exists(folderEksperiment))
                {
                    Directory.CreateDirectory(folderEksperiment);
                }
                return folderEksperiment;
            }
            catch
            {
                return null;
            }
        }

        [Authorize]
        [HttpPost("upload/{idEksperimenta}")]
        public IActionResult Upload(IFormFile file, int idEksperimenta)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token);
                var tokenS = jsonToken as JwtSecurityToken;
                Korisnik korisnik;
                MLExperiment eksperiment;

                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik mora ponovo da se prijavi!");


                if (file == null)
                    return BadRequest("Fajl nije unet.");


                // cuvanje fajla - putanja 
                string folder = kreirajFoldere(korisnik.Id, idEksperimenta);
                if (folder == null)
                    return BadRequest("Folderi nisu kreirani.");
                string fileName = file.FileName;
                string path = Path.Combine(folder, fileName);

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
                // upis csv-a u bazu 
                bool fajlNijeSmesten = db.dbeksperiment.dodajCsv(idEksperimenta, fileName);



                eksperiment.LoadDataset(idEksperimenta, fileName);
                if (!fajlNijeSmesten)
                {
                    return BadRequest("Neuspesan upis csv-a u bazu");
                }
                return Ok("Fajl je upisan.");
            }
            catch
            {
                return BadRequest("Doslo do greske");
            }
        }

        [Authorize]
        [HttpPost("fileUpload/{idEksperimenta}")]
        public IActionResult UploadAnyFile(IFormFile file, int idEksperimenta)
        {
            try
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
                        return BadRequest("Korisnik treba ponovo da se prijavi.");
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
                string folder = kreirajFoldere(korisnik.Id, idEksperimenta);
                if (folder == null)
                    return BadRequest("Folderi nisu kreirani.");
                // cuvanje fajla - putanja 
                string fileName = file.FileName;
                string path = Path.Combine(folder, fileName);

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
                    return BadRequest("Neuspesan upis csv-a u bazu");
                }
                return Ok("Fajl je upisan.");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
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

        [Authorize]
        [HttpGet("paging/{page}/{size}")]
        public Paging Proba(int page, int size)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                Korisnik korisnik;
                MLExperiment eksperiment;

                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
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
                    niz[i] = j++;
                }
                var redovi = eksperiment.GetRows(niz);
                Paging page1 = new Paging(redovi, ukupanBrRedovaFajla);
                return page1;
            }
            catch
            {
                return new Paging(null, 1);
            }
        }

        [Authorize]
        [HttpPost("oneHotEncoding")]
        public IActionResult OneHotEncoding(int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik mora ponovo da se prijavi!");
                if (niz == null)
                    return BadRequest("Nisu unete kolone");
                eksperiment.OneHotEncoding(niz);
                return Ok("OneHotEncoding izvrseno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("labelEncoding")]
        public IActionResult LabelEncoding(int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return Ok("");
                if (niz == null)
                    return BadRequest("Nisu unete kolone");
                eksperiment.LabelEncoding(niz);
                return Ok("LabelEncoding izvrseno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpGet("statistika")]
        public string getStat()
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return null;
                string statistika = eksperiment.ColumnStatistics();
                return statistika;
            }
            catch
            {
                return null;
            }
        }

        [Authorize]
        [HttpPost("uploadTest/{idEksperimenta}")]
        public IActionResult UploadTest(IFormFile file, int idEksperimenta)
        {
            try
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
                        return BadRequest("Korisnik treba ponovo da se prijavi.");
                }
                else
                    return BadRequest("Korisnik nije ulogovan.");
                if (file == null)
                    return BadRequest("Fajl nije unet.");
                // kreiranje foldera 
                string folder = kreirajFoldere(korisnik.Id, idEksperimenta);
                // ucitavanje bilo kog fajla 
                long length = file.Length;
                using var fileStream = file.OpenReadStream();
                byte[] bytes = new byte[length];
                fileStream.Read(bytes, 0, (int)file.Length);
                eksperiment.LoadDatasetTest(bytes, file.FileName);
                return Ok("Testni skup ucitan.");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("setRatio/{ratio}")]
        public IActionResult setRatio(float ratio)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (float.IsNaN(ratio))
                    return BadRequest("Nije unet ratio.");
                eksperiment.TrainTestSplit(ratio);
                return Ok("Dodat ratio.");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("deleteColumns")]
        public IActionResult deleteColumns(int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (niz.Length == 0)
                    return BadRequest("Prazan niz");
                foreach (var i in niz)
                {
                    eksperiment.DeleteColumn(i);
                }
                return Ok("Obrisane zeljene kolone");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("fillWithMean")]
        public IActionResult fillNaWithMean(int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.FillNAWithMean(niz);
                return Ok("Mean");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }
        [HttpPost("fillWithMedian")]
        public IActionResult fillNaWithMedian(int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.FillNAWithMedian(niz);
                return Ok("Median");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }
        [HttpPost("fillWithMode")]
        public IActionResult fillNaWithMode(int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.FillNAWithMode(niz);
                return Ok("Mode");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }
        [HttpPost("replaceEmpty")]
        public IActionResult replaceEmpty(int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (niz.Length == 0)
                    return BadRequest("Vrednosti za zamenu ne postoje");
                eksperiment.ReplaceEmptyWithNA(niz);
                return Ok("Zamenjene string vrednosti sa NA");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("replaceZero")]
        public IActionResult replaceZero(int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (niz.Length == 0)
                    return BadRequest("Vrednosti za zamenu ne postoje");
                eksperiment.ReplaceZeroWithNA(niz);
                return Ok("Zamenjene 0 vrednosti sa NA");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("deleteRows")]
        public IActionResult deleteRows(int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik nije pronadjen"); //BadRequest
                if (niz.Length == 0)
                    return BadRequest("Redovi za brisanje nisu izabrani");
                eksperiment.DeleteRows(niz);
                // Ukupan broj redova ucitanog fajla
                return Ok(eksperiment.GetRowCount().ToString());
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPut("updateValue/{row}/{column}/{data}")]
        public IActionResult updateAValue(int row, int column, string data)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.UpdataValue(row, column, data);
                return Ok("Polje je izmenjeno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("sacuvajIzmene")]
        public IActionResult saveChanges()
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.SaveDataset();
                return Ok("Izmene sacuvane");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("absoluteMaxScaling")]
        public IActionResult absoluteMaxScaling(int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.ScaleAbsoluteMax(kolone);
                return Ok("Absolute Max Scaling izvrseno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("minMaxScaling")]
        public IActionResult minMaxScaling(int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.ScaleMinMax(kolone);
                return Ok("Min-Max Scaling izvrseno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("zScoreScaling")]
        public IActionResult zScoreScaling(int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.ScaleZScore(kolone);
                return Ok("Z-Score Scaling izvrseno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("standardDeviation/{threshold}")]
        public IActionResult RemoveStandardDeviation(int[] kolone, float threshold)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.RemoveOutliersStandardDeviation(kolone, threshold);
                return Ok("Standard Deviation");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("outliersQuantiles/{threshold}")]
        public IActionResult RemoveQuantiles(int[] kolone, float threshold)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.RemoveOutliersQuantiles(kolone, threshold);
                return Ok("Quantiles");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("outliersZScore/{threshold}")]
        public IActionResult RemoveZScore(int[] kolone, float threshold)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.RemoveOutliersZScore(kolone, threshold);
                return Ok("ZScore izvresno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("outliersIQR")]
        public IActionResult RemoveIQR(int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.RemoveOutliersIQR(kolone);
                return Ok("Z-Score Scaling izvrseno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("outliersIsolationForest")]
        public IActionResult RemoveIsolationForest(int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.RemoveOutliersIsolationForest(kolone);
                return Ok("Forest Isolation");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("outliersOneClassSVM")]
        public IActionResult RemoveOneClassSVM(int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.RemoveOutliersOneClassSVM(kolone);
                return Ok("One Class SVM");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("outliersByLocalFactor")]
        public IActionResult RemoveByLocalFactor(int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.RemoveOutliersByLocalFactor(kolone);
                return Ok("Local Factor");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("deleteAllColumnsNA")]
        public IActionResult DeleteAllNAColumns()
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.DropNAColumns();
                return Ok("Kolone sa NA vrednostima su obrisane");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("deleteAllRowsNA")]
        public IActionResult DeleteAllNARows()
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.DropNAListwise();
                return Ok("Redovi sa NA vrednostima su obrisani");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpPost("deleteNARowsForColumns")]
        public IActionResult DeleteAllNARowsForColumns(int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije uneta nijedna kolona");
                eksperiment.DropNAPairwise(kolone);
                return Ok("Redovi sa NA vrednostima su obrisani za date kolone");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }
        [Authorize]
        [HttpPost("linearRegression/{idKolone}")]
        public IActionResult FillNALinearRegression(int idKolone, int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.FillNAWithRegression(idKolone, niz);
                return Ok("Linearna regresija - uspesno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

    }
}
