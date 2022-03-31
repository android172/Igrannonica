﻿using dotNet.Models;
using MySql.Data.MySqlClient;

namespace dotNet.DBFunkcije
{
    public class DBModel
    {
        private MySqlConnection connect;

        public DBModel(MySqlConnection connection)
        {
            this.connect = connection;
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
            reader.Dispose();
            connect.Close();
            return result;
        }
        public int proveriModel(string ime, int id)
        {
            connect.Open();
            string query = "select * from model where naziv=@naziv and idEksperimenta=@vlasnik";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@naziv", ime);
            cmd.Parameters.AddWithValue("@vlasnik", id);
            MySqlDataReader r = cmd.ExecuteReader();
            if (r.Read())
            {
                int idm = r.GetInt32("id");
                r.Dispose();
                connect.Close();
                return idm;
            }
            r.Dispose();
            connect.Close();
            return -1;
        }
        public bool dodajModel(string ime, int id)
        {
            connect.Open();
            string query = "insert into model (`naziv`,`ideksperimenta`,`napravljen`,`obnovljen`) values (@ime,@id,now(),now())";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@ime", ime);
            cmd.Parameters.AddWithValue("@id", id);
            if (cmd.ExecuteNonQuery() > 0)
            {
                connect.Close();
                dodajPodesavanja(proveriModel(ime,id));
                return true;
            }
            connect.Close();
            return false;
        }
        public bool promeniImeModela(string ime, int id)
        {
            connect.Open();
            string query = "update model set `naziv`=@ime ,`obnovljen`=now() where id=@id";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@ime", ime);
            cmd.Parameters.AddWithValue("@id", id);
            MySqlDataReader read = cmd.ExecuteReader();
            if (read.Read())
            {
                read.Dispose();
                connect.Close();
                return true;
            }
            read.Dispose();
            connect.Close();
            return false;
        }
        public bool izbrisiModel(int id)
        {
            connect.Open();
            string query = "delete from model where id=@id";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@id", id);
            if (cmd.ExecuteNonQuery() > 0)
            {
                connect.Close();
                return true;
            }
            connect.Close();
            return false;
        }
        public ANNSettings podesavanja(int id)
        {
            try
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
                reader.Dispose();
                connect.Close();
                return settings;
            }
            reader.Dispose();
            connect.Close();
            return null;
            }
            catch (Exception ex)
            {
                return podesavanja(id);
            }
        }
        public void dodajPodesavanja(int id)
        {
            try
            {

                connect.Open();
                string query = "insert into podesavanja values(@id,'Classification',0.001,64,10,13,2,'5,7,9,9,7','lr,lr,lr,lr,lr','L1',0.0001,'CrossEntropyLoss','Adam',5);";
                MySqlCommand cmd = new MySqlCommand(query, connect);
                cmd.Parameters.AddWithValue("@id", id);
                cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                
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
            try
            {
                connect.Open();
                string query = "select * from model where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connect);
                cmd.Parameters.AddWithValue("@id", id);
                MySqlDataReader reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    Console.WriteLine("OK");
                    String naziv = reader.GetString("naziv");
                    reader.Dispose();
                    connect.Close();
                    return naziv;
                }
                reader.Dispose();
                connect.Close();
                return "";
            }
            catch (Exception ex)
            {
                return uzmi_nazivM(id);
            }
        }
    }
}
