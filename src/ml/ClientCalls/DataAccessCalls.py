import json

def get_rows(self):
    # Receive row indices
    row_string = self.connection.receive()
    row_indices = [int(x) for x in row_string.split(":")]
    try: data = self.network.data.get_rows(row_indices)
    except:
        self.report_error("ERROR :: Invalid row requested.")
        return
    
    self.connection.send("OK")
    self.connection.send(data.to_json(orient='records'))
    
    print(f"Rows: {row_indices} requested.")

def get_columns(self):
    # Receive dataset version
    version = self.connection.receive()
    
    columns = self.network.data.get_columns(version)
    
    if columns is None:
        self.report_error("ERROR :: Dataset version doesn't exist.")
        return

    self.connection.send("OK")
    self.connection.send(columns)
    
    print(f"Columns for version '{version}' requested.")
    
def get_row_count(self):
    count = self.network.data.get_row_count()
    self.connection.send(count)
    
    print(f"Row count ({count}) requested.")
    
def get_column_types(self):
    column_types = self.network.data.get_column_types()
    self.connection.send(json.dumps(column_types))
    
    print(f"Column types requested.")

def get_column_numerical(self):
    columns = self.network.data.get_column_numerical()
    self.connection.send(json.dumps(columns))
    
    print(f"Column numerical check requested.")
