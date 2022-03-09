﻿namespace dotNet.Models
{
    public class Korisnik
    {
        public int Id { get; set; }
        public string KorisnickoIme { get; set; }
        public string Ime { get; set; }
        public string Sifra { get; set; }
        public string Email { get; set; }
        public string Telefon { get; set; }
        public Korisnik(int id, string korisnickoime, string ime, string sifra, string email, string telefon)
        {
            Id = id;
            KorisnickoIme = korisnickoime;
            Ime = ime;
            Sifra = sifra;
            Email = email;
            Telefon = telefon;
        }
    }
}