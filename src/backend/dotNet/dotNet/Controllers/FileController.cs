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
    public class FileController : ControllerBase
    {
        private IConfiguration _config;
        DB db;
        private int ukupanBrRedovaFajla;
        //private static MLExperiment? experiment = null;

        public FileController(IConfiguration config)
        {
            _config = config;
            db = new DB(_config);
            ukupanBrRedovaFajla = 0;
        }

        [HttpPost("download/{idEksperimenta}")]
        public ActionResult Download(int idEksperimenta)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");

            /// TEMP
            if (token.Equals("") || token.Equals("st")) {
                string fileName1 = db.dbeksperiment.uzmi_naziv_csv(idEksperimenta);

                string path1 = System.IO.Path.Combine(Directory.GetCurrentDirectory(), "Files", "1", idEksperimenta.ToString(), fileName1);

                try { return File(System.IO.File.ReadAllBytes(path1), "application/octet-stream", fileName1); }
                catch { return NotFound("File not found."); }
            }
            /// 

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

            string fileName = db.dbeksperiment.uzmi_naziv_csv(idEksperimenta);

            string path = System.IO.Path.Combine(
                Directory.GetCurrentDirectory(), "Files", 
                korisnik.Id.ToString(), idEksperimenta.ToString(), fileName
                );

            try { return File(System.IO.File.ReadAllBytes(path), "application/octet-stream", fileName); }
            catch { return NotFound("File not found."); }
        }

        [HttpPost("upload/{idEksperimenta}")]
        public IActionResult Upload(IFormFile file, int idEksperimenta)
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

            // upis u fajl 
            System.IO.File.WriteAllText(path, sb.ToString());
            try
            {
                eksperiment.LoadDataset(idEksperimenta, fileName);
            }
            catch (Exception ex)
            {
                return BadRequest("File nije ucitan u python");
            }
            
            // upis csv-a u bazu 
            bool fajlNijeSmesten = db.dbeksperiment.dodajCsv(idEksperimenta, fileName);

            if (!fajlNijeSmesten)
            {
                Console.WriteLine("Fajl nije upisan u bazu");
                return BadRequest("Neuspesan upis csv-a u bazu");
            }
            return Ok("Fajl je upisan.");
        }

        [HttpPost("update/{idEksperimenta}")]
        public IActionResult Update(IFormFile file, int idEksperimenta)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");

            /// TEMP
            if (token.Equals("") || token.Equals("st"))
            {
                if (file == null)
                    return BadRequest("Fajl nije unet.");

                // kreiranje foldera 
                string folder1 = Path.Combine(Directory.GetCurrentDirectory() , "Files","1");

                if (!System.IO.Directory.Exists(folder1))
                {
                    Directory.CreateDirectory(folder1);
                }

                // kreiranje foldera sa nazivom eksperimenta
                string folderEksperiment1 = Path.Combine(folder1 , idEksperimenta.ToString());

                if (!System.IO.Directory.Exists(folderEksperiment1))
                {
                    Directory.CreateDirectory(folderEksperiment1);
                }

                // ucitavanje bilo kog fajla 
                long length1 = file.Length;
                using var fileStream1 = file.OpenReadStream();
                byte[] bytes1 = new byte[length1];
                fileStream1.Read(bytes1, 0, (int)file.Length);

                // Path
                string fileName1 = file.FileName;
                string path1 = Path.Combine(folderEksperiment1 , fileName1);

                Console.WriteLine(path1);

                // upis u fajl 
                System.IO.File.WriteAllBytes(path1, bytes1);

                return Ok("Fajl je upisan.");
            }
            /// 

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

            // ucitavanje bilo kog fajla 
            long length = file.Length;
            using var fileStream = file.OpenReadStream();
            byte[] bytes = new byte[length];
            fileStream.Read(bytes, 0, (int)file.Length);

            // Path
            string fileName = file.FileName;
            string path = Path.Combine(folderEksperiment , fileName);

            // upis u fajl 
            System.IO.File.WriteAllBytes(path, bytes);

            return Ok("Fajl je upisan.");
        }

        // Za upisivanje i citanje modela

        [HttpPost("downloadModel/{idEksperimenta}")]
        public ActionResult Download(int idEksperimenta, string modelName)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");

            /// TEMP
            if (token.Equals("") || token.Equals("st")) {
                string fileName1 = modelName + ".pt";

                string path1 = System.IO.Path.Combine(
                    Directory.GetCurrentDirectory(), "Files",
                    "1", idEksperimenta.ToString(), "Models", fileName1
                    );

                try { return File(System.IO.File.ReadAllBytes(path1), "application/octet-stream", fileName1); }
                catch { return NotFound("File not found."); }
            }
            ///

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

            string fileName = modelName + ".pt";

            string path = System.IO.Path.Combine(
                Directory.GetCurrentDirectory(), "Files",
                korisnik.Id.ToString(), idEksperimenta.ToString(), "Models", fileName
                );

            try { return File(System.IO.File.ReadAllBytes(path), "application/octet-stream", fileName); }
            catch { return NotFound("File not found."); }
        }


        [HttpPost("uploadModel/{idEksperimenta}")]
        public IActionResult uploadModel(IFormFile file, int idEksperimenta, string modelName)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");

            /// TEMP
            if (token.Equals("") || token.Equals("st")) {
                string folder1 = Path.Combine(Directory.GetCurrentDirectory() , "Files","1");

                if (!System.IO.Directory.Exists(folder1))
                {
                    Directory.CreateDirectory(folder1);
                }

                // kreiranje foldera sa nazivom eksperimenta
                string folderEksperiment1 = Path.Combine(folder1 , idEksperimenta.ToString());

                if (!System.IO.Directory.Exists(folderEksperiment1))
                {
                    Directory.CreateDirectory(folderEksperiment1);
                }

                // kreiranje foldera za modele
                string folderModeli1 = Path.Combine(folderEksperiment1 , "Models");

                if (!System.IO.Directory.Exists(folderModeli1))
                {
                    Directory.CreateDirectory(folderModeli1);
                }

                // ucitavanje modela
                string fileName1 = modelName + ".pt";
                string path1 = Path.Combine(folderModeli1 , fileName1);

                long length1 = file.Length;
                using var fileStream1 = file.OpenReadStream();
                byte[] bytes1 = new byte[length1];
                fileStream1.Read(bytes1, 0, (int)file.Length);

                // upis u fajl 
                System.IO.File.WriteAllBytes(path1, bytes1);

                return Ok("Fajl je upisan.");
            }
            ///

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
            string folderEksperiment = Path.Combine(folder, idEksperimenta.ToString());

            if (!System.IO.Directory.Exists(folderEksperiment))
            {
                Directory.CreateDirectory(folderEksperiment);
            }

            // kreiranje foldera za modele
            string folderModeli = Path.Combine(folderEksperiment , "Models");

            if (!System.IO.Directory.Exists(folderModeli))
            {
                Directory.CreateDirectory(folderModeli);
            }

            // ucitavanje modela
            string fileName = modelName + ".pt";
            string path = Path.Combine(folderModeli , fileName);

            long length = file.Length;
            using var fileStream = file.OpenReadStream();
            byte[] bytes = new byte[length];
            fileStream.Read(bytes, 0, (int)file.Length);

            // upis u fajl 
            System.IO.File.WriteAllBytes(path, bytes);

            return Ok("Fajl je upisan.");
        }

    }
}
