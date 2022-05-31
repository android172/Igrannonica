using dotNet.DBFunkcije;
using dotNet.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Newtonsoft.Json;
using dotNet.MLService;

namespace dotNet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EksperimentController : ControllerBase
    {
        private IConfiguration _config;
        DB db;

        public EksperimentController(IConfiguration config)
        {
            _config = config;
            db = new DB(_config);
        }

        [Authorize]
        [HttpGet("Eksperimenti")]
        public IActionResult Experimenti()
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token);
                var tokenS = jsonToken as JwtSecurityToken;
                List<EksperimentDto> eksperimenti = db.dbeksperiment.eksperimenti(int.Parse(tokenS.Claims.ToArray<Claim>()[0].Value));
                if (eksperimenti.Count > 0)
                    return Ok(eksperimenti);
                
                //return BadRequest(ErrorMessages.NoExperiments);
                return Ok(0);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpPost("load")]
        public IActionResult LoadExperiment(int id) {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                if (!Experiment.eksperimenti.ContainsKey(id))
                    Experiment.eksperimenti[id] = new MLExperiment(_config, token, id);
                return Ok();
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpPost("Eksperiment")]
        public IActionResult Eksperiment(string ime)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token);
                var tokenS = jsonToken as JwtSecurityToken;
                if (db.dbeksperiment.proveri_eksperiment(ime, int.Parse(tokenS.Claims.ToArray()[0].Value)) != -1)
                {
                    return BadRequest(ErrorMessages.ExperimentNameExists);
                }
                if (db.dbeksperiment.dodajEksperiment(ime, int.Parse(tokenS.Claims.ToArray()[0].Value)))
                {
                    int id = db.dbeksperiment.proveri_eksperiment(ime, int.Parse(tokenS.Claims.ToArray()[0].Value));
                    string folder = Path.Combine(Directory.GetCurrentDirectory(), "Files", tokenS.Claims.ToArray()[0].Value.ToString(), id.ToString());
                    if (!Directory.Exists(folder)) { Directory.CreateDirectory(folder); }
                    Experiment.eksperimenti[id] = new MLExperiment(_config, token, id);
                    return Ok(id);
                }
                return StatusCode(500);
            }
            catch
            {
                return StatusCode(500);
            }
        }
        [Authorize]
        [HttpPost("Eksperiment/{ime}")]
        public IActionResult ProveriNazivEksperimenta(string ime)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token);
                var tokenS = jsonToken as JwtSecurityToken;
                if (db.dbeksperiment.proveri_eksperiment(ime, int.Parse(tokenS.Claims.ToArray()[0].Value)) != -1)
                {
                    return Ok(1); // ako vec postoji
                }
                else
                {
                    return Ok(0);
                }
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpPut("Eksperiment")]
        public IActionResult updateEksperiment(int id, string ime)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token);
                var tokenS = jsonToken as JwtSecurityToken;
                if (db.dbeksperiment.proveri_eksperiment(ime, int.Parse(tokenS.Claims.ToArray()[0].Value)) != -1)
                {
                    return BadRequest(ErrorMessages.ExperimentNameExists);
                }

                if (db.dbeksperiment.updateEksperient(id, ime))
                    return Ok("Promenjeno ime");
                return StatusCode(500);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpDelete("Eksperiment/{id}")]
        public IActionResult izbrisiEksperiment(int id)
        {
            try
            {
                List<ModelDto> lista = db.dbmodel.modeli(id);
                foreach (ModelDto model in lista)
                {
                    if (db.dbmodel.izbrisiPodesavanja(model.Id))
                    {
                        if (!db.dbmodel.izbrisiModel(model.Id))
                        {
                            return BadRequest(ErrorMessages.CantDeleteModel);
                        }
                    }
                }
                if (db.dbeksperiment.izbrisiEksperiment(id))
                    return Ok("Eksperiment obrisan");
                return StatusCode(500);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpGet("Eksperiment/Naziv/{id}")]
        public IActionResult ExperimentNaziv(int id)
        {
            try
            {
                string naziv = db.dbeksperiment.uzmi_naziv(id);
                if (naziv != "")
                {
                    return Ok(naziv);
                }
                else
                {
                    return StatusCode(500);
                }
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpGet("Eksperiment/Csv")]
        public IActionResult EksperimentCsv(int id)
        {
            try
            {
                string csv = db.dbeksperiment.uzmi_naziv_csv(id);
                if (csv != "")
                {

                    var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                    MLExperiment eksperiment;
                    if (Experiment.eksperimenti.ContainsKey(id))
                    {

                        eksperiment = Experiment.eksperimenti[id];
                        if (!eksperiment.IsDataLoaded())
                        {

                            eksperiment.LoadDataset(csv);
                        }
                        return Ok(csv);
                    }

                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                }

                return NotFound(ErrorMessages.FileNotFound);
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
        [HttpPost("Eksperiment/Csv")]
        public IActionResult UcitajSnapshotcsv(int idEksperimenta,int idSnapshota)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                {
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                }
                else return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if(idSnapshota == 0)
                {
                    eksperiment.LoadDataset(db.dbeksperiment.uzmi_naziv_csv(idEksperimenta));
                    return Ok();
                }
                Snapshot snapshot = db.dbeksperiment.dajSnapshot(idSnapshota);
                Console.WriteLine(snapshot.csv);
                eksperiment.LoadDataset(snapshot.csv);
                return Ok();
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


        // ovde

        [Authorize]
        [HttpGet("Podesavanja/{id}")]
        public IActionResult Podesavanja(int id)
        {
            try
            {
                ANNSettings podesavanje = db.dbmodel.podesavanja(id);
                if (podesavanje != null)
                {
                    return Ok(podesavanje);
                }
                return BadRequest(ErrorMessages.SettingsNotFound);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpGet("Podesavanja/Kolone")]
        public IActionResult Kolone(int id)
        {
            try
            {
                return Ok(db.dbmodel.Kolone(id));
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpPost("Podesavanja/Kolone")]
        public IActionResult UcitajKolone(int id, [FromBody] Kolone kolone)
        {
            try
            {
                if (db.dbmodel.UpisiKolone(id, kolone))
                    return Ok(kolone);
                return StatusCode(500);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpPut("Podesavanja")]
        public IActionResult updatePodesavanja(int id, [FromBody] ANNSettings json)
        {
            try
            {
                if (db.dbmodel.izmeniPodesavanja(id, json))
                    return Ok("Izmenjena podesavanja.");
                return StatusCode(500);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpPost("Undo")]
        public IActionResult undoAction(int idEksperimenta)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.Undo();
                return Ok("undo uradjen");
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
        [HttpPost("Redo")]
        public IActionResult redoAction(int idEksperimenta)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.Redo();
                return Ok("redo uradjen");
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
        
        [HttpGet("Statistika")]
        public IActionResult statistika(int idEksperimenta)
        {
            try
            {
                List<Regression> reg = db.dbmodel.eksperimentRegression(idEksperimenta);
                List<Classification> clas = db.dbmodel.eksperimentKlasifikacija(idEksperimenta);
                return Ok(new { reg, clas });
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}
