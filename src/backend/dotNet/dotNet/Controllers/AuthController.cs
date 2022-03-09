﻿using dotNet.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Data.Common;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace dotNet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private IConfiguration _config;
        DBKonekcija db = new DBKonekcija();
        public AuthController(IConfiguration config)
        {
            _config = config;
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
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier,user.Id.ToString()),
                new Claim(ClaimTypes.Name,user.KorisnickoIme),
                new Claim(ClaimTypes.Email,user.Email),
                new Claim(ClaimTypes.MobilePhone,user.Telefon),
                new Claim(ClaimTypes.GivenName,user.Ime)
            };

            var token = new JwtSecurityToken(_config["Jwt:Issuer"], _config["Jwt:Audience"], claims, expires: DateTime.Now.AddDays(1), signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private Korisnik Authenticate(KorisnikDto korisnik)
        {
            Korisnik kor = db.dajKorisnika(korisnik.KorisnickoIme, korisnik.Sifra);
            if (korisnik == null)
                return null;
            return kor;
            //Ovde se poziva baza i proverava da li korisnik postoji u njoj
            if (korisnik.KorisnickoIme == "admin" && korisnik.Sifra == "admin") return new Korisnik(1, "admin", "admin", "admin", "admin@admin.com", "123456789");
            return null;
        }

        [HttpPost("register")]
        public IActionResult Register(KorisnikRegister request) {
            //Pretraziti bazu da li korisnik postoji
            //Upisati ga u bazu ako ga nema
            if (request.Sifra != request.Sifra2) return BadRequest("Losa sifra2");
            if(db.dodajKorisnika(new Korisnik(0, request.KorisnickoIme, request.Ime, request.Sifra, request.Email, request.Telefon)))
            {
                return Ok("Registrovan korisnik");
            }
            return BadRequest("Vec postoji");

            string odgovor = "Registrovan";
            return Ok(new { odgovor }); ;
        }
        private void CreatePasswordHash(string password ,out byte[] passwordHash,out byte[] passwordSalt)
        {
            using (var hmac= new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }
    }
}
