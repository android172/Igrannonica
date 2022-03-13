using dotNet.Models;
using MySql.Data.MySqlClient;
using System.Data;


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
        public bool dodajKorisnika(Korisnik korisnik)
        {
            connect.Open();
            string query = "select * from korisnik where `KorisnickoIme`=@ime and email=@email";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@ime", korisnik.KorisnickoIme);
            cmd.Parameters.AddWithValue("@email", korisnik.Email);
            MySqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                connect.Close();
                return false;
            }
            connect.Close();
            connect.Open();
            cmd = new MySqlCommand("Insert into korisnik (`korisnickoime`,`ime`,`sifra`,`email`) values (@kime,@ime,@sifra,@email)",connect);
            cmd.Parameters.AddWithValue("@kime", korisnik.KorisnickoIme);
            cmd.Parameters.AddWithValue("@ime", korisnik.Ime);
            cmd.Parameters.AddWithValue("@sifra", korisnik.Sifra);
            cmd.Parameters.AddWithValue("@email", korisnik.Email);
            //cmd.Parameters.AddWithValue("@tel", korisnik.Telefon);
            if (cmd.ExecuteNonQuery() > 0) {
                connect.Close();
                return true;
            }
            connect.Close();
            return false; 
        }
    }
}
