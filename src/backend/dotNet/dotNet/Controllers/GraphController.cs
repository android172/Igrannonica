using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using dotNet.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using System.Data.Common;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using dotNet.ModelValidation;
using Microsoft.Net.Http.Headers;
using dotNet.DBFunkcije;
using dotNet.MLService;

namespace dotNet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GraphController : ControllerBase
    {
        private IConfiguration _config;
        DB db;

        public GraphController(IConfiguration config)
        {
            _config = config;
            db = new DB(_config);
        }

        [Authorize]
        [HttpPost("scatterplot")]
        public IActionResult getScatterplot(int[] nizKolona)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    eksperiment = Korisnik.eksperimenti[token.ToString()];
                else
                    return null;
                eksperiment.DrawScatterPlot(nizKolona);
                return Ok("Scatterplot");
            }
            catch
            {
                return null;
            }
        }
    }
}
