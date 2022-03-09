using System;
using System.IO;
using System.IO.Pipes;
using System.Text;

namespace backend {
    class Program {
        static void Main(string[] args) {
            var pipeClient = new NamedPipeClientStream(
                ".", "testpipe",
                 PipeDirection.InOut, 
                 PipeOptions.None
            );

            Console.WriteLine("Connecting to server...\n");
            pipeClient.Connect();
            
            var stringStream = new StringStream(pipeClient);

            Console.WriteLine("Sending data...");
           stringStream.WriteString("512:2");

            pipeClient.Close();
        }
    }

    internal class StringStream {

        private Stream ioStream;
        private UTF8Encoding streamEncoding;

        public StringStream(Stream ioStream) {
            this.ioStream = ioStream;
            streamEncoding = new UTF8Encoding();
        }

        public string ReadString() {
            int len;
            len = ioStream.ReadByte() * 256;
            len += ioStream.ReadByte();
            var inBuffer = new byte[len];
            ioStream.Read(inBuffer, 0, len);

            return streamEncoding.GetString(inBuffer);
        }

        public int WriteString(string outString) {
            byte[] outBuffer = streamEncoding.GetBytes(outString);
            int len = outBuffer.Length;
            if (len > UInt16.MaxValue)
                len = UInt16.MaxValue;
            ioStream.Write(outBuffer, 0, len);
            ioStream.Flush();

            return outBuffer.Length + 2;
        }
    }
}
