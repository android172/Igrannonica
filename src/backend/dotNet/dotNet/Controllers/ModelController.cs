using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using dotNet.DBFunkcije;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;
using dotNet.Models;
using dotNet.MLService;
using Microsoft.AspNetCore.Authorization;
using System.Linq;

namespace dotNet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ModelController : ControllerBase
    {
        private IConfiguration _config;
        DB db;

        public ModelController(IConfiguration config)
        {
            _config = config;
            db = new DB(_config);
        }

        [Authorize]
        [HttpGet("Modeli/{id}")]
        public IActionResult Modeli(int id)
        {
            try
            {
                List<ModelDto> modeli = db.dbmodel.modeli(id);
                if (modeli.Count > 0)
                    return Ok(modeli);
                return BadRequest("Nema modela");
            }
            catch
            {
                return BadRequest("Doslo do greske");
            }
        }

        [Authorize]
        [HttpPost("Modeli")]
        public IActionResult napraviModel(string ime, int id, string opis)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token);
                var tokenS = jsonToken as JwtSecurityToken;
                if (db.dbmodel.proveriModel(ime, id) != -1)
                {
                    return BadRequest("Vec postoji model sa tim imenom");
                }
                if (db.dbmodel.dodajModel(ime, id, opis))
                {
                    string path = Path.Combine(Directory.GetCurrentDirectory(), "Files", tokenS.Claims.ToArray()[0].Value.ToString(), id.ToString(), db.dbmodel.proveriModel(ime, id).ToString());
                    if (!Directory.Exists(path))
                        Directory.CreateDirectory(path);
                    return Ok(db.dbmodel.proveriModel(ime,id));
                }
                return BadRequest("Doslo do greske");
            }
            catch
            {
                return BadRequest("Doslo do greske");
            }
        }

        [Authorize]
        [HttpPut("Modeli")]
        public IActionResult updateModel(string ime, int id, int ideksperimenta)
        {
            try
            {
                if (db.dbmodel.proveriModel(ime, ideksperimenta) != -1)
                {
                    return BadRequest("Vec postoji model sa tim imenom");
                }
                if (db.dbmodel.promeniImeModela(ime, id))
                    return Ok("Promenjeno ime modela");
                return BadRequest("Doslo do greske");
            }
            catch
            {
                return BadRequest("Doslo do greske");
            }
        }

        [Authorize]
        [HttpPut("Modeli/Opis")]
        public IActionResult updateOpisModela(int id, string opis)
        {
            try
            {
                if (db.dbmodel.promeniOpisModela(opis, id))
                {
                    return Ok("Opis promenjen");
                }
                return BadRequest("Opis nije promenjen");
            }
            catch 
            {
                return BadRequest("Doslo do greske.");
            }
        }
        [Authorize]
        [HttpDelete("Modeli/{id}")]
        public IActionResult izbrisiModel(int id)
        {
            try
            {
                if (db.dbmodel.izbrisiPodesavanja(id))
                {
                    db.dbmodel.izbrisiModel(id);
                    return Ok("Model izbrisan");
                }
                return BadRequest("Model nije izbrisan");
            }
            catch
            {
                return BadRequest("Doslo do greske");
            }
        }

        [Authorize]
        [HttpGet("Model/Naziv/{id}")]
        public IActionResult ModelNaziv(int id)
        {
            try
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
            catch
            {
                return BadRequest("Doslo do greske");
            }
        }

        [Authorize]
        [HttpGet("Model")]
        public IActionResult ModelDetaljnije(int id)
        {
            try
            {
                return Ok(db.dbmodel.detaljnije(id));
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpGet("Model/Treniraj")]
        public IActionResult ModelTreniraj(int id)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                Model model = db.dbmodel.model(id);
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                {
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                    /*if (!eksperiment.IsDataLoaded(model.Vlasnik))
                    {
                        string csv = db.dbeksperiment.uzmi_naziv_csv(model.Vlasnik);
                        eksperiment.LoadDataset(model.Vlasnik, csv);
                    }*/
                    List<List<int>> kolone = db.dbmodel.Kolone(id);
                    eksperiment.LoadInputs(kolone[0].ToArray());
                    eksperiment.LoadOutputs(kolone[1].ToArray());
                    ANNSettings podesavanja = db.dbmodel.podesavanja(id);
                    Snapshot snapshot = db.dbeksperiment.dajSnapshot(db.dbmodel.dajSnapshot(id));
                    eksperiment.SelectTraningData(snapshot.csv);
                    eksperiment.ApplySettings(podesavanja);
                    eksperiment.Start();
                    return Ok("Pocelo treniranje");
                }
                return BadRequest("Greska");
            }
            catch
            {
                return BadRequest("Doslo do greske");
            }
        }

        [Authorize]
        [HttpPost("PostaviSnapshot")]
        public IActionResult postaviSnapshot(int model, int snapshot)
        {
            try
            {
                if(db.dbmodel.PostaviSnapshot(model, snapshot))
                    return Ok(snapshot);
                return BadRequest("Nije sacuvan.");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpGet("Kolone")]
        public string uzmiKolone(int snapshot)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                {
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                    Snapshot snapshot1 = db.dbeksperiment.dajSnapshot(snapshot);
                    eksperiment.SelectTraningData(snapshot1.csv);
                    string kolones = eksperiment.GetColumns(snapshot1.csv);
                    return kolones.Replace('\'', '"');
                    //return kolones;
                }
                return null;
                //return BadRequest("Ponovo se prijavi.");
            }
            catch
            {
                return null;
             //   return BadRequest("Doslo do greske.");
            }
        }

        [Authorize]
        [HttpGet("Detaljnije")]
        public IActionResult detaljnije(int id)
        {
            try
            {
                ModelDetaljnije model = db.dbmodel.detaljnije(id);
                return Ok(model);
            }
            catch
            {
                return BadRequest("Doslo do greske");
            }
        }
    }
}
