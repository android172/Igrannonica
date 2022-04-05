using dotNet.DBFunkcije;
using dotNet.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Newtonsoft.Json;

namespace dotNet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EksperimentController : ControllerBase
    {
        private IConfiguration _config;
        DB db;
        string id,bs,lr,ins,noe,os,lf,rm,rr,o;
     
        public EksperimentController(IConfiguration config)
        {
            _config = config;
            db = new DB(_config);
        }
        [Authorize]
        [HttpGet("Eksperimenti")]
        public IActionResult Experimenti(int id)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            List<EksperimentDto> eksperimenti = db.dbeksperiment.eksperimenti(int.Parse(tokenS.Claims.ToArray<Claim>()[0].Value));
            if (eksperimenti.Count > 0)
                return Ok(eksperimenti);
            return BadRequest();
        }
        [Authorize]
        [HttpPost("Eksperiment")]
        public IActionResult Eksperiment(string ime)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            if (db.dbeksperiment.proveri_eksperiment(ime, int.Parse(tokenS.Claims.ToArray()[0].Value)) != -1)
            {
                return BadRequest("Postoji eksperiment sa tim imenom");
            }

            if (db.dbeksperiment.dodajEksperiment(ime, int.Parse(tokenS.Claims.ToArray()[0].Value))) {
                int id = db.dbeksperiment.proveri_eksperiment(ime, int.Parse(tokenS.Claims.ToArray()[0].Value));
                string folder = Path.Combine(Directory.GetCurrentDirectory(), "Files", tokenS.Claims.ToArray()[0].Value.ToString(), id.ToString());
                if(!Directory.Exists(folder)) { Directory.CreateDirectory(folder); }
                return Ok(id);
            }
            return BadRequest("Doslo do greske");
        }
        [Authorize]
        [HttpPut("Eksperiment")]
        public IActionResult updateEksperiment(int id, string ime)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            if (db.dbeksperiment.proveri_eksperiment(ime, int.Parse(tokenS.Claims.ToArray()[0].Value)) != -1)
            {
                return BadRequest("Postoji eksperiment sa tim imenom");
            }

            if (db.dbeksperiment.updateEksperient(id, ime))
                return Ok("Promenjeno ime");
            return BadRequest("Doslo do greske");
        }



        [Authorize]
        [HttpGet("Modeli/{id}")]
        public IActionResult Modeli(int id) {
            List<ModelDto> modeli = db.dbmodel.modeli(id);
            if (modeli.Count > 0)
                return Ok(modeli);
            return BadRequest("Nema modela");
        }
        [Authorize]
        [HttpPost("Modeli")]
        public IActionResult napraviModel(string ime, int id)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            if (db.dbmodel.proveriModel(ime, id)!=-1)
            {
                return BadRequest("Vec postoji model sa tim imenom");
            }
            if (db.dbmodel.dodajModel(ime, id))
            {
                
                string path = Path.Combine(Directory.GetCurrentDirectory(), "Files", tokenS.Claims.ToArray()[0].Value.ToString(), id.ToString(), db.dbmodel.proveriModel(ime, id).ToString());
                if(!Directory.Exists(path))
                    Directory.CreateDirectory(path);
                return Ok("Napravljen model");
            }
            return BadRequest("Doslo do greske");
        }
        [Authorize]
        [HttpPut("Modeli")]
        public IActionResult updateModel(string ime, int id, int ideksperimenta)
        {
            if (db.dbmodel.proveriModel(ime, ideksperimenta)!=-1)
            {
                return BadRequest("Vec postoji model sa tim imenom");
            }
            if (db.dbmodel.promeniImeModela(ime, id))
                return Ok("Promenjeno ime modela");
            return BadRequest("Doslo do greske");
        }
        [Authorize]
        [HttpDelete("Modeli/{id}")]
        public IActionResult izbrisiModel(int id)
        {
            if (db.dbmodel.izbrisiPodesavanja(id))
            {
                db.dbmodel.izbrisiModel(id);
                return Ok("Model izbrisan");
            }
            return BadRequest("Model nije izbrisan");
        }

        [Authorize]
        [HttpGet("Podesavanja/{id}")]
        public IActionResult Podesavanja(int id) {
            ANNSettings podesavanje = db.dbmodel.podesavanja(id);
            if (podesavanje != null)
            {
                return Ok(podesavanje);
            }
            return BadRequest("Ne postoje podesavanja za ovaj model");
        }
        [Authorize]
        [HttpGet("Podesavanja/Kolone")]
        public IActionResult Kolone(int id)
        {
            return Ok(db.dbmodel.Kolone(id));
        }
        [Authorize]
        [HttpPut("Podesavanja")]
        public IActionResult updatePodesavanja(string json)//JObject json = JObject.Parse(str)
        {
            Console.WriteLine(json);
            List<Podesavanja> json1 = JsonConvert.DeserializeObject<List<Podesavanja>>(json);
            foreach (var item in json1)
            {
                id = item.id;
                bs = item.BatchSize;
                lr = item.LearningRate;
                ins = item.InputSize;
                noe = item.NumberOfEpochs;
                os = item.OutputSize;
                lf = item.LossFunction;
                rm = item.RegularizationMethod;
                rr = item.RegularizationRate;
                o = item.Optimizer;
            }
            if (db.dbmodel.izmeniPodesavanja(id,bs,lr,ins,noe,os,lf,rm,rr,o))
                return Ok("Izmenjena podesavanja.");
            return BadRequest("Doslo je do greske");
        }

        [Authorize]
        [HttpGet("Eksperiment/Naziv/{id}")]
        public IActionResult ExperimentNaziv(int id)
        {
            string naziv = db.dbeksperiment.uzmi_naziv(id);
            if (naziv != "")
            {
                return Ok(naziv);
            }
            else
            {
                return BadRequest("Greska");
            }
        }

        [Authorize]
        [HttpGet("Model/Naziv/{id}")]
        public IActionResult ModelNaziv(int id)
        {
            string naziv = db.dbmodel.uzmi_nazivM(id);
            if (naziv != "")
            {
                return Ok(naziv);
            }
            else
            {
                return BadRequest("Greska");
            }
        }
    }
}
