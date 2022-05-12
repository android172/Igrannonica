import os
import requests

def draw_scatter_plot(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    # Create graph
    file_name = 'requested_image.png'
    file_path = os.path.join(os.curdir, 'data', self.experiment_id, file_name)
    accepted = self.network.data.draw_scatter_plot(columns, file_path)
    
    if not accepted:
        self.report_error("ERROR :: Input columns not accepted; Graph couldn't be drawn.")
        return
    
    # Upload graph
    upload_image(self, file_name, file_path)
    
    self.connection.send("OK")
    print(f"Scatter plot for columns {columns} requested.")

def draw_box_plot(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    # Create graph
    file_name = 'requested_image.png'
    file_path = os.path.join(os.curdir, 'data', self.experiment_id, file_name)
    accepted = self.network.data.draw_box_plot(columns, file_path)
    
    if not accepted:
        self.report_error("ERROR :: Input columns not accepted; Graph couldn't be drawn.")
        return
    
    # Upload graph
    upload_image(self, file_name, file_path)
    
    self.connection.send("OK")
    print(f"Box plot for columns {columns} requested.")

def draw_violin_plot(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    # Create graph
    file_name = 'requested_image.png'
    file_path = os.path.join(os.curdir, 'data', self.experiment_id, file_name)
    accepted = self.network.data.draw_violin_plot(columns, file_path)
    
    if not accepted:
        self.report_error("ERROR :: Input columns not accepted; Graph couldn't be drawn.")
        return
    
    # Upload graph
    upload_image(self, file_name, file_path)
    
    self.connection.send("OK")
    print(f"Violin plot for columns {columns} requested.")

def draw_bar_plot(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    # Create graph
    file_name = 'requested_image.png'
    file_path = os.path.join(os.curdir, 'data', self.experiment_id, file_name)
    accepted = self.network.data.draw_bar_plot(columns, file_path)
    
    if not accepted:
        self.report_error("ERROR :: Input columns not accepted; Graph couldn't be drawn.")
        return
    
    # Upload graph
    upload_image(self, file_name, file_path)
    
    self.connection.send("OK")
    print(f"Bar plot for columns {columns} requested.")

def draw_histogram(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    # Create graph
    file_name = 'requested_image.png'
    file_path = os.path.join(os.curdir, 'data', self.experiment_id, file_name)
    accepted = self.network.data.draw_histogram(columns, file_path)
    
    if not accepted:
        self.report_error("ERROR :: Input columns not accepted; Graph couldn't be drawn.")
        return
    
    # Upload graph
    upload_image(self, file_name, file_path)
    
    self.connection.send("OK")
    print(f"Histogram for columns {columns} requested.")

def draw_hexbin(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    # Create graph
    file_name = 'requested_image.png'
    file_path = os.path.join(os.curdir, 'data', self.experiment_id, file_name)
    accepted = self.network.data.draw_hexbin(columns, file_path)
    
    if not accepted:
        self.report_error("ERROR :: Input columns not accepted; Graph couldn't be drawn.")
        return
    
    # Upload graph
    upload_image(self, file_name, file_path)
    
    self.connection.send("OK")
    print(f"Hexbin for columns {columns} requested.")
    
def draw_density_plot(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    # Create graph
    file_name = 'requested_image.png'
    file_path = os.path.join(os.curdir, 'data', self.experiment_id, file_name)
    accepted = self.network.data.draw_density_plot(columns, file_path)
    
    if not accepted:
        self.report_error("ERROR :: Input columns not accepted; Graph couldn't be drawn.")
        return
    
    # Upload graph
    upload_image(self, file_name, file_path)
    
    self.connection.send("OK")
    print(f"Density plot for columns {columns} requested.")
    
def draw_pie_plot(self):
    # Receive columns
    column = int(self.connection.receive())
    if not self.network.data.columns_are_valid([column]):
        self.report_error("ERROR :: Illegal column given.")
        return
    
    # Create graph
    file_name = 'requested_image.png'
    file_path = os.path.join(os.curdir, 'data', self.experiment_id, file_name)
    accepted = self.network.data.draw_pie_plot(column, file_path)
    
    if not accepted:
        self.report_error("ERROR :: Input column must be categorical.")
        return
    
    # Upload graph
    upload_image(self, file_name, file_path)
    
    self.connection.send("OK")
    print(f"Pie plot for column {column} requested.")
    
# Helper functions #
def upload_image(self, file_name, file_path):
    files = {'file' : (file_name, open(file_path, 'rb'))}
            
    response = requests.post(
        f"http://localhost:5008/api/file/update/{self.experiment_id}", 
        headers={"Authorization" : f"Bearer {self.token}"}, 
        files=files
    )

    if response.status_code != 200:
        self.report_error(f"ERROR :: Couldn't upload image; Error code {response.status_code}")
        return    