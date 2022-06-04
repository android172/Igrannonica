using dotNet.Controllers;
using dotNet.DBFunkcije;
using dotNet.MLService;
using dotNet.Models;
using Microsoft.AspNetCore.SignalR;
using System.IdentityModel.Tokens.Jwt;

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
            try { 
                    var handler = new JwtSecurityTokenHandler();
                    var jsonToken = handler.ReadJwtToken(token);
                    var tokenS = jsonToken as JwtSecurityToken;
                foreach (var i in users)
                {
                    if (int.Parse(handler.ReadJwtToken(i.Key).Claims.ToArray()[0].Value) == int.Parse(tokenS.Claims.ToArray()[0].Value))
                    {
                        Clients.Clients(users[i.Key]).SendAsync(method, param);
                    }
                }
            }
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
    }
}
