using dotNet.Models;
using MySql.Data.MySqlClient;
using System.Data;
using FluentValidation;
using dotNet.ModelValidation;


namespace dotNet
{
    public class DBKonekcija
    {
        MySqlConnection connect = null;

        public DBKonekcija(string connectionString)
        {
            connect = new MySqlConnection(connectionString);
            connect.Open();

            if (connect.State == ConnectionState.Open)
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
            MySqlCommand cmd = new MySqlCommand(query, connect);
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
        public List<EksperimentDto> eksperimenti(int id)
        {
            connect.Open();
            string query = "select * from eksperiment where vlasnik=@id";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@id", id);
            MySqlDataReader reader = cmd.ExecuteReader();
            List<EksperimentDto> result = new List<EksperimentDto>();
            while (reader.Read())
            {
                EksperimentDto ex = new EksperimentDto();
                ex.Id = reader.GetInt32("id");
                ex.Name = reader.GetString("Naziv");
                result.Add(ex);

            }
            connect.Close();
            return result;
        }
        public List<ModelDto> modeli(int id)
        {
            connect.Open();
            string query = "select * from model where ideksperimenta=@id";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@id", id);
            MySqlDataReader reader = cmd.ExecuteReader();
            List<ModelDto> result = new List<ModelDto>();
            while (reader.Read())
            {
                ModelDto ex = new ModelDto();
                ex.Id = reader.GetInt32("id");
                ex.Name = reader.GetString("Naziv");
                ex.CreatedDate = reader.GetDateTime("napravljen");
                ex.UpdatedDate = reader.GetDateTime("obnovljen");
                result.Add(ex);
            }
            return result;
        }
        public ANNSettings podesavanja(int id)
        {
            connect.Open();
            string query = "select * from podesavanja where id=@id";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@id", id);
            MySqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                ProblemType fun;
                if (reader.GetString("Problemtype").Equals("Reggresion")) fun = ProblemType.Regression;
                else fun = ProblemType.Classification;
                ANNSettings settings = new ANNSettings(fun, reader.GetFloat("LearningRate"), reader.GetInt32("BatchSize"),
                    reader.GetInt32("numberOfEpochs"), reader.GetInt32("inputSize"), reader.GetInt32("OutputSize"),
                    HiddenLayers(reader.GetString("HiddenLayers")), aktivacionefunkcije(reader.GetString("aktivacionefunkcije")));

                return settings;
            }
            return null;
        }
        private int[] HiddenLayers(string niz)
        {
            List<int> hiddenLayers = new List<int>();
            foreach (string layer in niz.Split(','))
            {
                hiddenLayers.Add(int.Parse(layer));
            }
            return hiddenLayers.ToArray();
        }
        private ActivationFunction[] aktivacionefunkcije(string niz)
        {
            List<ActivationFunction> funkcije = new List<ActivationFunction>();
            foreach (string layer in niz.Split(','))
            {
                switch (layer)
                {
                    case "r":
                        funkcije.Add(ActivationFunction.ReLU);
                        break;
                    case "lr":
                        funkcije.Add(ActivationFunction.LeakyReLU);
                        break;
                    case "s":
                        funkcije.Add(ActivationFunction.Sigmoid);
                        break;
                    case "t":
                        funkcije.Add(ActivationFunction.Tanh);
                        break;
                }
            }
            return funkcije.ToArray();

        }
    }
}