using dotNet.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace dotNet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EksperimentController : ControllerBase
    {
        private IConfiguration _config;
        DBKonekcija db;
        public EksperimentController(IConfiguration config)
        {
            _config = config;
            db = new DBKonekcija(_config.GetConnectionString("connectionString"));
        }
        [Authorize]
        [HttpGet("Eksperimenti")]
        public IActionResult Experimenti(int id)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            List<EksperimentDto> eksperimenti = db.eksperimenti(int.Parse(tokenS.Claims.ToArray<Claim>()[0].Value));
            if (eksperimenti.Count > 0)
                return Ok(eksperimenti);

            return BadRequest();
        }

        [Authorize]
        [HttpGet("Modeli")]
        public IActionResult Modeli(int id) {
            List<ModelDto> modeli=db.modeli(id);
            if (modeli.Count > 0)
                return Ok(modeli);
        return BadRequest("Nema modela"); 
        }

        [Authorize]
        [HttpGet("Podesavanja")]
        public IActionResult Podesavanja(int id) {
            ANNSettings podesavanje = db.podesavanja(id);
            if(podesavanje != null)
                return Ok(podesavanje);
            return BadRequest("Ne postoje podesavanja za ovaj model");
        }

    }
}
