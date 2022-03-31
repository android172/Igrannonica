using dotNet.Models;
using dotNet.ModelValidation;
using MySql.Data.MySqlClient;

namespace dotNet.DBFunkcije
{
    public class DBKorisnik
    {
        private MySqlConnection connect;


        public DBKorisnik(MySqlConnection connection)
        {
            this.connect = connection;
        }

        public Korisnik dajKorisnika()
        {
            connect.Open();
            string query = "select * from korisnik";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            MySqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                Korisnik rezultat = new Korisnik(reader.GetInt32("id"), reader.GetString("KorisnickoIme"), reader.GetString("ime"), reader.GetString("sifra"), reader.GetString("email"));
                reader.Dispose();
                connect.Close();
                return rezultat;
            }
            reader.Dispose();
            connect.Close();
            return null;
        }
        public Korisnik dajKorisnika(string KorisnickoIme, string sifra)
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
                reader.Dispose();
                connect.Close();
                return rezultat;
            }
            reader.Dispose();
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
        public KorisnikValid dodajKorisnika(Korisnik korisnik)
        {
            KorisnikValid korisnikValid = new KorisnikValid(false, false);

            string username = KorisnickoImeTransform(korisnik.KorisnickoIme);
            string mail = EmailTransform(korisnik.Email);

            connect.Open();
            string query = "select * from korisnik where `KorisnickoIme`=@ime";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@ime", username);
            MySqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                //connect.Close();
                //return false;
            }
            else
            {
                korisnikValid.korisnickoIme = true;
            }
            reader.Dispose();
            connect.Close();

            connect.Open();

            string query1 = "select * from korisnik where `email`=@email";
            cmd = new MySqlCommand(query1, connect);
            cmd.Parameters.AddWithValue("@email", mail);
            MySqlDataReader reader1 = cmd.ExecuteReader();
            if (reader1.Read())
            {
                //connect.Close();
                //return false;
            }
            else
            {
                korisnikValid.email = true;
            }
            reader.Dispose();
            connect.Close();

            if (korisnikValid.korisnickoIme && korisnikValid.email)
            {
                connect.Open();
                cmd = new MySqlCommand("Insert into korisnik (`korisnickoime`,`ime`,`sifra`,`email`) values (@kime,@ime,@sifra,@email)", connect);
                cmd.Parameters.AddWithValue("@kime", username);
                cmd.Parameters.AddWithValue("@ime", korisnik.Ime);
                cmd.Parameters.AddWithValue("@sifra", korisnik.Sifra);
                cmd.Parameters.AddWithValue("@email", mail);

                if (cmd.ExecuteNonQuery() > 0)
                {
                    connect.Close();
                    return korisnikValid;
                }

                connect.Close();
            }
            return korisnikValid;
        }
        public Korisnik Korisnik(int id)
        {
            connect.Open();
            string query = "select * from korisnik where id=@id";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@id", id);
            MySqlDataReader reader = cmd.ExecuteReader();
            Korisnik rezultat = null;
            if (reader.Read())
            {
                rezultat = new Korisnik(reader.GetInt32("id"), reader.GetString("KorisnickoIme"), reader.GetString("ime"), reader.GetString("sifra"), reader.GetString("email"));
            }
            reader.Dispose();
            connect.Close();
            return rezultat;
        }
        public bool proveri_email(string email)
        {
            connect.Open();
            Console.WriteLine("em");
            string query = "select * from korisnik where email=@id";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@id", email);
            MySqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                reader.Dispose();
                connect.Close();
                return true;
            }
            reader.Dispose();
            connect.Close();
            return false;
        }
        public bool proveri_korisnickoime(string korisnickoime)
        {
            connect.Open();
            Console.WriteLine("ki");
            string query = "select * from korisnik where korisnickoime=@id";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@id", korisnickoime);
            MySqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                reader.Dispose();
                connect.Close();
                return true;
            }
            reader.Dispose();
            connect.Close();
            return false;
        }
        public bool updateKorisnika(Korisnik korisnik)
        {
            connect.Open();
            string query = "update korisnik set `korisnickoime` =@korisnickoime , `ime`=@ime , `sifra`=@sifra , `email`=@email where `id`=@id";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@id", korisnik.Id);
            cmd.Parameters.AddWithValue("@korisnickoime", korisnik.KorisnickoIme);
            cmd.Parameters.AddWithValue("@ime", korisnik.Ime);
            cmd.Parameters.AddWithValue("@sifra", korisnik.Sifra);
            cmd.Parameters.AddWithValue("@email", korisnik.Email);
            if (cmd.ExecuteNonQuery() > 0)
            {
                connect.Close();
                return true;
            }
            connect.Close();
            return false;
        }
    }
}
