using dotNet.Models;
using MySql.Data.MySqlClient;

namespace dotNet.DBFunkcije
{
    public class DBEksperiment
    {
        private MySqlConnection connect;

        public DBEksperiment(MySqlConnection connection)
        {
            connect = connection;
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
        public int proveri_eksperiment(string naziv, int id)
        {
            connect.Open();
            Console.WriteLine("ki");
            string query = "select * from eksperiment where naziv=@naziv and vlasnik=@id";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@naziv", naziv);
            cmd.Parameters.AddWithValue("@id", id);
            MySqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                int id1 = reader.GetInt32("id");
                connect.Close();
                return id1;
            }
            connect.Close();
            return -1;
        }
        public bool dodajEksperiment(string ime, int id)
        {
            connect.Open();
            string query = "insert into eksperiment (`naziv`,`vlasnik`) values (@naziv,@vlasnik)";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@naziv", ime);
            cmd.Parameters.AddWithValue("@vlasnik", id);
            if (cmd.ExecuteNonQuery() > 0)
            {
                connect.Close();
                return true;
            }
            connect.Close();
            return false;
        }
        public bool updateEksperient(int id, string ime)
        {
            connect.Open();
            string query = "update eksperiment set naziv=@naziv where id=@vlasnik";
            MySqlCommand cmd = new MySqlCommand(query, connect);
            cmd.Parameters.AddWithValue("@naziv", ime);
            cmd.Parameters.AddWithValue("@vlasnik", id);
            MySqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                connect.Close();
                return true;
            }
            connect.Close();
            return false;
        }
    }
}
