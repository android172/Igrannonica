def setup_user(self):
    # Receive token
    self.token = self.connection.receive()
    self.experiment_id = self.connection.receive()
    
    print("Token set.")