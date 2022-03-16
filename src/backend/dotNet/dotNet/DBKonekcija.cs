using dotNet.Models;
using MySql.Data.MySqlClient;
using System.Data;
using FluentValidation;


namespace dotNet
{
    public class DBKonekcija
    {
        MySqlConnection connect = null;
      
        public DBKonekcija(string connectionString)
        {
            connect = new MySqlConnection(connectionString); 
            connect.Open(); 

            if(connect.State == ConnectionState.Open)
            {
                Console.WriteLine("Connected to Database.");
            }
            else
            {
                Console.WriteLine("Not Connected to Database.");
            }
            connect.Close();
        }
        public Korisnik dajKorisnika()
        {
            connect.Open();
            string query = "select * from korisnik";
            MySqlCommand cmd = new MySqlCommand(query,connect);
            MySqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                Korisnik rezultat = new Korisnik(reader.GetInt32("id"), reader.GetString("KorisnickoIme"), reader.GetString("ime"), reader.GetString("sifra"), reader.GetString("email"));
                connect.Close();
                return rezultat;
            }
            connect.Close();

            return null;
        }
        public Korisnik dajKorisnika(string KorisnickoIme,string sifra)
        {           
            connect.Open();
            string query = "select * from korisnik where `korisnickoime`=@ime and sifra=@sifra";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@ime", KorisnickoIme);
            cmd.Parameters.AddWithValue("@sifra", sifra);
            MySqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                Korisnik rezultat = new Korisnik(reader.GetInt32("id"), reader.GetString("KorisnickoIme"), reader.GetString("ime"), reader.GetString("sifra"), reader.GetString("email"));
                connect.Close();
                return rezultat;
            }
            connect.Close();
            return null;
        }
        private string KorisnickoImeTransform(string username)
        {
            string user = username.Replace(" ", "");

            user = user.ToLower();

            return user;
        }
        private string EmailTransform(string email)
        {
            string mail = email.Replace(" ", "");
            mail = mail.ToLower();

            return mail;
        }
        public bool dodajKorisnika(Korisnik korisnik)
        {
            string username = KorisnickoImeTransform(korisnik.KorisnickoIme);
            string mail = EmailTransform(korisnik.Email);

            connect.Open();
            string query = "select * from korisnik where `KorisnickoIme`=@ime or `email`=@email";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@ime", username);
            cmd.Parameters.AddWithValue("@email", mail);
            MySqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                connect.Close();
                return false;
            }
      
            connect.Close();

            connect.Open();
            cmd = new MySqlCommand("Insert into korisnik (`korisnickoime`,`ime`,`sifra`,`email`) values (@kime,@ime,@sifra,@email)",connect);
            cmd.Parameters.AddWithValue("@kime", username);
            cmd.Parameters.AddWithValue("@ime", korisnik.Ime);
            cmd.Parameters.AddWithValue("@sifra", korisnik.Sifra);
            cmd.Parameters.AddWithValue("@email", mail);

            if (cmd.ExecuteNonQuery() > 0) {
                connect.Close();
                return true;
            }
            connect.Close();
            return false; 
        }
    }
}