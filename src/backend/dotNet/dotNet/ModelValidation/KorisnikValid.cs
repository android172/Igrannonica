namespace dotNet.ModelValidation
{
    public class KorisnikValid
    {
        public bool korisnickoIme { get; set; }
        public bool email { get; set; }

        public KorisnikValid(bool korisnickoIme,bool email)
        {
            this.korisnickoIme = korisnickoIme;
            this.email = email; 
        }
    }
}
