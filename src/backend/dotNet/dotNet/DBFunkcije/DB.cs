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
            dbeksperiment = new DBEksperiment(connection.Connection);
            dbkorisnik = new DBKorisnik(connection.Connection);
            dbmodel = new DBModel(connection.Connection);
        }
    }
}
