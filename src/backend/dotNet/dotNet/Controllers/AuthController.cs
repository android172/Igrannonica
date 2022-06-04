using dotNet.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
using dotNet.SingalR;

namespace dotNet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private IConfiguration _config;
        private DB db;
        public AuthController(IConfiguration config)
        {
            _config = config;
            db = new DB(_config); 
        }
        [AllowAnonymous]
        [HttpPost]
        public IActionResult Login([FromBody] KorisnikDto korisnik)
        {
            try
            {
                var user = Authenticate(korisnik);
                if (user != null)
                {
                    var token = Generate(user);
                    Osvezi(user.Id, token);
                    return Ok(token);
                }
                return NotFound("ERROR :: Requested user doesn't exist.");
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        private string Generate(Korisnik user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier,user.Id.ToString()),
 
                new Claim(ClaimTypes.Name,user.KorisnickoIme),
                new Claim(ClaimTypes.Email,user.Email),
                new Claim(ClaimTypes.GivenName,user.Ime)
            };

            var token = new JwtSecurityToken(_config["Jwt:ValidIssuer"], _config["Jwt:ValidAudience"], claims, expires: DateTime.Now.AddDays(1), signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private void Osvezi(int id,string token)
        {
            try
            {

            foreach(var i in db.dbeksperiment.eksperimenti(id))
            {
                Experiment.eksperimenti[i.Id].SetupUser(token,i.Id);
            }
            /*foreach(var i in EksperimentHub.users) {
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadJwtToken(i.Key);
                var tokenS = jsonToken as JwtSecurityToken;
                if (id == int.Parse(tokenS.Claims.ToArray()[0].Value) && i.Key != token) {
                    EksperimentHub.users.Remove(i.Key);
                    EksperimentHub.users.Add(token,i.Value);
                    Osvezi(id, token); return;
                }
            }*/
            
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        private Korisnik Authenticate(KorisnikDto korisnik)
        {
            Korisnik kor = db.dbkorisnik.dajKorisnika(korisnik.KorisnickoIme, korisnik.Sifra);
            return kor;
        }
        [HttpPost("register")]
        public IActionResult Register(KorisnikRegister request) {
            try
            {
                KorisnikValid korisnikValid = db.dbkorisnik.dodajKorisnika(new Korisnik(0, request.KorisnickoIme, request.Ime, request.Sifra, request.Email));
            
                if(korisnikValid.korisnickoIme && korisnikValid.email)
                {
                    Korisnik kor = db.dbkorisnik.dajKorisnika(request.KorisnickoIme, request.Sifra);

                    string putanja = Path.Combine(Directory.GetCurrentDirectory() , "Files" , kor.Id.ToString());
                    if(!Directory.Exists(putanja))
                        Directory.CreateDirectory(putanja);
                    return Ok("Registrovan korisnik");
                }
                if(!korisnikValid.korisnickoIme)
                {
                    if(!korisnikValid.email)
                    {
                        return BadRequest("1");  // Korisnicko ime i email vec postoje
                    }
                    else
                    {
                        return BadRequest("2"); // email ispravan // Korisnicko ime vec postoji
                    }
                }
        
                return BadRequest("3"); // username ispravan //Email vec postoji
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpPost("update")]
        public IActionResult Update(KorisnikUpdate korisnik)
        {
            try
            {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            if(korisnik.Sifra!="")
                if (db.dbkorisnik.dajKorisnika(tokenS.Claims.ToArray()[1].Value, korisnik.StaraSifra) == null)
                    return BadRequest("Netacna stara sifra");

            Korisnik kor = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));
            if (kor.KorisnickoIme != korisnik.KorisnickoIme && db.dbkorisnik.proveri_korisnickoime(korisnik.KorisnickoIme))
            {
                return BadRequest("Korisnicko ime vec postoji");
            }
            if (kor.Email != korisnik.Email && db.dbkorisnik.proveri_email(korisnik.Email))
            {
                return BadRequest("Email vec postoji");
            }
            if (korisnik.Sifra == "")
                kor = new Korisnik(kor.Id, korisnik.KorisnickoIme, korisnik.Ime, kor.Sifra, korisnik.Email);
            else
                kor = new Korisnik(kor.Id, korisnik.KorisnickoIme, korisnik.Ime, korisnik.Sifra, korisnik.Email);
            if (db.dbkorisnik.updateKorisnika(kor))
                return Ok(Generate(kor));
            return BadRequest();
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }
    }
}
