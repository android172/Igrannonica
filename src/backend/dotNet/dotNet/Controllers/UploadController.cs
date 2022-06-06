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
                string folder = kreirajFoldere(korisnik.Id, idEksperimenta);
                // ucitavanje bilo kog fajla 
                long length = file.Length;
                using var fileStream = file.OpenReadStream();
                byte[] bytes = new byte[length];
                fileStream.Read(bytes, 0, (int)file.Length);
                eksperiment.LoadDatasetTest(bytes, file.FileName);
                return Ok("Testni skup ucitan.");
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
        [HttpPost("setRatio/{ratio}")]
        public IActionResult setRatio(int idEksperimenta, float ratio)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (float.IsNaN(ratio))
                    return BadRequest(ErrorMessages.RatioNotGiven);
                eksperiment.TrainTestSplit(ratio);
                return Ok("Dodat ratio.");
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
        [HttpGet("paging/{page}/{size}")]
        public Paging Paging(int idEksperimenta, int page, int size)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                Korisnik korisnik;
                MLExperiment eksperiment;

                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return new Paging(null, 1);
                var j = page * size - size;
                int ukupanBrRedovaFajla = eksperiment.GetRowCount();

                if (j == ukupanBrRedovaFajla)
                {
                    page--;
                    j = page * size - size;
                }

                if (j + size > ukupanBrRedovaFajla)
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
        [HttpGet("ColumnTypes")]
        public IActionResult ColumnTypes(int idEksperimenta)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                string kolone = eksperiment.GetColumnTypes();
                return Ok(kolone);
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
        [HttpGet("ColumnsNumericalCheck")]
        public IActionResult ColumnsNumericalCheck(int idEksperimenta)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                string kolone = eksperiment.ColumnsNumericalCheck();
                return Ok(kolone);
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
    }
}
