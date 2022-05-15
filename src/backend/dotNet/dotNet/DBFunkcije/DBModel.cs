﻿using dotNet.Models;
using MySql.Data.MySqlClient;
using System;

namespace dotNet.DBFunkcije
{
    public class DBModel
    {
        private string connectionString;
        private string pom = "";
        String s;
        public DBModel(string connectionString)
        {
            this.connectionString = connectionString;
        }
       
        public List<ModelDto> modeli(int id)
        {
            List<ModelDto> result = new List<ModelDto>();
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
            string query = "select * from model where idEksperimenta=@id";
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
                        ex.Snap = reader.GetInt32("snapshot");
                        ex.CreatedDate = reader.GetDateTime("napravljen");
                        ex.UpdatedDate = reader.GetDateTime("obnovljen");
                        ex.Opis = reader.GetString("Opis");
                        result.Add(ex);
                    }
                }
            }
            return result;
        }
        public Model model(int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from model where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {

                    if (reader.Read())
                    {
                        Model ex = new Model();
                        ex.Id = reader.GetInt32("id");
                        ex.Name = reader.GetString("Naziv");
                        ex.CreatedDate = reader.GetDateTime("napravljen");
                        ex.UpdatedDate = reader.GetDateTime("obnovljen");
                        ex.Vlasnik = reader.GetInt32("ideksperimenta");
                        return ex;
                    }
                }
            }
            return null;
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
        public bool dodajModel(string ime, int id, string opis, int snanpshot)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "insert into model (`naziv`,`idEksperimenta`,`snapshot`,`napravljen`,`obnovljen`,`opis`) values (@ime,@id,@snapshot,now(),now(),@opis)";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@ime", ime);
                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@opis", opis);
                cmd.Parameters.AddWithValue("@snapshot", snanpshot);
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

        public bool promeniOpisModela(string opis, int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "update model set `opis`=@ime ,`obnovljen`=now() where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@ime", opis);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                if(cmd.ExecuteNonQuery()>=0);
                        return true;
                    return false;
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
        public int dajSnapshot(int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from model where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader read = cmd.ExecuteReader())
                {
                    if (read.Read())
                    {
                        return read.GetInt32("snapshot");
                    }
                    return -1;
                }
            }
        }
        public ANNSettings podesavanja(int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from Podesavanja where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        ProblemType fun = ProblemType.Regression;
                        if (reader.GetString("Problemtype")== "Regression") fun = ProblemType.Regression;
                        else fun = ProblemType.Classification;
                        ANNSettings settings = new ANNSettings(
                            fun,
                            reader.GetFloat("LearningRate"),
                            reader.GetInt32("BatchSize"),
                            reader.GetInt32("numberOfEpochs"),
                            0,
                            reader.GetInt32("inputSize"),
                            reader.GetInt32("OutputSize"),
                            HiddenLayers(reader.GetString("HiddenLayers")),
                            aktivacionefunkcije(reader.GetString("aktivacionefunkcije")),
                            Enum.Parse<RegularizationMethod>(reader.GetString("RegularizationMethod")),
                            reader.GetFloat("RegularizationRate"),
                            Enum.Parse<LossFunction>(reader.GetString("LossFunction")),
                            Enum.Parse<Optimizer>(reader.GetString("Optimizer")),
                            optimizationParams: new float[] { 0f },
                            reader.GetInt32("CrossValidationK")
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
                string query = "insert into Podesavanja values(@id,'Classification',0.001,64,10,0,0,'','','L1',0.0001,'CrossEntropyLoss','Adam',0,'','');";
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
                string query = "delete from Podesavanja where id=@id";
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

        public bool izmeniPodesavanja(int id, ANNSettings json)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "update Podesavanja set `ProblemType`=@pt, `BatchSize`=@bs, `LearningRate`=@lr, `InputSize`=@ins, `numberOfEpochs`=@noe, `OutputSize`=@os , `HiddenLayers`=@hl , `AktivacioneFunkcije`=@af   ,`LossFunction`=@lf, `RegularizationMethod`=@rm, `RegularizationRate`=@rr, `Optimizer`=@o ,`CrossValidationK`=@Kv where id=@idp";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@idp", id);
                cmd.Parameters.AddWithValue("@lr", json.LearningRate);
                cmd.Parameters.AddWithValue("@bs", json.BatchSize);
                cmd.Parameters.AddWithValue("@ins", json.InputSize);
                cmd.Parameters.AddWithValue("@noe", json.NumberOfEpochs);
                cmd.Parameters.AddWithValue("@os", json.OutputSize);
                cmd.Parameters.AddWithValue("@rr", json.RegularizationRate);
                cmd.Parameters.AddWithValue("@Kv", json.KFoldCV);
                //Console.WriteLine(json.ActivationFunctions[0]);
                
                for(var i = 0; i < json.HiddenLayers.Length - 1; i++)
                {
                    s += json.HiddenLayers[i] + ",";
                }
                s += json.HiddenLayers[json.HiddenLayers.Length - 1];

                cmd.Parameters.AddWithValue("@hl", s);

                s = "";

                for(var i = 0; i < json.ActivationFunctions.Length-1; i++)
                {
                    if (json.ActivationFunctions[i] == ActivationFunction.LeakyReLU)
                        s += "lr,";
                    if (json.ActivationFunctions[i] == ActivationFunction.Tanh)
                        s += "t,";
                    if (json.ActivationFunctions[i] == ActivationFunction.ReLU)
                        s += "r,";
                    if (json.ActivationFunctions[i] == ActivationFunction.Sigmoid)
                        s += "s,";
                    if (json.ActivationFunctions[i] == ActivationFunction.Linear)
                        s += "l,";
                }
                if (json.ActivationFunctions[json.ActivationFunctions.Length - 1] == ActivationFunction.LeakyReLU)
                    s += "lr";
                else if (json.ActivationFunctions[json.ActivationFunctions.Length - 1] == ActivationFunction.Tanh)
                    s += "t";
                else if (json.ActivationFunctions[json.ActivationFunctions.Length - 1] == ActivationFunction.ReLU)
                    s += "r";
                else if (json.ActivationFunctions[json.ActivationFunctions.Length - 1] == ActivationFunction.Sigmoid)
                    s += "s";
                else
                    s += "l";

                cmd.Parameters.AddWithValue("@af", s);
                Console.WriteLine(json.ANNType);
                if (json.ANNType == ProblemType.Regression)
                {
                    pom = "Regression";
                }
                else
                    pom = "Classification";
                cmd.Parameters.AddWithValue("@pt", pom);

                if (json.LossFunction == LossFunction.L1Loss)
                {
                    pom = "L1Loss";
                }
                else if (json.LossFunction == LossFunction.L2Loss)
                    pom = "L2Loss";
                else
                    pom = "CrossEntropyLoss";

                cmd.Parameters.AddWithValue("@lf", pom);

                if (json.Optimizer == Optimizer.Adadelta)
                    pom = "Adadelta";
                else if (json.Optimizer == Optimizer.Adam)
                    pom = "Adam";
                else if (json.Optimizer == Optimizer.Adagrad)
                    pom = "Adagrad";
                else
                    pom = "SGD";

                cmd.Parameters.AddWithValue("@o", pom);

                if (json.Regularization == RegularizationMethod.L1)
                    pom = "L1";
                else
                    if(json.Regularization == RegularizationMethod.L2)
                        pom = "L2";
               
                cmd.Parameters.AddWithValue("@rm", pom);

                connection.Open();
                if(cmd.ExecuteNonQuery()!=0)
                    return true;
                return false;
                
            }
        }

        private int[] HiddenLayers(string niz)
        {
            List<int> hiddenLayers = new List<int>();
            foreach (string layer in niz.Split(','))
            {
                if(layer!="")
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
                    case "l":
                        funkcije.Add(ActivationFunction.Linear);
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

        public List<List<int>> Kolone(int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                List<List<int>> list = new List<List<int>>();
                string query = "select * from Podesavanja where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        List<int> list1 = new List<int>();
                        string kolone = reader.GetString("Ulaznekolone");
                        if (kolone != "")
                        foreach(string i in kolone.Split(','))
                        {
                            list1.Add(int.Parse(i));
                        }
                        list.Add(list1);
                        list1 = new List<int>();
                        kolone = reader.GetString("Izlaznekolone");
                        if(kolone !="")
                        foreach (string i in kolone.Split(','))
                        {
                            list1.Add(int.Parse(i));
                        }
                        list.Add(list1);
                    }
                }
                return list;
            }
        }
        public bool UpisiKolone(int id,Kolone kolone)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "update Podesavanja set Ulaznekolone=@kol1 , Izlaznekolone=@kol2,InputSize=@is,OutputSize=@os where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@kol1",KoloneToString(kolone.ulazne));
                cmd.Parameters.AddWithValue("@is",kolone.ulazne.Length);
                cmd.Parameters.AddWithValue("@kol2", KoloneToString(kolone.izlazne));
                cmd.Parameters.AddWithValue("@os", kolone.izlazne.Length);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                if (cmd.ExecuteNonQuery() > 0)
                {
                    return true;
                }
                return false;
            }
        }
        public List<string> DajSveIzlazneKolone(int id)
        {
            return null; 
        }
        public string KoloneToString(int[] niz)
        {
            string str = "";
            for(int i = 0; i < niz.Length; i++)
            {
                str+=niz[i].ToString();
                if (i < niz.Length - 1)
                    str += ",";
            }
            return str;
        }

        public ModelDetaljnije detaljnije(int id)
        {
            Console.WriteLine(id.ToString());
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from model m left join podesavanja p on m.id=p.id left join snapshot s on m.snapshot=s.id where m.id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {   
                        ModelDetaljnije model = new ModelDetaljnije();
                        model.Id = reader.GetInt32("id");
                        model.Name = reader.GetString("naziv");
                        model.CreatedDate = reader.GetDateTime("napravljen");
                        model.UpdatedDate = reader.GetDateTime("obnovljen");
                        model.Snapshot = reader.GetString("Ime");
                        model.SnapshotVerzija = reader.GetInt32("snapshot");
                        model.Opis = reader.GetString("Opis");
                        model.HiddenLayers = HiddenLayers(reader.GetString("hiddenlayers"));
                        model.Epohe = reader.GetInt32("numberOfEpochs");
                        model.Optimizacija = reader.GetString("Optimizer");
                        model.IzlazneKolone = HiddenLayers(reader.GetString("IzlazneKolone"));
                        model.ProblemType = reader.GetString("ProblemType");
                        return model;
                    }
                }
                return null;
            }
        }
        public bool PostaviSnapshot(int model, int snapshot)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "update model set snapshot=@snapshot where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@snapshot", snapshot);
                cmd.Parameters.AddWithValue("@id", model);
                connection.Open();
                if (cmd.ExecuteNonQuery() > 0)
                {
                    return true;
                }
                return false;
            }
        }
        public bool zameniSnapshot(int id)
        {
            using(MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "update model set snapshot=0 where snapshot=@id";
                MySqlCommand cmd = new MySqlCommand(query,connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                if (cmd.ExecuteNonQuery() > 0)
                    return true;
                return false;
            }
        }
        public bool upisiStatistiku(int id, StatisticsRegression statistica) {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "insert into Reggresion values ( @id ,@MAE , @MSE , @RSE , @R2 , @AR2);";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@MAE", statistica.MAE);
                cmd.Parameters.AddWithValue("@MSE", statistica.MSE);
                cmd.Parameters.AddWithValue("@RSE" , statistica.RSE);
                cmd.Parameters.AddWithValue("@R2", statistica.R2);
                cmd.Parameters.AddWithValue("@AR2", statistica.AdjustedR2);
                connection.Open();
                if (cmd.ExecuteNonQuery() > 0)
                    return true;
                return false;
            }
        }

        private string confusionMatrix(int[][] Matrix)
        {
            Console.WriteLine("Test");
            string niz = "";
            for(int i = 0; i < Matrix.Length; i++)
            {
                for(int j = 0; j < Matrix[i].Length; j++)
                {
                    niz+=Matrix[i][j].ToString();
                    if (j < Matrix[i].Length - 1)
                        niz += ",";
                }
                if (i < Matrix.Length - 1)
                    niz += ":";
            }
            Console.WriteLine(niz);
            return niz;
        }
        private int[][] Matrix(string matrica)
        {
            if(matrica.Length != 0)
            {
                int[][] Matrix = new int[matrica.Split(":").Length][];
                int k = 0;
                foreach(string i in matrica.Split(':'))
                {
                    int x = 0;
                    Matrix[k] = new int[i.Split(",").Length];
                    foreach(string j in i.Split(','))
                    {
                        Matrix[k][x] = int.Parse(j);
                        x++;
                    }
                    k++;
                }
                return Matrix;
            }        
            return null;
        }


        public bool upisiStatistiku(int id,StatisticsClassification statistica)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "insert into Classification values ( @id ,@Accuracy , @BalancedAccuracy , @Precision , @Recall , @F1Score, @HammingLoss , @CrossEntropyLoss , @ConfusionMatrix );";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@Accuracy", statistica.Accuracy);
                cmd.Parameters.AddWithValue("@BalancedAccuracy", statistica.BalancedAccuracy);
                cmd.Parameters.AddWithValue("@Precision", statistica.Precision);
                cmd.Parameters.AddWithValue("@Recall", statistica.Recall);
                cmd.Parameters.AddWithValue("@F1Score", statistica.F1Score);
                cmd.Parameters.AddWithValue("@HammingLoss", statistica.HammingLoss);
                cmd.Parameters.AddWithValue("@CrossEntropyLoss", statistica.CrossEntropyLoss);
                cmd.Parameters.AddWithValue("@ConfusionMatrix", confusionMatrix( statistica.ConfusionMatrix));
                connection.Open();
                if (cmd.ExecuteNonQuery() > 0)
                    return true;
                return false;
            }
        }



    }
}
