
import requests
import os

def save_model(self):
    # Receive model identification
    model_id = int(self.connection.receive())
    
    network = self.network
    running_network = self.active_models.get(model_id, None)
    if running_network is not None:
        network = running_network
    
    # Receive model name
    model_name = self.connection.receive()
    
    experiment_id = self.experiment_id
    model_dir = os.path.join(os.curdir, 'data', experiment_id, 'models')
    model_path = os.path.join(model_dir, f"{model_name}.pt")
    
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
    
    if not network.save_weights(model_path):
        self.report_error("ERROR :: ANN settings not set, can't create a network.")
        return
    
    response = requests.post(
        f"http://localhost:5008/api/file/uploadModel/{experiment_id}", 
        headers={"Authorization" : f"Bearer {self.token}"}, 
        params={"modelName" : model_name},
        files={'file' : (f"{model_name}.pt", open(model_path, 'rb'))}
    )
    
    if response.status_code != 200:
        self.report_error(f"ERROR :: Couldn't upload the model; Error code {response.status_code}")
        return
    
    self.connection.send("OK")
    print("Model weights saved.")
    
def load_model(self):
    # Receive model name
    model_name = self.connection.receive()
    
    experiment_id = self.experiment_id
    model_dir = os.path.join(os.curdir, 'data', experiment_id, 'models')
    model_path = os.path(model_dir, f"{model_name}.pt")
    
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
    
    response = requests.post(
        f"http://localhost:5008/api/file/downloadModel/{experiment_id}", 
        headers={"Authorization" : f"Bearer {self.token}"}, 
        params={"modelName" : model_name}
    )
    
    if response.status_code != 200:
        self.report_error(f"ERROR :: Couldn't download requested model; Error code {response.status_code}.")
        return

    with open(model_path, "wb") as file:
        file.write(response.content)
    
    if not self.network.load_weights(model_path):
        self.report_error("ERROR :: Wrong model shape given.")
        return
    
    self.connection.send("OK")
    print(f"Model {model_name} loaded.")

def load_epoch(self):
    # Receive epoch to load
    epoch = self.connection.receive()
    
    if not self.network.load_weights_at(epoch):
        self.report_error("ERROR :: Wrong model shape given.")
        return
        
    self.connection.send("OK")
    print(f"Model loaded from epoch {epoch}")
