﻿using dotNet.Models;
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
            var user = Authenticate(korisnik);
            if (user != null)
            {
                var token = Generate(user);
                return Ok(token);
            }
            return NotFound("Ne postoji");

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

        private Korisnik Authenticate(KorisnikDto korisnik)
        {
            Korisnik kor = db.dbkorisnik.dajKorisnika(korisnik.KorisnickoIme, korisnik.Sifra);
            return kor;
        }
        [HttpPost("register")]
        public IActionResult Register(KorisnikRegister request) {
            //Pretraziti bazu da li korisnik postoji
            //Upisati ga u bazu ako ga nema
            Console.WriteLine(request.KorisnickoIme);
            KorisnikValid korisnikValid = db.dbkorisnik.dodajKorisnika(new Korisnik(0, request.KorisnickoIme, request.Ime, request.Sifra, request.Email));
            
            if(korisnikValid.korisnickoIme && korisnikValid.email)
            {
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
        private void CreatePasswordHash(string password ,out byte[] passwordHash,out byte[] passwordSalt)
        {
            using (var hmac= new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }
        [Authorize]
        [HttpPost("update")]
        public IActionResult Update(KorisnikRegister korisnik)
        {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;

            Korisnik kor = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));
            if (kor.KorisnickoIme != korisnik.KorisnickoIme && db.dbkorisnik.proveri_korisnickoime(korisnik.KorisnickoIme))
            {
                return BadRequest("Korisnicko ime vec postoji");
            }
            if (kor.Email != korisnik.Email && db.dbkorisnik.proveri_email(korisnik.Email))
            {
                return BadRequest("Email vec postoji");
            }
            kor = new Korisnik(kor.Id, korisnik.KorisnickoIme, korisnik.Ime, korisnik.Sifra, korisnik.Email);
            if (db.dbkorisnik.updateKorisnika(kor))
                return Ok(Generate(kor));
            return BadRequest();
        }
    }
}
