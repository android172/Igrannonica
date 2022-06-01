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
                {
                    Console.WriteLine("Update-ovan model " + id.ToString());
                    return Ok("Promenjeno ime modela");
                }
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
                    Console.WriteLine("Promenjen opis modela" + id.ToString());
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
                    Console.WriteLine("Izbrisan model "+id.ToString());
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
                Console.WriteLine("Detaljnije o modelu" + id);
                return Ok(db.dbmodel.detaljnije(id));
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpPost("Model/Treniraj")]
        public IActionResult ModelTreniraj(int idEksperimenta, [FromBody] TrainingData trainingData)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;

                // Error checks
                if (!Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (trainingData == null)
                    return BadRequest(ErrorMessages.NoTrainingData);
                if (trainingData.Columns == null)
                    return BadRequest(ErrorMessages.NoTrainingData);
                if (trainingData.AnnSettings == null)
                    return BadRequest(ErrorMessages.NoTrainingData);

                eksperiment = Experiment.eksperimenti[idEksperimenta];


                int idSnapshot = trainingData.Snapshot;
                if (idSnapshot == 0)
                    eksperiment.SelectTrainingData(db.dbeksperiment.uzmi_naziv_csv(idEksperimenta));
                else  {
                    Snapshot snapshot = db.dbeksperiment.dajSnapshot(idSnapshot);
                    eksperiment.SelectTrainingData(snapshot.csv);
                }

                eksperiment.LoadInputs(trainingData.Columns.ulazne);
                eksperiment.LoadOutputs(trainingData.Columns.izlazne);

                ANNSettings podesavanja = trainingData.AnnSettings;
                eksperiment.ApplySettings(podesavanja);

                eksperiment.CreateNewNetwork();
                eksperiment.Start(trainingData.ModelId);

                Console.WriteLine("Otpocelo treniranje");
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
                if (db.dbmodel.PostaviSnapshot(model, snapshot)) { 
                    Console.WriteLine("Postavljen snapshot "+snapshot.ToString()+" za model "+model.ToString());
                    return Ok(snapshot);
                }
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
                Console.WriteLine("Vracene kolone za snapshot " + snapshot.ToString());
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
                Console.WriteLine("Detaljnije o modelu "+id.ToString());
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
                Console.WriteLine("Vracena metrika za model " + modelId);
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
        public IActionResult noviModel(int idEksperimenta, string model)
        {
            try
            {
                int modela = db.dbmodel.proveriModel(model, idEksperimenta);
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
                            Console.WriteLine("Kreiran novi model");
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
                            
                            db.dbmodel.izbrisiRegStatistiku(idModela);
                            db.dbmodel.izbrisiClasStatistiku(idModela);
                            Console.WriteLine("Model was overrided successfully.");
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
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;

                if (!Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment = Experiment.eksperimenti[idEksperimenta];

                var model = db.dbmodel.modelFull(idModela);
                if (model == null) return BadRequest(ErrorMessages.ModelNotFound);
                var snapshotId = db.dbmodel.dajSnapshot(idModela);
                if (snapshotId == -1) return StatusCode(500);
                var settings = db.dbmodel.podesavanja(idModela);
                if (settings == null) return StatusCode(500);
                var kolone = db.dbmodel.Kolone(idModela);

                // Select snapshot
                if (snapshotId == 0)
                    eksperiment.LoadDataset(db.dbeksperiment.uzmi_naziv_csv(idEksperimenta));
                else {
                    Snapshot snapshot = db.dbeksperiment.dajSnapshot(snapshotId);
                    eksperiment.LoadDataset(snapshot.csv);
                }

                // I/O
                eksperiment.LoadInputs(kolone[0].ToArray());
                eksperiment.LoadOutputs(kolone[1].ToArray());

                // Ann settings
                eksperiment.ApplySettings(settings);

                // Save as new model
                eksperiment.CreateNewNetwork();

                // Load weights
                eksperiment.LoadModel(model.Name, idModela);
                var weights = eksperiment.GetWeights();

                var result = new Dictionary<string, object> {
                    { "General", model },
                    { "Snapshot", snapshotId },
                    { "NetworkSettings", settings },
                    { "IOColumns", kolone },
                    { "Weights", weights }
                };
                Console.WriteLine("Load-an model "+idModela);
                return Ok(Newtonsoft.Json.JsonConvert.SerializeObject(result));
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

                predikcija = eksperiment.Predict(inputs,modelId);
                Console.WriteLine("Predikcija za model " + modelId.ToString() + ": " + predikcija);
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

        private void saveModelStatistics(int modelId, StatisticsRegression stats, string Kolona) {
            try
            {
                db.dbmodel.upisiStatistiku(modelId, stats, Kolona);
            }
            catch
            {
                db.dbmodel.prepisiStatistiku(modelId, stats, Kolona);
            }
        }
        private void saveModelStatistics(int modelId, StatisticsClassification stats,string Kolona)
        {
            try
            {
                db.dbmodel.upisiStatistiku(modelId, stats,Kolona);
            }
            catch
            {
                db.dbmodel.prepisiStatistiku(modelId, stats,Kolona);
            }
        }

        [HttpPost("Save")]
        public IActionResult sacuvajModel(int ideksperimenta, int modelIdOld, int modelIdNew)
        {
            try
            {
                MLExperiment eksperiment = Experiment.eksperimenti[ideksperimenta];

                Model model = db.dbmodel.model(modelIdNew);
                
                ANNSettings podesavanja = db.dbmodel.podesavanja(modelIdNew);
                List<List<int>>  kolone = db.dbmodel.Kolone(modelIdNew);
                int          snapshotid = db.dbmodel.dajSnapshot(modelIdNew);

                string snapshotName = "";
                if (snapshotid != 0)
                    snapshotName = db.dbeksperiment.dajSnapshot(snapshotid).csv;
                else
                    snapshotName = db.dbeksperiment.uzmi_naziv_csv(ideksperimenta);

                JArray kol = JArray.Parse(eksperiment.GetColumns(snapshotName));

                if (modelIdOld == -1) {
                    // Select snapshot
                    eksperiment.LoadDataset(snapshotName);

                    // I/O
                    eksperiment.LoadInputs(kolone[0].ToArray());
                    eksperiment.LoadOutputs(kolone[1].ToArray());

                    eksperiment.ApplySettings(podesavanja);
                    eksperiment.CreateNewNetwork();

                    // Save model weights
                    eksperiment.SaveModel(model.Name, modelIdOld);

                    // Save model statistics
                    if (podesavanja.ANNType == ProblemType.Regression) {
                        StatisticsRegression reg = new StatisticsRegression(0f, 0f, 0f, 0f, 0f);
                        foreach (var i in kolone[1])
                            saveModelStatistics(modelIdNew, reg, kol[i].ToString());
                        return Ok("Model sacuvan");
                    }
                    else if (podesavanja.ANNType == ProblemType.Classification) {
                        string kolonestr = "";
                        for (int i = 0; i < kolone[1].Count; i++) {
                            kolonestr += kol[kolone[1][i]];
                            if (i < kolone[1].Count - 1) kolonestr += ", ";
                        }
                        StatisticsClassification cls = new StatisticsClassification(0f, 0f, 0f, 0f, 0f, 0f, 0f, null);
                        saveModelStatistics(modelIdNew, cls, kolonestr);
                        return Ok("Model sacuvan");
                    }
                }
                else {
                    if (modelIdNew != modelIdOld)
                        eksperiment.MergeModels(modelIdOld, modelIdNew);

                    // Save model weights
                    eksperiment.SaveModel(model.Name, modelIdOld);

                    // Save model statistics
                    string metrika = eksperiment.ComputeMetrics(modelIdOld);
                    JObject met = JObject.Parse(metrika);

                    if (podesavanja.ANNType == ProblemType.Regression) {
                        int k = 0;
                        foreach(JToken i  in met.GetValue("train").Values()) {
                            StatisticsRegression rg = i.ToObject<StatisticsRegression>();
                            saveModelStatistics(modelIdNew, rg, kol[kolone[1][k]].ToString());
                            k++;
                        }
                        return Ok("Model sacuvan");
                    }
                    else if (podesavanja.ANNType == ProblemType.Classification) {
                        var cs = met.GetValue("train")["0"].ToObject<StatisticsClassification>();
                        string kolonestr = "";
                        for(int i=0;i<kolone[1].Count; i++)
                        {
                            kolonestr += kol[kolone[1][i]];
                            if (i < kolone[1].Count - 1) kolonestr += ", ";
                        }
                        saveModelStatistics(modelIdNew, cs,kolonestr);
                        return Ok("Model sacuvan");
                    }
                }
                
                return BadRequest("Doslo do greske");
            }
            catch (MLException e)
            {
                return BadRequest(e.Message);
            }
            catch(Exception e)
            {
                return BadRequest(e);
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
                Console.WriteLine("Model pauziran");
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
        public IActionResult ModelNastaviTrening(int idEksperimenta, int idModela, int numberOfEpoch, float learningRate)
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

                eksperiment.Continue(idModela, numberOfEpoch, learningRate);
                Console.WriteLine("Model " + idModela + " nastavio sa treniranjem");
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

        [Authorize]
        [HttpPost("Model/PrekiniTrening")]
        public IActionResult ModelPrekiniTrening(int idEksperimenta, int idModela)
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

                eksperiment.Dismiss(idModela);
                Console.WriteLine("Trening prekinut.");
                return Ok("Trening prekinut.");
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
