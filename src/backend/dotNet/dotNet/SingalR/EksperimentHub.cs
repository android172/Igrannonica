using dotNet.DBFunkcije;
using dotNet.MLService;
using dotNet.Models;
using Microsoft.AspNetCore.SignalR;
namespace dotNet.SingalR
{
    public class EksperimentHub : Hub
    {
        public static Dictionary<string,string> users = new Dictionary<string, string>();
        private static DB db = new DB(); 
        //token je jwt token korisnika
        public Task Treniraj(string token,int idmodela)
        {
            float x = 0.1f;
            users[Context.ConnectionId] = idmodela.ToString();
            Console.WriteLine(idmodela);
            //users se sastoji iz connectionId i jwt koji ce da posluzi da se uzme MLConnection
            //Ovde treba pozvati model za treniranje
            Clients.Clients(Context.ConnectionId).SendAsync("treniranje", "Poceto treniranje");
            MLExperiment eks = Korisnik.eksperimenti[token];
            ANNSettings settings = db.dbmodel.podesavanja(idmodela);
            string datasetPath = Directory.GetCurrentDirectory() + "\\Files\\1\\1\\test_data.csv";
            eks.LoadDataset(datasetPath);
            eks.OneHotEncoding(new int[] { 4, 5, 13 });
            eks.LoadInputs(new int[] { 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 });
            eks.LoadOutputs(new int[] { 16, 17 });
            eks.TrainTestSplit(x);
            eks.ApplySettings(settings);
            eks.Start();
            return Clients.Clients(Context.ConnectionId).SendAsync("treniranje", "Treniranje zavrseno");
        }
        public void ZaustaviTreniranje()
        {
            Console.WriteLine("Treniranje Zaustavljeno");
            //Potrebno zaustaviti treniranje.
        }
        //-------------------------------
        //U funkciji gde se vraca loss
        //Clients.Clients(connectionId).SendAsync("loss", value);
        //-------------------------------
        public string GetConnectionId() => Context.ConnectionId;

        public override Task OnConnectedAsync()
        {
            Console.WriteLine("connected");
            users.Add(Context.ConnectionId,null);
            return base.OnConnectedAsync();
        }
        public override Task OnDisconnectedAsync(Exception? exception)
        {
            users.Remove(Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }
    }
}
