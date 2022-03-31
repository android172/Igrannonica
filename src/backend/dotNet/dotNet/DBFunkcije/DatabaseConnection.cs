using MySql.Data.MySqlClient;

namespace dotNet.DBFunkcije
{
    public sealed class DatabaseConnection
    {
        private static readonly object kljuc = new object();
        public MySqlConnection Connection { get; set; }
        private DatabaseConnection(IConfiguration config)
        {
            String connectionString = config.GetConnectionString("connectionString");

            this.Connection = new MySqlConnection(connectionString);
        }

        private static DatabaseConnection instance = null;
        public static IConfiguration config;
        public static DatabaseConnection Instance
        {
            get
            {
                if (instance == null)
                    lock (kljuc)
                    {
                        if (instance == null) { instance = new DatabaseConnection(config); }
                    }
                return instance;
            }
        }

    }
}
