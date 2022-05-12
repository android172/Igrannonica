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
        public string getStat()
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return null;
                string statistika = eksperiment.ColumnStatistics();
                return statistika;
            }
            catch
            {
                return null;
            }
        }

        
        [HttpPost("Upload/Regresija")]
        public IActionResult novaMetrikaRegresija(int id, [FromBody] StatisticsRegression statistika)
        {
            try
            {
                if(db.dbmodel.upisiStatistiku(id,statistika))
                {
                    return Ok();
                }
                return BadRequest();
            }
            catch
            {
                return BadRequest();
            }
        }
        [HttpPost("Upload/Klasifikacija")]
        public IActionResult novaMetrikaRegresija(int id, [FromBody] StatisticsClassification statistika)
        {
            try
            {
                Console.WriteLine(id.ToString()+" " + statistika.Precision.ToString());
                if (db.dbmodel.upisiStatistiku(id, statistika))
                {
                    return Ok(1);
                }
                return BadRequest();
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.Message);
                return BadRequest("Doslo do greske.");
            }
        }
    }
}
