using MySql.Data.MySqlClient;

namespace dotNet.DBFunkcije
{
    public class DB
    {
        public static IConfiguration config;
        public DBEksperiment dbeksperiment;
        public DBModel dbmodel;
        public DBKorisnik dbkorisnik;
        public DB(IConfiguration config)
        {
            if(DB.config==null)
                DB.config = config;
            dbeksperiment = new DBEksperiment(config.GetConnectionString("connectionString"));
            dbkorisnik = new DBKorisnik(config.GetConnectionString("connectionString"));
            dbmodel = new DBModel(config.GetConnectionString("connectionString"));
        }
        public DB()
        {
            if (config != null)
            {
                dbeksperiment = new DBEksperiment(config.GetConnectionString("connectionString"));
                dbkorisnik = new DBKorisnik(config.GetConnectionString("connectionString"));
                dbmodel = new DBModel(config.GetConnectionString("connectionString"));
            }
        }
    }
}
