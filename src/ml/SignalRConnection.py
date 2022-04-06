from signalrcore.hub_connection_builder import HubConnectionBuilder

class SignalRConnection:
    def __init__(self, token) -> None:
        self.token = token
        self.method = ""
        self.hub_connection = HubConnectionBuilder().with_url('http://localhost:5008/hub').build()
        self.hub_connection.on_open(lambda: print("SignalR :: Connection established."))
        self.hub_connection.on_error(lambda data: print(f"SignalR :: An exception was thrown closed :: {data.error}"))
        self.hub_connection.start()
    
    def set_method(self, method):
        self.method = method
    
    def send_string(self, string):
        self.hub_connection.send(
            self.method, 
            [self.token, string]
        )