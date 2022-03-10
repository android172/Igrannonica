

import struct


class MLConnection:
    
    def __init__(self, socket, ipAddress) -> None:
        self.socket = socket
        self.ipAddress = ipAddress
    
    def receive(self):
        buffer_length = struct.unpack("<I", self.socket.recv(4))[0]
        return self.socket.recv(buffer_length).decode()
    
    def send(self, message):
        buffer = message.encode()
        buffer_length = len(buffer)
        self.socket.sendall(struct.pack("<I", buffer_length))
        self.socket.sendall(buffer)
        
    def close(self):
        self.socket.close()