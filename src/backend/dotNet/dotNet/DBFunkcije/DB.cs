using MySql.Data.MySqlClient;

namespace dotNet.DBFunkcije
{
    public class DB
    {
        public DBEksperiment dbeksperiment;
        public DBModel dbmodel;
        public DBKorisnik dbkorisnik;
        public DB(IConfiguration config)
        {
            if(DatabaseConnection.config==null)
                DatabaseConnection.config = config;
            DatabaseConnection connection = DatabaseConnection.Instance;
            dbeksperiment = new DBEksperiment(config.GetConnectionString("connectionString"));
            dbkorisnik = new DBKorisnik(config.GetConnectionString("connectionString"));
            dbmodel = new DBModel(config.GetConnectionString("connectionString"));
        }
        public DB()
        {
            if (DatabaseConnection.config != null)
            {
                DatabaseConnection connection = DatabaseConnection.Instance;
                dbeksperiment = new DBEksperiment(DatabaseConnection.config.GetConnectionString("connectionString"));
                dbkorisnik = new DBKorisnik(DatabaseConnection.config.GetConnectionString("connectionString"));
                dbmodel = new DBModel(DatabaseConnection.config.GetConnectionString("connectionString"));
            }
        }
    }
}
