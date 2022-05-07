import json

def numerical_statistics(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    statistics = self.network.data.get_numerical_statistics(columns)
    if statistics is None:
        self.report_error("ERROR :: Not all columns are numerical.")
        return
    
    self.connection.send("OK")
    self.connection.send(json.dumps(statistics))
    
    print(f"Numerical statistics computed for columns {columns}.")
    
def categorical_statistics(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    statistics = self.network.data.get_categorical_statistics(columns)
    
    self.connection.send("OK")
    self.connection.send(json.dumps(statistics))
    
    print(f"Categorical statistics computed for columns {columns}.")

def all_statistics(self):
    numerical_columns = []
    categorical_columns = []
    for i, column_type in enumerate(self.network.data.get_column_types()):
        if column_type == 'Categorical':
            categorical_columns.append(i)
        else:
            numerical_columns.append(i)
    
    statistics = {}
    if len(numerical_columns) > 0:
        for k, v in self.network.data.get_numerical_statistics(numerical_columns).items():
            statistics[k] = v
    if len(categorical_columns) > 0:
        for k, v in self.network.data.get_categorical_statistics(categorical_columns).items():
            statistics[k] = v
    
    self.connection.send(json.dumps(statistics))
    
    print(f"Categorical and Numerical statistics computed for all columns.")