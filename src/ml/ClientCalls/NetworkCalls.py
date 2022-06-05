from threading import Thread
from io import BytesIO
import threading
import requests
import json
import os

from sklearn.model_selection import learning_curve

from SignalRConnection import SignalRConnection
from Models.ANNSettings import ANNSettings

def compute_metrics(self):
    # receive model identifier
    model_id = int(self.connection.receive())
    
    if self.network.data.get_train_count == 0:
        self.report_error("ERROR :: Train dataset not selected.")
        return
    if self.network.data.get_test_count == 0:
        self.report_error("ERROR :: Test dataset not selected.")
        return
    
    if model_id == -1:
        ann = self.network.create_deep_copy()
    else:
        ann = self.active_models.get(model_id, None)
        if ann is None:
            self.report_error("ERROR :: Wrong model identifier.")
            return
    
    if ann.isRunning.is_set():
        self.report_error("ERROR :: Network is currently running.")
        return
    
    # Setup dataset version
    if ann.dataset_version is not None:
        if not ann.data.load_dataset_version(ann.dataset_version):
            self.report_error("ERROR :: Selected dataset not recognized.")
            return
    
    if ann.isRegression:
        train = ann.compute_regression_statistics("train")
        test = ann.compute_regression_statistics("test")
    else:
        train = ann.compute_classification_statistics("train")
        test = ann.compute_classification_statistics("test")
    
    if train == None: train = ""
    if test  == None: test  = ""
        
    self.connection.send("OK")
    self.connection.send(json.dumps({"test": test, "train": train}))

    print("Network statistics requested.")
    
def predict(self):
    # receive inputs
    inputs_string = self.connection.receive()
    inputs = json.loads(inputs_string)["Data"]
    
    # receive model identifier
    model_id = int(self.connection.receive())
    
    if model_id == 0:
        active_network = self.network
    else:
        active_network = self.active_models.get(model_id, None)
        if active_network is None:
            self.report_error("ERROR :: Wrong model identifier.")
            return
    
    if len(inputs) != active_network.input_size:
        self.report_error(f"ERROR :: Wrong number of arguments passed ({len(inputs)} insted of {active_network.input_size}).")
        return
    
    if active_network.isRunning.is_set():
        self.report_error("ERROR :: Network is currently running.")
        return

    try: parsed_inputs = [float(x) for x in inputs]
    except:
        self.report_error(f"ERROR :: All arguments must be convertable to float.")
        return
    
    outputs = active_network.predict(parsed_inputs)
    
    self.connection.send("OK")
    self.connection.send(outputs)
    
    print(f"Prediction computed: {inputs} -> {outputs}")
    

def change_settings(self):
    # Receive settings to change to
    settingsString = self.connection.receive()
    annSettings = ANNSettings.load(settingsString)
    self.network.load_settings(annSettings)
    
    print("ANN settings changed.")
    
def create_new_network(self):
    if not self.network.create_new_network():
        self.report_error("ERROR :: ANN settings not set, can't create a network.")
        return
    
    self.connection.send("OK")
    print("New ANN created.")

def select_training_data(self):
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
    print("Training dataset selected.")
    
def start(self):
    # Receive id
    id = int(self.connection.receive())
    
    # Initialize random data if no dataset is selected
    if self.network.data.dataset is None:
        self.network.initialize_random_data()
        
    # Setup network
    ann = self.network.create_deep_copy()
    
    if ann.isRegression == False:
        if not ann.setup_output_columns():
            self.report_error("ERROR :: Output column is of wrong format.")
            return
    
    ann.id = id
    self.active_models[id] = ann
    ann.isRunning.set()
    
    # Train
    Thread(target= lambda : train(self.token, ann)).start()
    
    self.connection.send("OK")
    print("Training commences.")
    
def stop(self):
    # Receive model identifier
    model_id = int(self.connection.receive())
    
    running_network = self.active_models.get(model_id, None)
    if running_network is None:
        self.report_error("ERROR :: Wrong model identifier.")
        return

    running_network.isRunning.clear()

    self.connection.send("OK")
    print("Training stopped.")

def continue_training(self):
    # Receive model identifier
    model_id = int(self.connection.receive())
    # Receive number of epochs
    number_of_epochs = int(self.connection.receive())
    # Receive learning rate
    learning_rate = float(self.connection.receive())
    
    running_network = self.active_models.get(model_id, None)
    if running_network is None:
        self.report_error("ERROR :: Wrong model identifier.")
        return

    running_network.update_settings(number_of_epochs, learning_rate)

    running_network.isRunning.set()

    self.connection.send("OK")
    print("Training continued.")

def dismiss_training(self):
    # Receive model identifier
    model_id = int(self.connection.receive())
    
    running_network = self.active_models.get(model_id, None)
    if running_network is None:
        self.report_error("ERROR :: Wrong model identifier.")
        return
    
    running_network.kys = True
    self.active_models[model_id] = None
    
    self.connection.send("OK")
    print("Training dismissed.")
    
# Helper functions #
def train(token, network):
    connection_established = threading.Event()
    sr_connection = SignalRConnection(token, connection_established)
        
    # Wait for connection
    connection_established.wait()
    
    # Announce self
    sr_connection.set_method("StartModelTraining")
    sr_connection.send_to_front(network.id)
    
    sr_connection.set_method("Loss")
    for loss in network.train():
        results = {
            'modelId' : network.id,
            'epochRes' : loss
        }
        sr_connection.send_to_front(json.dumps(results))
    network.isRunning.clear()
    sr_connection.set_method("FinishModelTraining")
    sr_connection.send_to_front(network.id)
    
    print("Training complete.")