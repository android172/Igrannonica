from signalrcore.hub_connection_builder import HubConnectionBuilder

class SignalRConnection:
    def __init__(self, token, event) -> None:
        self.token = token
        self.method = ""
        self.hub_connection = HubConnectionBuilder().with_url('http://localhost:5008/hub').build()
        self.hub_connection.on_open(lambda: self.on_open(event))
        self.hub_connection.on_error(lambda data: print(f"SignalR :: An exception was thrown closed :: {data.error}"))
        self.hub_connection.start()
    
    def on_open(self, event):
        event.set()
        print("SignalR :: Connection established.")
    
    def set_method(self, method):
        self.method = method
    
    def send_to_front(self, param):
        try:
            self.hub_connection.send(
                'ForwardToFrontEnd', 
                [self.token, self.method, str(param)]
            )
        except:
            print(f"SignalR :: There has been an error invoking /{self.method}/ with params: {param}")