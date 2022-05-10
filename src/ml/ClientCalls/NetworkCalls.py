from threading import Thread
from io import BytesIO
import threading
import requests
import json
import os

from SignalRConnection import SignalRConnection
from Models.ANNSettings import ANNSettings

def compute_metrics(self):
    if len(self.network.data.train_indices) == 0:
        self.report_error("ERROR :: Train dataset not selected.")
        return
    if len(self.network.data.test_indices) == 0:
        self.report_error("ERROR :: Test dataset not selected.")
        return
    
    Thread(target = lambda : compute_metrics(self)).start()

def change_settings(self):
    # Receive settings to change to
    settingsString = self.connection.receive()
    annSettings = ANNSettings.load(settingsString)
    self.network.load_settings(annSettings)
    self.network.create_new_network()
    
    print("ANN settings changed.")

def select_traning_data(self):
    # Receive data version
    version_name = self.connection.receive()
    
    if not self.network.data.contains_dataset_version(version_name):
        file_name = version_name
        file_dir = os.path.join(os.curdir, 'data', self.experiment_id)
        file_path = os.path.join(file_dir, file_name)
        
        if not os.path.exists(file_dir):
            os.makedirs(file_dir)
        
        response = requests.post(
            f"http://localhost:5008/api/file/download/{self.experiment_id}", 
            headers={"Authorization" : f"Bearer {self.token}"},
            params={"versionName" : file_name}
        )
        
        if response.status_code != 200:
            self.report_error("ERROR :: Couldn't download requested dataset from server; " +
                            f"Error code {response.status_code}.")
            return
            
        with open(file_path, "wb") as file:
            Thread(target = lambda : file.write(response.content)).start()
            
        current_ds = self.network.data.dataset
        current_ct = self.network.data.column_types
        current_dt = self.network.data.column_data_ty
            
        extension = file_name.split(".")[-1]
        if   extension == 'csv':
            self.network.data.load_from_csv(BytesIO(response.content))
        elif extension == 'json':
            self.network.data.load_from_json(BytesIO(response.content))
        elif extension in ['xls', 'xlsx', 'xlsm', 'xlsb', 'odf', 'ods', 'odt']:
            self.network.data.load_from_excel(BytesIO(response.content))
        else:
            self.report_error(f"ERROR :: File type with extension .{extension} is not supported.")
            return
        
        self.network.data.save_dataset_version(file_name)
        
        self.network.data.dataset        = current_ds
        self.network.data.column_types   = current_ct
        self.network.data.column_data_ty = current_dt
    
    self.network.data_version = version_name
    
    self.connection.send("OK")
    print("Traning datset selected.")
    
def start(self):
    # Initialize random data if no dataset is selected
    if self.network.data.dataset is None:
        self.network.initialize_random_data()
        
    self.last_active_id += 1
    id = self.last_active_id
    
    # Setup network
    ann = self.network.create_deep_copy()
    
    # Train
    Thread(target= lambda : train(self.token, id, ann)).start()
    
    running_model = ann.isRunning
    self.active_models = {id : running_model}
    running_model.set()
    
    print("Traning commences.")
    
def stop(self):
    # Receive model identifier
    model_id = int(self.connection.receive())
    
    running_model = self.active_models.get(model_id, None)
    if running_model is None:
        self.report_error("ERROR :: Wrong model identifier.")
        return

    running_model.clear()

    self.connection.send("OK")
    print("Traning stopped.")

def continue_training(self):
    # Receive model identifier
    model_id = int(self.connection.receive())
    
    running_model = self.active_models.get(model_id, None)
    if running_model is None:
        self.report_error("ERROR :: Wrong model identifier.")
        return

    running_model.set()

    self.connection.send("OK")
    print("Traning continued.")
    
# Helper functions #
def compute_metrics(self):
    # Setup dataset version
    if self.network.dataset_version is not None:
        if not self.network.data.load_dataset_version(self.network.dataset_version):
            self.report_error("ERROR :: Selected dataset not recognized.")
            return
    
    if self.network.isRegression:
        train = self.network.compute_regression_statistics("train")
        test = self.network.compute_regression_statistics("test")
    else:
        train = self.network.compute_classification_statistics("train")
        test = self.network.compute_classification_statistics("test")
        
    self.connection.send("OK")
    self.connection.send(json.dumps({"test": test, "train": train}))

    print("Network statistics requested.")
    
def train(token, id, network):
    connection_established = threading.Event()
    sr_connection = SignalRConnection(token, connection_established)
    
    # Setup dataset version
    if network.dataset_version is not None:
        if not network.data.load_dataset_version(network.dataset_version):
            sr_connection.set_method("SendError")
            sr_connection.send_to_front("ERROR :: Selected dataset not recognized.")
            return
        
    # Wait for connection
    connection_established.wait()
    
    # Announce self
    sr_connection.set_method("StartModelTraining")
    sr_connection.send_to_front(id)
    
    sr_connection.set_method("Loss")
    for loss in network.train():
        results = {
            'modelId' : id,
            'epochRes' : loss
        }
        sr_connection.send_to_front(json.dumps(results))
        
    sr_connection.set_method("FinishModelTraining")
    sr_connection.send_to_front(id)
    
    print("Traning complete.")