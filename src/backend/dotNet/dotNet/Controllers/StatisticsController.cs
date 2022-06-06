using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using dotNet.DBFunkcije;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;
using dotNet.Models;
using dotNet.MLService;
using Microsoft.AspNetCore.Authorization;

namespace dotNet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        private IConfiguration _config;
        DB db;

        public StatisticsController(IConfiguration config)
        {
            _config = config;
            db = new DB(_config);
        }


        [Authorize]
        [HttpGet("statistika")]
        public IActionResult getStat(int idEksperimenta)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                string statistika = eksperiment.ColumnStatistics();
                return Ok(statistika);
                
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


        [HttpPost("Upload/Regresija")]
        public IActionResult novaMetrikaRegresija(int id, [FromBody] StatisticsRegression statistika)
        {
            try
            {
                if (db.dbmodel.upisiStatistiku(id, statistika,""))
                {
                    return Ok();
                }
                return StatusCode(500);
            }
            catch
            {
                return StatusCode(500);
            }
        }
        [HttpPost("Upload/Klasifikacija")]
        public IActionResult novaMetrikaRegresija(int id, [FromBody] StatisticsClassification statistika)
        {
            try
            {
                Console.WriteLine(id.ToString() + " " + statistika.Precision.ToString());
                if (db.dbmodel.upisiStatistiku(id, statistika,null))
                {
                    return Ok(1);
                }
                return StatusCode(500);
            }
            catch
            {
                return StatusCode(500);
            }
        }
        [HttpGet("Eksperiment")]
        public IActionResult eksperimentStatistika(int id)
        {
            try
            {
                return Ok(new Statistic(db.dbmodel.eksperimentKlasifikacija(id), db.dbmodel.eksperimentRegression(id)));
            }
            catch
            {
                return StatusCode(500);
            }
        }
        [HttpGet("Model")]
        public IActionResult modelStatistika(int id)
        {
            try
            {
                Classification sc = db.dbmodel.modelKlasifikacija(id);
                if(sc !=null)
                    return Ok(sc);
                List<Regression> sr = db.dbmodel.modelRegresija(id);
                if(sr !=null)
                    return Ok(sr);
                return Ok();
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [HttpGet("Comparison")]
        public IActionResult Comparison(int experimentId, int modelId)
        {
            try {
                Model model = db.dbmodel.model(modelId);
                if (model == null || model.Vlasnik != experimentId)
                    return BadRequest(ErrorMessages.Unauthorized);

                Classification classification = db.dbmodel.modelKlasifikacija(modelId);
                if (classification != null)
                    return Ok(db.dbmodel.ComparableClassification(experimentId, classification.Kolona));

                List<Regression> regression = db.dbmodel.modelRegresija(modelId);
                string[] outputColumns = new string[regression.Count];
                for (int i = 0; i < regression.Count; i++)
                    outputColumns[i] = regression[i].Kolona;

                return Ok(db.dbmodel.ComparableRegression(experimentId, outputColumns));
            }
            catch {
                return StatusCode(500);
            }
        }
    }
}
