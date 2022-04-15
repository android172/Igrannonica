using dotNet.Models;
using MySql.Data.MySqlClient;

namespace dotNet.DBFunkcije
{
    public class DBEksperiment
    {
        private string connectionString;

        public DBEksperiment(string connectionString)
        {
            this.connectionString = connectionString;
        }


        public List<EksperimentDto> eksperimenti(int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from Eksperiment where vlasnik=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                List<EksperimentDto> result = new List<EksperimentDto>();
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {

                    while (reader.Read())
                    {
                        EksperimentDto ex = new EksperimentDto();
                        ex.Id = reader.GetInt32("id");
                        ex.Name = reader.GetString("Naziv");
                        result.Add(ex);
                    }
                    return result;
                }
            }
        }
        public int proveri_eksperiment(string naziv, int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from Eksperiment where Naziv=@naziv and vlasnik=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@naziv", naziv);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        int id1 = reader.GetInt32("id");
                        return id1;
                    }
                    return -1;
                }
            }
        }
        public bool dodajEksperiment(string ime, int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                string query = "insert into Eksperiment (`Naziv`,`vlasnik`) values (@naziv,@vlasnik)";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@naziv", ime);
                cmd.Parameters.AddWithValue("@vlasnik", id);
                if (cmd.ExecuteNonQuery() > 0)
                {
                    return true;
                }
                return false;
            }
        }
        public bool updateEksperient(int id, string ime)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "update Eksperiment set Naziv=@naziv where id=@vlasnik";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@naziv", ime);
                cmd.Parameters.AddWithValue("@vlasnik", id);
                connection.Open();
                if(cmd.ExecuteNonQuery()!=0)
                    return true;
                return false;
            }
        }

        public string uzmi_naziv(int id)
        {
            using(MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from Eksperiment where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        string naziv = reader.GetString("Naziv");
                        return naziv;
                    }
                return "";
                }
            }
        }
        public string uzmi_naziv_csv(int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from Eksperiment where id=@id and csv <> ''";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        Console.WriteLine("OK");
                        string naziv = reader.GetString("csv");
                        return naziv;
                    }
                    return "";
                }
            }
        }

        public bool dodajCsv(int id, string naziv)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "update Eksperiment set csv=@naziv where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@naziv", naziv);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                if (cmd.ExecuteNonQuery() > 0)
                {
                    return true;
                }
                return false;
            }
        }
    }
}
