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
        [HttpPost("Eksperiment")]
        public IActionResult Eksperiment(string ime)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            if(db.proveri_eksperiment(ime, int.Parse(tokenS.Claims.ToArray()[0].Value)))
            {
                return BadRequest("Postoji eksperiment sa tim imenom");
            }

            if(db.dodajEksperiment(ime, int.Parse(tokenS.Claims.ToArray()[0].Value)))
                return Ok("Dodat eksperiment");
            return BadRequest("Doslo do greske");
        }
        [Authorize]
        [HttpPut("Eksperiment")]
        public IActionResult updateEksperiment(int id,string ime)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            if (db.proveri_eksperiment(ime, int.Parse(tokenS.Claims.ToArray()[0].Value)))
            {
                return BadRequest("Postoji eksperiment sa tim imenom");
            }

            if (db.updateEksperient(id, ime))
                return Ok("Promenjeno ime");
            return BadRequest("Doslo do greske");
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
        [HttpPost("Modeli")]
        public IActionResult napraviModel(string ime,int id)
        {
            if(db.proveriModel(ime, id))
            {
                return BadRequest("Vec postoji model sa tim imenom");
            }
            if (db.dodajModel(ime, id))
                return Ok("Napravljen model");
            return BadRequest("Doslo do greske");
        }
        [Authorize]
        [HttpPut("Modeli")]
        public IActionResult updateModel(string ime, int id,int ideksperimenta)
        {
            if (db.proveriModel(ime, ideksperimenta))
            {
                return BadRequest("Vec postoji model sa tim imenom");
            }
            if (db.promeniImeModela(ime, id))
                return Ok("Promenjeno ime modela");
            return BadRequest("Doslo do greske");
        }
        [Authorize]
        [HttpDelete("Modeli")]
        public IActionResult izbrisiModel(int id)
        {
            if (db.izbrisiModel(id))
            {
                return Ok("Model izbrisan");
            }
            return BadRequest("Model nije izbrisan");
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
