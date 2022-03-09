using dotNet.Models;
using MySql.Data.MySqlClient;
using System.Data;

namespace dotNet
{
    public class DBKonekcija
    {
        MySqlConnection connect = null;
        static string server = "localhost";
        static string database = "baza";
        static string username = "root";
        static string password = "";
        static string port = "3306";
        static string connectionString = "datasource="+server+";user="+username+";database="+database+";port="+port+";password="+password;  

        public DBKonekcija()
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
                Korisnik rezultat = new Korisnik(reader.GetInt32("id"), reader.GetString("Korisnicko Ime"), reader.GetString("ime"), reader.GetString("sifra"), reader.GetString("email"), reader.GetString("telefon"));
                connect.Close();
                return rezultat;
            }
            connect.Close();

            return null;
        }
        public Korisnik dajKorisnika(string KorisnickoIme,string sifra)
        {
            connect.Open();
            string query = "select * from korisnik where `korisnicko ime`=@ime and sifra=@sifra";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@ime", KorisnickoIme);
            cmd.Parameters.AddWithValue("@sifra", sifra);
            MySqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                Korisnik rezultat = new Korisnik(reader.GetInt32("id"), reader.GetString("Korisnicko Ime"), reader.GetString("ime"), reader.GetString("sifra"), reader.GetString("email"), reader.GetString("telefon"));
                connect.Close();
                return rezultat;
            }
            connect.Close();
            return null;
        }
        public bool dodajKorisnika(Korisnik korisnik)
        {
            connect.Open();
            string query = "select * from korisnik where `korisnicko ime`=@ime and email=@email";
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
            cmd = new MySqlCommand("Insert into korisnik (`korisnicko ime`,`ime`,`sifra`,`email`,`telefon`) values (@kime,@ime,@sifra,@email,@tel)",connect);
            cmd.Parameters.AddWithValue("@kime", korisnik.KorisnickoIme);
            cmd.Parameters.AddWithValue("@ime", korisnik.Ime);
            cmd.Parameters.AddWithValue("@sifra", korisnik.Sifra);
            cmd.Parameters.AddWithValue("@email", korisnik.Email);
            cmd.Parameters.AddWithValue("@tel", korisnik.Telefon);
            if (cmd.ExecuteNonQuery() > 0) {
                connect.Close();
                return true;
            }
            connect.Close();
            return false; 
        }
    }
}
