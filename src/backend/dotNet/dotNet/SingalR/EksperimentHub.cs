using dotNet.Controllers;
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

        public void ForwardToFrontEnd(string token, string method, string param) {
            try { Clients.Clients(users[token]).SendAsync(method, param); }
            catch (Exception) {
                //Console.WriteLine(param);
                if (method.Equals("FinishModelTraining"))
                {
                    if (MLTestController.experiment != null)
                    {
                        var metrics = MLTestController.experiment.ComputeMetrics(1);
                        Console.WriteLine(metrics);
                    }
                }
                else
                {
                    Console.WriteLine(param);
                }
            }
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
