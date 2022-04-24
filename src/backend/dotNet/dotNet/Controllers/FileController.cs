﻿using Microsoft.AspNetCore.Http;
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
        DB db;
        private int ukupanBrRedovaFajla;
        //private static MLExperiment? experiment = null;

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
        public ActionResult Download(int idEksperimenta)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");

            /// TEMP
            if (token.Equals("") || token.Equals("st"))
            {
                string fileName1 = db.dbeksperiment.uzmi_naziv_csv(idEksperimenta);
                string path1 = System.IO.Path.Combine(
                    Directory.GetCurrentDirectory(), 
                    "Files", "1", 
                    idEksperimenta.ToString(), fileName1
                );

                return DownloadFile(fileName1, path1);
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

            return DownloadFile(fileName, path);
        }

        [HttpPost("downloadModel/{idEksperimenta}")]
        public ActionResult Download(int idEksperimenta, string modelName)
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

            return DownloadFile(fileName, path);
        }
        
        [Authorize]
        [HttpPost("GetImage")]
        public IActionResult GetImage(int idEksperimenta)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            Korisnik korisnik;

            if (new JwtSecurityTokenHandler().ReadToken(token) is JwtSecurityToken tokenS)
                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));
            else
                return BadRequest("Korisnik nije ulogovan.");

            string fileName = "requested_image.png";
            string filePath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "Files",
                korisnik.Id.ToString(),
                idEksperimenta.ToString(),
                fileName
            );

            return DownloadFile(fileName, filePath, "image/png") ;
        }


        // Upload
        private void UploadFile(IFormFile file, string fileDir)
        {
            if (!Directory.Exists(fileDir))
                Directory.CreateDirectory(fileDir);

            long length = file.Length;
            using var fileStream = file.OpenReadStream();
            byte[] bytes = new byte[length];
            fileStream.Read(bytes, 0, (int)file.Length);
            string fileName = file.FileName;
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
                string folderEksperiment = Path.Combine(
                    Directory.GetCurrentDirectory(), 
                    "Files", 
                    korisnik.Id.ToString(),
                    idEksperimenta.ToString()
                );

                // upis u fajl 
                UploadFile(file, folderEksperiment);

                // Ucitaj fajl na ml serveru
                try { eksperiment.LoadDataset(idEksperimenta, file.FileName); }
                catch (MLException) { return BadRequest("File nije ucitan u python."); }
            
                // upis csv-a u bazu 
                bool fajlNijeSmesten = db.dbeksperiment.dodajCsv(idEksperimenta, file.FileName);
                if (!fajlNijeSmesten)
                    return BadRequest("Neuspesan upis csv-a u bazu");

                return Ok("Fajl je upisan.");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                        return BadRequest("Fajl nije unet.");

                    // kreiranje foldera 
                    string folderEksperiment1 = Path.Combine(
                        Directory.GetCurrentDirectory() , 
                        "Files","1",
                        idEksperimenta.ToString()
                    );

                    // ucitavanje fajla 
                    UploadFile(file, folderEksperiment1);

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
                string folderEksperiment = Path.Combine(
                    Directory.GetCurrentDirectory() , 
                    "Files" , 
                    korisnik.Id.ToString(),
                    idEksperimenta.ToString()
                );

                // ucitavanje fajla 
                UploadFile(file, folderEksperiment);

                return Ok("Fajl je upisan.");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [HttpPost("uploadModel/{idEksperimenta}")]
        public IActionResult uploadModel(IFormFile file, int idEksperimenta, string modelName)
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
                    UploadFile(file, folderModeli1);

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
                string folderModeli = Path.Combine(
                    Directory.GetCurrentDirectory() , 
                    "Files" , 
                    korisnik.Id.ToString(),
                    idEksperimenta.ToString(),
                    "Models"
                );

                // Upis u fajl
                UploadFile(file, folderModeli);

                return Ok("Fajl je upisan.");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }









        [Authorize]
        [HttpPost("CreateSnapshot")]
        public IActionResult creirajSnapshot(int id, string naziv)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (eksperiment.IsDataLoaded(id))
                    return BadRequest("Nije unet dataset.");
                if (!db.dbeksperiment.dodajSnapshot(id, naziv, "test.csv"))
                    return BadRequest("Nije unet file.");
                eksperiment.SaveDataset();
                return Ok("Napravljen Snapshot");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                return BadRequest("Doslo do greske");
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
                return BadRequest("Doslo do greske!");
            }
        }
    }
}
