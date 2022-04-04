using dotNet.Models;
using MySql.Data.MySqlClient;

namespace dotNet.DBFunkcije
{
    public class DBModel
    {
        private string connectionString;

        public DBModel(string connectionString)
        {
            this.connectionString = connectionString;
        }

        public List<ModelDto> modeli(int id)
        {
            List<ModelDto> result = new List<ModelDto>();
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
            string query = "select * from model where ideksperimenta=@id";
            MySqlCommand cmd = new MySqlCommand(query, connection);
            cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {

                    while (reader.Read())
                    {
                        ModelDto ex = new ModelDto();
                        ex.Id = reader.GetInt32("id");
                        ex.Name = reader.GetString("Naziv");
                        ex.CreatedDate = reader.GetDateTime("napravljen");
                        ex.UpdatedDate = reader.GetDateTime("obnovljen");
                        result.Add(ex);
                    }
                }
            }
            return result;
        }
        public int proveriModel(string ime, int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from model where naziv=@naziv and idEksperimenta=@vlasnik";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@naziv", ime);
                cmd.Parameters.AddWithValue("@vlasnik", id);
                connection.Open();
                using (MySqlDataReader r = cmd.ExecuteReader())
                {

                    if (r.Read())
                    {
                        int idm = r.GetInt32("id");
                        return idm;
                    }
                }
                return -1;
            }
        }
        public bool dodajModel(string ime, int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "insert into model (`naziv`,`ideksperimenta`,`napravljen`,`obnovljen`) values (@ime,@id,now(),now())";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@ime", ime);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                if (cmd.ExecuteNonQuery() > 0)
                {
                    dodajPodesavanja(proveriModel(ime, id));
                    return true;
                }
                return false;
            }
        }
        public bool promeniImeModela(string ime, int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "update model set `naziv`=@ime ,`obnovljen`=now() where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@ime", ime);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader read = cmd.ExecuteReader())
                {
                    if (read.Read())
                    {
                        return true;
                    }
                    return false;
                }
            }
        }
        public bool izbrisiModel(int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "delete from model where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                if (cmd.ExecuteNonQuery() > 0)
                {
                    return true;
                }
                return false;
            }
        }
        public ANNSettings podesavanja(int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from podesavanja where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        ProblemType fun;
                        if (reader.GetString("Problemtype").Equals("Reggresion")) fun = ProblemType.Regression;
                        else fun = ProblemType.Classification;
                        ANNSettings settings = new ANNSettings(
                            fun,
                            reader.GetFloat("LearningRate"),
                            reader.GetInt32("BatchSize"),
                            reader.GetInt32("numberOfEpochs"),
                            reader.GetInt32("inputSize"),
                            reader.GetInt32("OutputSize"),
                            HiddenLayers(reader.GetString("HiddenLayers")),
                            aktivacionefunkcije(reader.GetString("aktivacionefunkcije")),
                            Enum.Parse<RegularizationMethod>(reader.GetString("RegularizationMethod")),
                            reader.GetFloat("RegularizationRate"),
                            Enum.Parse<LossFunction>(reader.GetString("LossFunction")),
                            Enum.Parse<Optimizer>(reader.GetString("Optimizer"))
                            );

                        return settings;
                    }
                    return null;
                }
            }
        }


        public void dodajPodesavanja(int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "insert into podesavanja values(@id,'Classification',0.001,64,10,13,2,'5,7,9,9,7','lr,lr,lr,lr,lr','L1',0.0001,'CrossEntropyLoss','Adam',5);";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                cmd.ExecuteNonQuery();


            }
        }

        public bool izbrisiPodesavanja(int idp)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "delete from podesavanja where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", idp);
                connection.Open();
                if (cmd.ExecuteNonQuery() > 0)
                {
                    return true;
                }
                return false;
            }
        }

        public bool izmeniPodesavanja(string id, string bs, string lr, string ins,string noe,string os, string lf, string rm, string rr, string o)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "update podesavanja set `BatchSize`=@bs, `LearningRate`=@lr, `InputSize`=@ins, `NumberOfEpochs`=@noe, `OutputSize`=@os, `LossFunction`=@lf, `RegularizationMethod`=@rm, `RegularizationRate`=@rr, `Optimizer`=@o where id=@idp";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@idp", id);
                cmd.Parameters.AddWithValue("@lr", lr);
                cmd.Parameters.AddWithValue("@bs", bs);
                cmd.Parameters.AddWithValue("@ins", ins);
                cmd.Parameters.AddWithValue("@noe", noe);
                cmd.Parameters.AddWithValue("@os", os);
                cmd.Parameters.AddWithValue("@rm", rm);
                cmd.Parameters.AddWithValue("@rr", rr);
                cmd.Parameters.AddWithValue("@lf", lf);
                cmd.Parameters.AddWithValue("@o", o);

                connection.Open();
                using (MySqlDataReader read = cmd.ExecuteReader())
                {
                    if (read.Read())
                    {
                        return true;
                    }
                    return false;
                }
            }
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

        public string uzmi_nazivM(int id)
        {
            using(MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from model where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        Console.WriteLine("OK");
                        String naziv = reader.GetString("naziv");
                        return naziv;
                    }
                    return "";
                }
            }
        }
    }
}
