using dotNet.MLService;

namespace dotNet.Models
{
    public class Korisnik
    {
        public int Id { get; set; }
        public string KorisnickoIme { get; set; }
        public string Ime { get; set; }
        public string Sifra { get; set; }
        public string Email { get; set; }
        public Korisnik(int id, string korisnickoime, string ime, string sifra, string email)
        {
            Id = id;
            KorisnickoIme = korisnickoime;
            Ime = ime;
            Sifra = sifra;
            Email = email;
        }
    }
}
