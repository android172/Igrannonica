﻿using dotNet.DBFunkcije;
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
        public IActionResult Experimenti(int id)
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
                return BadRequest();
            }
            catch
            {
                return BadRequest("Doslo do greske");
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
                    return BadRequest("Postoji eksperiment sa tim imenom");
                }
                if (db.dbeksperiment.dodajEksperiment(ime, int.Parse(tokenS.Claims.ToArray()[0].Value)))
                {
                    int id = db.dbeksperiment.proveri_eksperiment(ime, int.Parse(tokenS.Claims.ToArray()[0].Value));
                    string folder = Path.Combine(Directory.GetCurrentDirectory(), "Files", tokenS.Claims.ToArray()[0].Value.ToString(), id.ToString());
                    if (!Directory.Exists(folder)) { Directory.CreateDirectory(folder); }
                    return Ok(id);
                }
                return BadRequest("Doslo do greske");
            }
            catch
            {
                return BadRequest("Doslo do greske");
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
                    return BadRequest("Postoji eksperiment sa tim imenom");
                }

                if (db.dbeksperiment.updateEksperient(id, ime))
                    return Ok("Promenjeno ime");
                return BadRequest("Doslo do greske");
            }
            catch
            {
                return BadRequest("Doslo do greske");
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
                            return BadRequest("Model nije izbrisan");
                        }
                    }
                }
                if (db.dbeksperiment.izbrisiEksperiment(id))
                    return Ok("Eksperiment obrisan");
                return BadRequest("Eksperiment nije obrisan");
            }
            catch
            {
                return BadRequest("Doslo do greske");
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
                    return BadRequest("Greska");
                }
            }
            catch
            {
                return BadRequest("Doslo do greske");
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
                    if (Korisnik.eksperimenti.ContainsKey(token.ToString()))
                    {
                        eksperiment = Korisnik.eksperimenti[token.ToString()];
                        if (!eksperiment.IsDataLoaded(id))
                            eksperiment.LoadDataset(id, csv);
                        return Ok(csv);
                    }
                    return BadRequest("Doslo do greske.");
                }
                return NotFound("Nema csv!");
            }
            catch
            {
                return BadRequest("Doslo do greske");
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
                return BadRequest("Ne postoje podesavanja za ovaj model");
            }
            catch
            {
                return BadRequest("Doslo do greske");
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
                return BadRequest("Doslo do greske");
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
                return BadRequest("Doslo do greske");
            }
            catch
            {
                return BadRequest("Doslo do greske");
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
                return BadRequest("Doslo je do greske");
            }
            catch
            {
                return BadRequest("Doslo do greske");
            }
        }
    }
}
