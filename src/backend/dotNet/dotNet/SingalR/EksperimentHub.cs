using Microsoft.AspNetCore.SignalR;
namespace dotNet.SingalR
{
    public class EksperimentHub : Hub
    {
        public static Dictionary<string,string> users = new Dictionary<string, string>();
        
        //token je jwt token korisnika
        public Task Treniraj(string token,string idmodela)
        {
            users[Context.ConnectionId] = token;
            //users se sastoji iz connectionId i jwt koji ce da posluzi da se uzme MLConnection
            //Ovde treba pozvati model za treniranje
            Clients.Clients(Context.ConnectionId).SendAsync("treniranje", "Poceto treniranje");
            for(int i = 0; i < 10; i++)
                Clients.Clients(Context.ConnectionId).SendAsync("loss", i);
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
