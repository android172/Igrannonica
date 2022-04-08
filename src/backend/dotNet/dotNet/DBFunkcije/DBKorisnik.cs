using dotNet.Models;
using dotNet.ModelValidation;
using MySql.Data.MySqlClient;
using System.Security.Cryptography;

namespace dotNet.DBFunkcije
{
    public class DBKorisnik
    {
        private string connectionString;


        public DBKorisnik(string connectionString)
        {
            this.connectionString = connectionString;
        }

        public Korisnik dajKorisnika()
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from korisnik";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        Korisnik rezultat = new Korisnik(reader.GetInt32("id"), reader.GetString("KorisnickoIme"), reader.GetString("ime"), reader.GetString("sifra"), reader.GetString("email"));
                        return rezultat;
                    }
                    return null;
                }
            }
        }
        public Korisnik dajKorisnika(string KorisnickoIme, string sifra)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from korisnik where `korisnickoime`=@ime ";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@ime", KorisnickoIme);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        string korSifra = reader.GetString("sifra");
                        byte[] hashByte = Convert.FromBase64String(korSifra);
                        byte[] salt = new byte[16];
                        Array.Copy(hashByte, 0, salt, 0, 16);
                        var pbkdf2 = new Rfc2898DeriveBytes(sifra, salt, 100000);
                        byte[] hash = pbkdf2.GetBytes(20);
                        for(int i = 0; i < 20; i++)
                        {
                            if (hashByte[i + 16] != hash[i])
                                return null;
                        }
                        Korisnik rezultat = new Korisnik(reader.GetInt32("id"), reader.GetString("KorisnickoIme"), reader.GetString("ime"), reader.GetString("sifra"), reader.GetString("email"));
                        return rezultat;
                    }
                    return null;
                }
            }
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
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from korisnik where `KorisnickoIme`=@ime";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@ime", username);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (!reader.Read())
                        korisnikValid.korisnickoIme = true;
                }

                string query1 = "select * from korisnik where `email`=@email";
                cmd = new MySqlCommand(query1, connection);
                cmd.Parameters.AddWithValue("@email", mail);
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (!reader.Read())
                        korisnikValid.email = true;
                }

                if (korisnikValid.korisnickoIme && korisnikValid.email)
                {
                    byte[] salt;
                    new RNGCryptoServiceProvider().GetBytes(salt = new byte[16]);
                    var pbkdf2 = new Rfc2898DeriveBytes(korisnik.Sifra, salt, 100000);
                    byte[] hash = pbkdf2.GetBytes(20);
                    byte[] hashBytes = new byte[36];
                    Array.Copy(salt, 0, hashBytes, 0, 16);
                    Array.Copy(hash, 0, hashBytes, 16, 20);
                    string savedPasswordHash = Convert.ToBase64String(hashBytes);
                    cmd = new MySqlCommand("Insert into korisnik (`korisnickoime`,`ime`,`sifra`,`email`) values (@kime,@ime,@sifra,@email)", connection);
                    cmd.Parameters.AddWithValue("@kime", username);
                    cmd.Parameters.AddWithValue("@ime", korisnik.Ime);
                    cmd.Parameters.AddWithValue("@sifra", savedPasswordHash);
                    cmd.Parameters.AddWithValue("@email", mail);

                    if (cmd.ExecuteNonQuery() > 0)
                    {
                        return korisnikValid;
                    }

                }
                return korisnikValid;
            }
        }
        public Korisnik Korisnik(int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from korisnik where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    Korisnik rezultat = null;
                    if (reader.Read())
                    {
                        rezultat = new Korisnik(reader.GetInt32("id"), reader.GetString("KorisnickoIme"), reader.GetString("ime"), reader.GetString("sifra"), reader.GetString("email"));
                    }
                    return rezultat;
                }
            }
        }
        public bool proveri_email(string email)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from korisnik where email=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", email);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return true;
                    }
                    return false;
                }
            }
        }
        public bool proveri_korisnickoime(string korisnickoime)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from korisnik where korisnickoime=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", korisnickoime);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                        return true;
                    return false;
                }
            }
        }
        public bool updateKorisnika(Korisnik korisnik)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "update korisnik set `korisnickoime` =@korisnickoime , `ime`=@ime , `sifra`=@sifra , `email`=@email where `id`=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", korisnik.Id);
                cmd.Parameters.AddWithValue("@korisnickoime", korisnik.KorisnickoIme);
                cmd.Parameters.AddWithValue("@ime", korisnik.Ime);
                cmd.Parameters.AddWithValue("@sifra", korisnik.Sifra);
                cmd.Parameters.AddWithValue("@email", korisnik.Email);
                connection.Open();
                if (cmd.ExecuteNonQuery() > 0)
                    return true;
                return false;
            }
        }
    }
}
