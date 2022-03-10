using System;
using System.IO;
using System.IO.Pipes;
using System.Net.Sockets;
using System.Text;

namespace backend {
    class Program {

        public static readonly string ipAddress = "127.0.0.1";
        public static readonly int port = 25001;
        private static Socket socket;

        private static UTF8Encoding streamEncoding = new();

        static void Main(string[] args) {
            socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

            Console.WriteLine("Connecting to server...\n");
            socket.Connect(ipAddress, port);
            if (!socket.Connected) {
                Console.WriteLine("Connection Failed.");
                return;
            }

            Console.WriteLine("Sending data...");
            byte[] msg = streamEncoding.GetBytes("512:2");
            socket.Send(msg);

            socket.Close();
        }
    }

}
