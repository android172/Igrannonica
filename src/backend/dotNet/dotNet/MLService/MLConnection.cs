using dotNet.Models;
using Microsoft.Extensions.Options;
using System.Net.Sockets;
using System.Text;

namespace dotNet.MLService {
    public class MLConnection {

        private readonly Socket socket;
        private readonly UTF8Encoding streamEncoding;

        public MLConnection() {
            socket = new(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            socket.Connect("127.0.0.1", 25001);
            streamEncoding = new();
        }

        public void Send(string message) {
            byte[] buffer = streamEncoding.GetBytes(message);
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
