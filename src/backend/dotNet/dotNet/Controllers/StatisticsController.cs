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
    }
}
