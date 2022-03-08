using MySql.Data.MySqlClient;
using System.Data;

namespace dotNet
{
    public class DBKonekcija
    {
        MySqlConnection connect = null;
        static string server = "localhost";
        static string database = "bazasql";
        static string username = "root";
        static string password = "";
        static string port = "3308";
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
        }
    }
}
