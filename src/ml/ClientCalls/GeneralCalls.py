def select_token(self):
    # Receive token
    self.token = self.connection.receive()
    
    print("Token set.")