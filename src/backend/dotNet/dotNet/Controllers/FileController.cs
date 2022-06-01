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
    public class FileController : ControllerBase
    {
        private IConfiguration _config;
        private int ukupanBrRedovaFajla;
        private DB db;

        private readonly string[] supportedExtensions = new string[] {
            "csv",
            "json",
            "xlsx",
            "xls",
            "xlsm",
            "xlsb",
            "odf",
            "ods",
            "odt"
        };

        public FileController(IConfiguration config)
        {
            _config = config;
            db = new DB(_config);
            ukupanBrRedovaFajla = 0;
        }

        // Download
        private ActionResult DownloadFile(string fileName, string filePath, string fileType = "application/octet-stream") {
            try { return File(System.IO.File.ReadAllBytes(filePath), fileType, fileName); }
            catch { return NotFound("File not found."); }
        }

        [HttpPost("download/{idEksperimenta}")]
        public ActionResult Download(int idEksperimenta, string versionName)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");

                /// TEMP
                if (token.Equals("") || token.Equals("st"))
                {
                    string path1 = System.IO.Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "Files", "1",
                        idEksperimenta.ToString(), versionName
                    );

                    return DownloadFile(versionName, path1);
                }
                /// 

                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token);
                var tokenS = jsonToken as JwtSecurityToken;
                Korisnik korisnik;

                if (tokenS != null)
                    korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));
                else
                    return BadRequest(ErrorMessages.Unauthorized);

                string fileName = versionName;
                try { fileName = db.dbeksperiment.uzmi_naziv_csv(idEksperimenta); }
                catch { }
                string path = System.IO.Path.Combine(
                    Directory.GetCurrentDirectory(), "Files",
                    korisnik.Id.ToString(), idEksperimenta.ToString(), versionName
                    );

                return DownloadFile(fileName, path);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [HttpPost("downloadModel/{idEksperimenta}")]
        public ActionResult DownloadModel(int idEksperimenta, string modelName)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");

                /// TEMP
                if (token.Equals("") || token.Equals("st"))
                {
                    string fileName1 = modelName + ".pt";
                    string path1 = System.IO.Path.Combine(
                        Directory.GetCurrentDirectory(), "Files",
                        "1", idEksperimenta.ToString(), "Models", fileName1
                        );

                    return DownloadFile(fileName1, path1);
                }
                ///

                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token);
                var tokenS = jsonToken as JwtSecurityToken;
                Korisnik korisnik;

                if (tokenS != null)
                    korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));
                else
                    return BadRequest(ErrorMessages.Unauthorized);

                string fileName = modelName + ".pt";

                string path = System.IO.Path.Combine(
                    Directory.GetCurrentDirectory(), "Files",
                    korisnik.Id.ToString(), idEksperimenta.ToString(), "Models", fileName
                    );

                return DownloadFile(fileName, path);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [HttpPost("downloadCurrentModel/{idEksperimenta}")]
        public ActionResult DownloadModel(int idEksperimenta, int modelId, string modelName)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token);
                var tokenS = jsonToken as JwtSecurityToken;
                Korisnik korisnik;

                if (tokenS == null)
                    return BadRequest(ErrorMessages.Unauthorized);
                if (!Experiment.eksperimenti.ContainsKey(idEksperimenta)) 
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);

                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                MLExperiment experiment = Experiment.eksperimenti[idEksperimenta];
                experiment.SaveModel("__UNSAVEDMODEL__", modelId);

                string fileName = modelName + ".pt";

                string path = System.IO.Path.Combine(
                    Directory.GetCurrentDirectory(), "Files",
                    korisnik.Id.ToString(), idEksperimenta.ToString(), "Models", "__UNSAVEDMODEL__.pt"
                    );

                return DownloadFile(fileName, path);
            }
            catch (MLException ex)
            {
                return BadRequest(ex.Message);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpGet("GetImage")]
        public IActionResult GetImage(int idEksperimenta)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                Korisnik korisnik;

                if (new JwtSecurityTokenHandler().ReadToken(token) is JwtSecurityToken tokenS)
                    korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));
                else
                    return BadRequest(ErrorMessages.Unauthorized);

                string fileName = "requested_image.png";
                string filePath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "Files",
                    korisnik.Id.ToString(),
                    idEksperimenta.ToString(),
                    fileName
                );
                Console.WriteLine(fileName + " " + filePath);
                return DownloadFile(fileName, filePath, "image/png");
            }
            catch
            {
                return StatusCode(500);
            }
        }


        // Upload
        private void UploadFile(IFormFile file, string fileDir, string fileName)
        {
            if (!Directory.Exists(fileDir))
                Directory.CreateDirectory(fileDir);

            long length = file.Length;
            using var fileStream = file.OpenReadStream();
            byte[] bytes = new byte[length];
            fileStream.Read(bytes, 0, (int)file.Length);
            string path = Path.Combine(fileDir, fileName);

            System.IO.File.WriteAllBytes(path, bytes);
        }

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

                if (tokenS != null)
                {
                    korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                    if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                        eksperiment = Experiment.eksperimenti[idEksperimenta];
                    else
                        return BadRequest(ErrorMessages.ExperimentNotLoaded);
                }
                else
                    return BadRequest(ErrorMessages.Unauthorized);

                if (file == null)
                    return BadRequest(ErrorMessages.FileNotGiven);

                // kreiranje foldera 
                string folderEksperiment = Path.Combine(
                    Directory.GetCurrentDirectory(), 
                    "Files", 
                    korisnik.Id.ToString(),
                    idEksperimenta.ToString()
                );

                // upis u fajl
                string fileExtension = file.FileName.Split(".")[^1];

                if (supportedExtensions.Contains(fileExtension) == false) {
                    return BadRequest(ErrorMessages.FileWrongFormat);
                }

                string fileName = $"RAW_DATA.{fileExtension}";
                UploadFile(file, folderEksperiment, file.FileName);

                // Ucitaj fajl na ml serveru
                Console.WriteLine(idEksperimenta + " " + file.FileName);
                eksperiment.LoadDataset(file.FileName);
            
                // upis csv-a u bazu
                bool fajlNijeSmesten = db.dbeksperiment.dodajCsv(idEksperimenta, file.FileName);
                if (!fajlNijeSmesten)
                    return StatusCode(500);

                //db.dbeksperiment.dodajSnapshot(idEksperimenta, "RAW_DATA", fileName);

                return Ok("Fajl je upisan.");
            }
            catch (MLException e)
            {
                return BadRequest(e.Message);
            }
            catch
            {
                return StatusCode(500);
            }
        }
        
        [HttpPost("update/{idEksperimenta}")]
        public IActionResult Update(IFormFile file, int idEksperimenta)
        {
            try{
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");

                /// TEMP
                if (token.Equals("") || token.Equals("st"))
                {
                    if (file == null)
                        return BadRequest(ErrorMessages.FileNotGiven);

                    // kreiranje foldera 
                    string folderEksperiment1 = Path.Combine(
                        Directory.GetCurrentDirectory() , 
                        "Files","1",
                        idEksperimenta.ToString()
                    );

                    // ucitavanje fajla 
                    UploadFile(file, folderEksperiment1, file.FileName);

                    return Ok("Fajl je upisan.");
                }
                /// 

                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token);
                var tokenS = jsonToken as JwtSecurityToken;
                Korisnik korisnik;

                if (tokenS != null)
                    korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));
                else
                    return BadRequest(ErrorMessages.Unauthorized);

                if (file == null)
                    return BadRequest(ErrorMessages.FileNotGiven);

                // kreiranje foldera 
                string folderEksperiment = Path.Combine(
                    Directory.GetCurrentDirectory() , 
                    "Files" , 
                    korisnik.Id.ToString(),
                    idEksperimenta.ToString()
                );

                // ucitavanje fajla 
                UploadFile(file, folderEksperiment, file.FileName);

                return Ok("Fajl je upisan.");
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [HttpPost("uploadModel/{idEksperimenta}")]
        public IActionResult UploadModel(IFormFile file, int idEksperimenta, string modelName)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");

                /// TEMP
                if (token.Equals("") || token.Equals("st")) {
                    string folderModeli1 = Path.Combine(
                        Directory.GetCurrentDirectory() , 
                        "Files", "1",
                        idEksperimenta.ToString(),
                        "Models"
                    );

                    // upis u fajl
                    UploadFile(file, folderModeli1, file.FileName);

                    return Ok("Fajl je upisan.");
                }
                ///

                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token);
                var tokenS = jsonToken as JwtSecurityToken;
                Korisnik korisnik;

                if (tokenS != null)
                    korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));
                else
                    return BadRequest(ErrorMessages.Unauthorized);

                if (file == null)
                    return BadRequest(ErrorMessages.FileNotGiven);

                // kreiranje foldera 
                string folderModeli = Path.Combine(
                    Directory.GetCurrentDirectory() , 
                    "Files" , 
                    korisnik.Id.ToString(),
                    idEksperimenta.ToString(),
                    "Models"
                );

                // Upis u fajl
                UploadFile(file, folderModeli, file.FileName);

                return Ok("Fajl je upisan.");
            }
            catch
            {
                return StatusCode(500);
            }
        }


        // Snapshots
        [Authorize]
        [HttpGet("ProveriSnapshot")]
        public IActionResult proveriSnapshot(int idEksperimenta, string naziv)
        {
            try
            {
                return Ok(db.dbeksperiment.proveriSnapshot(idEksperimenta, naziv));
            }
            catch
            {
                return StatusCode(500);
            }
        }
        [Authorize]
        [HttpPost("SaveSnapshot")]
        public IActionResult sacuvajSnapshot(int idEksperimenta,int idSnapshota)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;

                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (!eksperiment.IsDataLoaded())
                    return BadRequest(ErrorMessages.Unauthorized);
                Snapshot snapshot = db.dbeksperiment.dajSnapshot(idSnapshota);
                eksperiment.SaveDataset(snapshot.csv);
                return Ok("Sacuvan Snapshot.");
            }
            catch (MLException e)
            {
                return BadRequest(e.Message);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpPost("SaveAsSnapshot")]
        public IActionResult SacuvajSnapshot(int idEksperimenta, string naziv)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;

                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (!eksperiment.IsDataLoaded())
                    return BadRequest(ErrorMessages.Unauthorized);

                if (db.dbeksperiment.proveriSnapshot(idEksperimenta, naziv) == -1)
                {
                    string extension = db.dbeksperiment.uzmi_naziv_csv(idEksperimenta).Split(".")[^1];
                    if (!db.dbeksperiment.dodajSnapshot(idEksperimenta, naziv, $"{naziv}.{extension}"))
                        return BadRequest(ErrorMessages.FileNotGiven);
                }
                else
                    return BadRequest(ErrorMessages.DatasetVersionExists);
                Snapshot snapshot = db.dbeksperiment.dajSnapshot(db.dbeksperiment.proveriSnapshot(idEksperimenta, naziv));
                eksperiment.SaveDataset(snapshot.csv);
                return Ok(db.dbeksperiment.proveriSnapshot(idEksperimenta, naziv));
            }
            catch (MLException e)
            {
                return BadRequest(e.Message);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpDelete("Snapshot")]
        public IActionResult izbrisiSnapshot(int id)
        {
            try
            {
                if (db.dbeksperiment.izbrisiSnapshot(id))
                    if (db.dbmodel.zameniSnapshot(id))
                        return Ok("Izbrisan je model");
                else
                        return Ok("Izbrisan snapshot ali nema promenjenih modela");
                return StatusCode(500);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpGet("Snapshots")]
        public IActionResult dajlistuSnapshota(int id)
        {
            try
            {
                List<Snapshot> lista = db.dbeksperiment.listaSnapshota(id);
                return Ok(lista);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpGet("Snapshot")]
        public IActionResult dajSnapshot(int id)
        {
            try
            {
                int id1 = db.dbmodel.dajSnapshot(id);
                return Ok(db.dbeksperiment.dajSnapshot(id1));
            }
            catch
            {
                return StatusCode(500);
            }
        }

    }
}
