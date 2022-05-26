using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using dotNet.DBFunkcije;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;
using dotNet.Models;
using dotNet.MLService;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Text.Json.Nodes;
using Newtonsoft.Json.Linq;

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
                return BadRequest(ErrorMessages.ModelNotFound);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpPost("Modeli")]
        public IActionResult napraviModel(string ime, int id, string opis, int snapshot)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token);
                var tokenS = jsonToken as JwtSecurityToken;
                if (db.dbmodel.proveriModel(ime, id) != -1)
                {
                    return BadRequest(ErrorMessages.ModelExists);
                }
                if (db.dbmodel.dodajModel(ime, id, opis,snapshot))
                {
                    string path = Path.Combine(Directory.GetCurrentDirectory(), "Files", tokenS.Claims.ToArray()[0].Value.ToString(), id.ToString(), db.dbmodel.proveriModel(ime, id).ToString());
                    if (!Directory.Exists(path))
                        Directory.CreateDirectory(path);
                    return Ok(db.dbmodel.proveriModel(ime,id));
                }
                return StatusCode(500);
            }
            catch
            {
                return StatusCode(500);
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
                    return BadRequest(ErrorMessages.ModelExists);
                }
                if (db.dbmodel.promeniImeModela(ime, id))
                    return Ok("Promenjeno ime modela");
                return StatusCode(500);
            }
            catch
            {
                return StatusCode(500);
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
                return StatusCode(500);
            }
            catch 
            {
                return StatusCode(500);
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
                return StatusCode(500);
            }
            catch
            {
                return StatusCode(500);
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
                    return StatusCode(500);
                }
            }
            catch
            {
                return StatusCode(500);
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
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpGet("Model/Treniraj")]
        public IActionResult ModelTreniraj(int idEksperimenta, int id)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                Model model = db.dbmodel.model(id);

                if (!Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);

                eksperiment = Experiment.eksperimenti[idEksperimenta];
                /*if (!eksperiment.IsDataLoaded(model.Vlasnik))
                {
                    string csv = db.dbeksperiment.uzmi_naziv_csv(model.Vlasnik);
                    eksperiment.LoadDataset(model.Vlasnik, csv);
                }*/
                List<List<int>> kolone = db.dbmodel.Kolone(id);
                eksperiment.LoadInputs(kolone[0].ToArray());
                eksperiment.LoadOutputs(kolone[1].ToArray());
                ANNSettings podesavanja = db.dbmodel.podesavanja(id);
                int idSnapshot = db.dbmodel.dajSnapshot(id);
                if (idSnapshot == 0)
                {
                    eksperiment.SelectTrainingData(db.dbeksperiment.uzmi_naziv_csv(idEksperimenta));
                }
                else 
                {
                    Snapshot snapshot = db.dbeksperiment.dajSnapshot(db.dbmodel.dajSnapshot(id));
                    eksperiment.SelectTrainingData(snapshot.csv);
                }
                eksperiment.ApplySettings(podesavanja);
                eksperiment.Start(id);
                return Ok("Pocelo treniranje");
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
        [HttpPost("PostaviSnapshot")]
        public IActionResult postaviSnapshot(int model, int snapshot)
        {
            try
            {
                if(db.dbmodel.PostaviSnapshot(model, snapshot))
                    return Ok(snapshot);
                return StatusCode(500);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpGet("Kolone")]
        public IActionResult uzmiKolone(int idEksperimenta,int snapshot)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;

                if (!Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);

                eksperiment = Experiment.eksperimenti[idEksperimenta];
                if(snapshot == 0)
                {
                    string csv = db.dbeksperiment.uzmi_naziv_csv(idEksperimenta);
                    eksperiment.SelectTrainingData(csv);
                    string koloness = eksperiment.GetColumns(csv);
                    return Ok(koloness.Replace('\'', '"'));
                }
                Snapshot snapshot1 = db.dbeksperiment.dajSnapshot(snapshot);
                eksperiment.SelectTrainingData(snapshot1.csv);
                string kolones = eksperiment.GetColumns(snapshot1.csv);
                return Ok(kolones.Replace('\'', '"'));
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
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpGet("metrika")]
        public IActionResult getMetrics(int idEksperimenta, int modelId)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                string metrika;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                {
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                }
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);

                metrika = eksperiment.ComputeMetrics(modelId);
                Console.WriteLine(metrika);
                return Ok(metrika);
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
        [HttpPost("NoviModel")]
        public IActionResult noviModel(int idEksperimenta,[FromBody]NovModel model)
        {
            try
            {
                int modela = db.dbmodel.proveriModel(model.naziv, idEksperimenta);
                if(modela == -1)
                {
                    return Ok("-1");
                }
                return Ok(modela.ToString());
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpPost("KreirajNoviModel")]
        public IActionResult KreirajNoviModel(int idEksperimenta, [FromBody] NovModel model)
        {
            try
            {
                int modela = -1;
                if (db.dbmodel.dodajModel(model.naziv, idEksperimenta, model.opis, model.snapshot))
                {
                    modela = db.dbmodel.proveriModel(model.naziv, idEksperimenta);
                    if (db.dbmodel.izmeniPodesavanja(modela, model.podesavalja))
                    {
                        if (db.dbmodel.UpisiKolone(modela, model.kolone))
                        {
                            return Ok(modela);
                        }
                        return StatusCode(500);
                    }
                    return StatusCode(500);
                }
                return StatusCode(500);
                
            }
            catch
            {
                return StatusCode(500);
            }
        }
        [Authorize]
        [HttpPut("OverrideModel")]
        public IActionResult OverrideModel(int idEksperimenta, int idModela, [FromBody] NovModel model)
        {
            try
            {
                if (db.dbmodel.izmeniModel(idModela, model.naziv, idEksperimenta, model.opis, model.snapshot))
                {
                    if (db.dbmodel.izmeniPodesavanja(idModela, model.podesavalja))
                    {
                        if (db.dbmodel.UpisiKolone(idModela, model.kolone))
                        {
                            return Ok("Model was overrided successfully.");
                        }
                        return StatusCode(500);
                    }
                    return StatusCode(500);
                }
                return StatusCode(500);
                
            }
            catch
            {
                return StatusCode(500);
            }
        }

        //[Authorize]
        [HttpGet("LoadSelectedModel")]
        public IActionResult LoadSelectedModel(int idEksperimenta, int idModela)
        {
            try
            {
                var model = db.dbmodel.modelFull(idModela);
                if (model == null) return BadRequest(ErrorMessages.ModelNotFound);
                var snapshot = db.dbmodel.dajSnapshot(idModela);
                if (snapshot == -1) return StatusCode(500);
                var settings = db.dbmodel.podesavanja(idModela);
                if (settings == null) return StatusCode(500);
                var kolone = db.dbmodel.Kolone(idModela);

                var result = new Dictionary<string, object> {
                    { "General", model },
                    { "Snapshot", snapshot },
                    { "NetworkSettings", settings },
                    { "IOColumns", kolone }
                };

                return Ok(Newtonsoft.Json.JsonConvert.SerializeObject(result));
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpPost("predict")]
        public IActionResult Prediction(int idEksperimenta, int modelId, string[] inputs)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                string predikcija; 
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                {
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                }
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);

                /*for(int i = 0; i < inputs.Length; i++)
                {
                    Console.WriteLine(inputs[i]);
                }*/
                predikcija = eksperiment.Predict(inputs,modelId);
                return Ok(predikcija);
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
        [HttpPost("Save")]
        public IActionResult sacuvajModel(int ideksperimenta ,int idmodela)
        {
            try
            {
                MLExperiment eksperiment = Experiment.eksperimenti[ideksperimenta];

                ANNSettings podesavanja = db.dbmodel.podesavanja(idmodela);
                eksperiment.ApplySettings(podesavanja);
                eksperiment.CreateNewNetwork();

                Model model = db.dbmodel.model(idmodela);
                eksperiment.SaveModel(model.Name, idmodela);

                try {
                    string metrika = eksperiment.ComputeMetrics(idmodela);
                    JObject met = JObject.Parse(metrika);

                    if (podesavanja.ANNType == ProblemType.Regression)
                    {
                        StatisticsRegression rg = met.GetValue("train").ToObject<StatisticsRegression>();
                        db.dbmodel.upisiStatistiku(idmodela, rg);
                        return Ok("Model sacuvan");
                    }
                    else if (podesavanja.ANNType == ProblemType.Classification)
                    {
                        StatisticsClassification cs = met.GetValue("train").ToObject<StatisticsClassification>();
                        db.dbmodel.upisiStatistiku(idmodela, cs);
                        return Ok("Model sacuvan");
                    }
                }
                catch (MLException) {
                    if (podesavanja.ANNType == ProblemType.Regression)
                    {
                        StatisticsRegression reg = new(0, 0, 0, 0, 0);
                        db.dbmodel.upisiStatistiku(idmodela, reg);
                        return Ok("Model sacuvan");
                    }
                    else if (podesavanja.ANNType == ProblemType.Classification)
                    {
                        StatisticsClassification cls = new(0, 0, 0, 0, 0, 0, 0, null);
                        db.dbmodel.upisiStatistiku(idmodela, cls);
                        return Ok("Model sacuvan");
                    }
                }
                
                return BadRequest("Doslo do greske");
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
        [HttpPost("Model/Pauziraj")]
        public IActionResult ModelPauziraj(int idEksperimenta, int idModela)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;

                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                {
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                }
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);

                eksperiment.Stop(idModela);

                return Ok("Pauza");
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
        [HttpPost("Model/NastaviTrening")]
        public IActionResult ModelNastaviTrening(int idEksperimenta, int idModela)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;

                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                {
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                }
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);

                eksperiment.Continue(idModela);

                return Ok("Nastavak treniranja");
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
