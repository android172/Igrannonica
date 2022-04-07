using dotNet.Models;
using Microsoft.Extensions.Options;
using System.Net.Sockets;
using System.Text;

namespace dotNet.MLService {
    public class MLConnection {

        private readonly Socket socket;
        private readonly UTF8Encoding streamEncoding;

        public MLConnection(IConfiguration configuration) {
            socket = new(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            var serverSettings = configuration.GetSection("PythonServer");
            socket.Connect(serverSettings.GetValue<string>("IpAddress"), serverSettings.GetValue<int>("Port"));
            streamEncoding = new();
        }

        public void Send(object contents) {
            string? message = contents.ToString();
            if (message == null) message = "";
            byte[] buffer = streamEncoding.GetBytes(message);
            socket.Send(BitConverter.GetBytes(buffer.Length));
            socket.Send(buffer);
        }

        public void Send(byte[] buffer)
        {
            socket.Send(BitConverter.GetBytes(buffer.Length));
            socket.Send(buffer);
        }

        public string Receive() {
            byte[] buffer_length = new byte[4];
            socket.Receive(buffer_length);
            byte[] buffer = new byte[BitConverter.ToInt32(buffer_length, 0)];
            socket.Receive(buffer);
            return streamEncoding.GetString(buffer);
        }
    }
}
