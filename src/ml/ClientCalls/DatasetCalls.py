import requests
from threading import Thread
from io import BytesIO
import os

def is_dataset_loaded(self):
    # Receive experiment id
    experiment_id = self.connection.receive()
    loaded = self.network.data.dataset is not None and experiment_id == self.experiment_id
    self.connection.send(loaded)
    
    print(f"Is Dataset loaded returned {loaded}.")

def load_dataset(self):
    # Receive experiment id
    experiment_id = self.connection.receive()
    self.experiment_id = experiment_id
    # Receive dataset name
    file_name = self.connection.receive()
    
    if self.network.data.load_dataset_version(file_name):
        self.connection.send("OK")
        print("Dataset loaded.")
        return
    
    file_dir = os.path.join(os.curdir, 'data', experiment_id)
    file_path = os.path.join(file_dir, file_name)
    
    if not os.path.exists(file_dir):
        os.makedirs(file_dir)
    
    response = requests.post(
        f"http://localhost:5008/api/file/download/{experiment_id}", 
        headers={"Authorization" : f"Bearer {self.token}"},
        params={"versionName" : file_name}
    )
    
    if response.status_code != 200:
        self.report_error("ERROR :: Couldn't download requested dataset from server; " +
                            f"Error code {response.status_code}.")
        return
        
    with open(file_path, "wb") as file:
        Thread(target = lambda : file.write(response.content)).start()
        
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
    
    self.connection.send("OK")
    print("Dataset loaded.")
    
def load_test_data(self):
    # Receive data
    data = self.connection.receive_bytes()
    # Receive file name
    file_name = self.connection.receive()
        
    extension = file_name.split(".")[-1]
    if   extension == 'csv':
        self.network.data.load_test_from_csv(BytesIO(data))
    elif extension == 'json':
        self.network.data.load_test_from_json(BytesIO(data))
    elif extension in ['xls', 'xlsx', 'xlsm', 'xlsb', 'odf', 'ods', 'odt']:
        self.network.data.load_test_from_excel(BytesIO(data))
    else:
        self.report_error(f"ERROR :: File type with extension .{extension} is not supported.")
        return
    
    self.connection.send("OK")
    print("Test Dataset loaded.")

def save_dataset(self):
    # Receive dataset name
    file_name = self.connection.receive()
    
    experiment_id = self.experiment_id
    file_dir = os.path.join(os.curdir, 'data', experiment_id)
    file_path = os.path.join(file_dir, file_name)
    
    if not os.path.exists(file_dir):
        os.makedirs(file_dir)
    
    extension = file_name.split(".")[-1]
    if   extension == 'csv':
        self.network.data.save_to_csv(file_path)
    elif extension == 'json':
        self.network.data.save_to_json(file_path)
    elif extension in ['xls', 'xlsx', 'xlsm', 'xlsb', 'odf', 'ods', 'odt']:
        self.network.data.save_to_excel(file_path)
    else:
        self.report_error("ERROR :: Internal MLServer error." +
                            f" :: File type with extension .{extension} found." +
                            " :: File type not supported.")
        return
    
    files = {'file' : (file_name, open(file_path, 'rb'))}
    
    response = requests.post(
        f"http://localhost:5008/api/file/update/{experiment_id}", 
        headers={"Authorization" : f"Bearer {self.token}"}, 
        files=files
    )
    
    if response.status_code != 200:
        self.report_error(f"ERROR :: Couldn't update the file; Error code {response.status_code}")
        return
    
    self.network.data.save_dataset_version(file_name)
    
    self.connection.send("OK")
    print("Changes saved.")

def select_inputs(self):
    # Receive inputs
    inputs_string = self.connection.receive()
    inputs = [int(x) for x in inputs_string.split(":")]
    if not self.network.data.columns_are_valid(inputs, self.network.dataset_version):
        self.report_error("ERROR :: Illegal columns selected.")
        return
    
    if not self.network.data.select_input_columns(inputs, self.network.dataset_version):
        self.report_error("ERROR :: All input columns need to be numerical or encoded.")
        return
    
    self.connection.send("OK")
    print("Inputs selected.")

def select_outputs(self):
    # Receive outputs
    outputs_string = self.connection.receive()
    outputs = [int(x) for x in outputs_string.split(":")]
    if not self.network.data.columns_are_valid(outputs, self.network.dataset_version):
        self.report_error("ERROR :: Illegal columns selected.")
        return
    
    if not self.network.data.select_output_columns(outputs, self.network.dataset_version):
        self.report_error("ERROR :: All output columns need to be numerical or encoded.")
        return
    
    self.connection.send("OK")
    print("Outputs selected")

def random_train_test_split(self):
    # Receive ratio
    ratio = float(self.connection.receive())
    if ratio < 0.0 or ratio > 1.0:
        self.report_error("ERROR :: Illegal ratio given.")
        return
    self.network.data.random_train_test_split(ratio)
    
    self.connection.send("OK")
    print("Random train-test split preformed.")
    
def toggle_column_type(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = [int(x) for x in columns_string.split(":")]
    if not self.network.data.columns_are_valid(columns):
        self.report_error("ERROR :: Illegal columns given.")
        return
    
    self.network.data.toggle_column_data_type(columns)
    
    self.connection.send("OK")
    print(f"Numerical statistics computed for columns {columns}.")