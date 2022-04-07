using dotNet.DBFunkcije;
using dotNet.MLService;
using dotNet.Models;
using Microsoft.AspNetCore.SignalR;
namespace dotNet.SingalR
{
    public class EksperimentHub : Hub
    {
        public static Dictionary<string,string> users = new Dictionary<string, string>();

        // token je jwt token korisnika
        public string GetConnectionId(string token) {
            users[token] = Context.ConnectionId;
            return Context.ConnectionId;
        }

        public void SendLoss(string token, string loss)
        {
            Clients.Clients(users[token]).SendAsync("loss", loss);
        }

        public void ZaustaviTreniranje()
        {
            Console.WriteLine("Treniranje Zaustavljeno");
            // TODO
        }
        

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
