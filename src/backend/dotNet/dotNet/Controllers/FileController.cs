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
        public FileContentResult Download(int idEksperimenta)
        {
            Console.WriteLine(idEksperimenta);
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
                    return null;
            }
            else
                return null;

            string fileName = db.dbeksperiment.uzmi_naziv_csv(idEksperimenta);

            string path = System.IO.Path.Combine(
                Directory.GetCurrentDirectory(), "Files", 
                korisnik.Id.ToString(), idEksperimenta.ToString(), fileName
                );

            return File(System.IO.File.ReadAllBytes(path), "application/octet-stream", fileName);
        }

        [HttpGet("downloadTest/{idEksperimenta}")]
        public FileContentResult DownloadTest(int idEksperimenta)
        {
            string fileName = db.dbeksperiment.uzmi_naziv_csv(idEksperimenta);
            
            string path = System.IO.Path.Combine(Directory.GetCurrentDirectory(), "Files", "1", idEksperimenta.ToString(), fileName);

            return File(System.IO.File.ReadAllBytes(path), "application/octet-stream", fileName);
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
            eksperiment.LoadDataset(path);

            // upis csv-a u bazu 
            bool fajlNijeSmesten = db.dbeksperiment.dodajCsv(idEksperimenta, fileName);

            if (!fajlNijeSmesten)
            {
                Console.WriteLine("Fajl nije upisan u bazu");
                return BadRequest("Neuspesan upis csv-a u bazu");
            }
            return Ok("Fajl je upisan.");
        }
    }
}
