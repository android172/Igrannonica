using dotNet.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet("Eksperimenti")]
        public IActionResult experimenti(int id)
        {
            List<EksperimentDto> eksperimenti = db.eksperimenti(id);
            if (eksperimenti.Count > 0)
                return Ok(eksperimenti);

            return BadRequest();
        }


        [HttpGet("Modeli")]
        public IActionResult modeli(int id) {
            List<ModelDto> modeli=db.modeli(id);
            if (modeli.Count > 0)
                return Ok(modeli);
        return BadRequest("Nema modela"); 
        }

        [HttpGet("Podesavanja")]
        public IActionResult podesavanja(int id) {
            ANNSettings podesavanje = db.podesavanja(id);
            if(podesavanja != null)
                return Ok(podesavanje);
            return BadRequest("Ne postoje podesavanja za ovaj model");
        }

    }
}
