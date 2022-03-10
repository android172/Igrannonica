from threading import Thread

class MLClientInstance(Thread):
    
    def setupConnection(self, connection) -> None:
        self.connection = connection
    
    def run(self) -> None:
        super().run()
        
        message = self.connection.send("HI!")
        print(message)
        self.connection.send("")
            