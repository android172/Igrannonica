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
                string query = "select * from Eksperiment where naziv=@naziv and vlasnik=@id";
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
                if (cmd.ExecuteNonQuery() > 0)
                {
                    return true;
                }
                return false;
            }
        }
        public bool izbrisiEksperiment(int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "delete from Eksperiment where id=@id";
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
        public string uzmi_naziv(int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
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
                string query = "select * from Eksperiment where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
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
        public bool dodajSnapshot(int id, string naziv,string csv)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "insert into Snapshot(`ideksperimenta`,`Ime`,`csv`) values (@id,@ime,@csv);";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@ime", naziv);
                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@csv", csv);
                connection.Open();
                if (cmd.ExecuteNonQuery() > 0)
                {
                    return true;
                }
                return false;
            }
        }

        public int proveriSnapshot(int id, string ime)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from Snapshot where ideksperimenta=@id and Ime=@ime";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@ime",ime);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return reader.GetInt32("id");
                    }
                }
                return -1;
            }
        }

        public List<Snapshot> listaSnapshota(int id)
        {
            List<Snapshot> lista = new List<Snapshot>();
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from Snapshot where ideksperimenta=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        Snapshot snap = new Snapshot();
                        snap.id = reader.GetInt32("id");
                        snap.ideksperimenta = reader.GetInt32("ideksperimenta");
                        snap.Ime = reader.GetString("Ime");
                        snap.csv = reader.GetString("csv");
                        lista.Add(snap);
                        //lista.Add(new Snapshot(reader.GetInt32("id"), reader.GetInt32("ideksperimenta"), reader.GetString("Ime"), reader.GetString("csv")));
                    }
                }
            }
            return lista;
        }

        public Snapshot dajSnapshot(int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "select * from Snapshot where id=@id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);
                connection.Open();
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return new Snapshot(reader.GetInt32("id"), reader.GetInt32("ideksperimenta"), reader.GetString("Ime"), reader.GetString("csv"));
                    }
                }
            }
            return null;
        }

        public bool izbrisiSnapshot(int id)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "delete from Snapshot where id=@id";
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
    }
}
