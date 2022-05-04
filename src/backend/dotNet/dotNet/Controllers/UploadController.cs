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
        public Paging Paging(int page, int size)
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
        [HttpPost("sacuvajIzmene")]
        public IActionResult SaveChanges()
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                //eksperiment.SaveDataset();
                return Ok("Izmene sacuvane");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }
    }
}
