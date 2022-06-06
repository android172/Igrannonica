# Dependencies:
#    torch
#    numpy
#    pandas
#    sklearn
#    openpyxl
#    requests
#    signalrcore
#    matplotlib
#    xlrd
#    xlwt

import socket
from MLClientInstance import MLClientInstance

from MLConnection import MLConnection

from matplotlib.pyplot import  switch_backend

# Global Constants
ipAddress, port = "127.0.0.1", 25001

class MLServer:
    def __init__(self) -> None:
        self.socket = socket.socket()
        socket.setdefaulttimeout(None)
        self.socket.bind((ipAddress, port))
        self.socket.listen(30)
        
    def accept(self):
        client, client_address = self.socket.accept()
        ml_connection = MLConnection(client, client_address)
        
        instance = MLClientInstance()
        instance.setupConnection(ml_connection)
        instance.start()
        
        return client_address
        
    def start(self):
        print("Server Started.")
        while True:
            address = self.accept()
            print(f"Client connected at: {address}")
        
if __name__ == "__main__":
    switch_backend('agg')
    server = MLServer()
    server.start()