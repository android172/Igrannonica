import json
import requests
from threading import Thread
from io import BytesIO
import os
from shutil import rmtree

from ANN import ANN
from ANNSettings import ANNSettings
from SignalRConnection import SignalRConnection

class MLClientInstance(Thread):
    
    def setupConnection(self, connection) -> None:
        self.connection = connection
        self.token = ""
        self.experiment_id = 1
    
    def run(self) -> None:
        super().run()
        
        network = ANN()
        
        while True:
            # Receive command
            received = self.connection.receive()
                
            # Load token
            if received == 'SetToken':
                # Receive token
                self.token = self.connection.receive()
                
                print("Token set.")
                
            # Load data #
            elif received == 'IsDataLoaded':
                # Receive experiment id
                experiment_id = self.connection.receive()
                loaded = network.data.dataset is not None and experiment_id == self.experiment_id
                self.connection.send(loaded)
                
                print(f"Is Dataset loaded returned {loaded}.")
            
            elif received == 'LoadData':
                # Receive experiment id
                experiment_id = self.connection.receive()
                self.experiment_id = experiment_id
                # Receive dataset name
                file_name = self.connection.receive()
                file_dir = os.path.join(os.curdir, 'data', experiment_id)
                file_path = os.path.join(file_dir, file_name)
                
                # Clean of previous datasets
                if os.path.exists(file_dir):
                    rmtree(file_dir)
                os.makedirs(file_dir)
                
                response = requests.post(
                    f"http://localhost:5008/api/file/download/{experiment_id}", 
                    headers={"Authorization" : f"Bearer {self.token}"}
                )
                
                if response.status_code != 200:
                    self.report_error("ERROR :: Couldn't download requested dataset from server; " +
                                      f"Error code {response.status_code}.")
                    return
                    
                with open(file_path, "wb") as file:
                    Thread(target = lambda : file.write(response.content)).start()
                    
                extension = file_name.split(".")[-1]
                if   extension == 'csv':
                    network.data.load_from_csv(BytesIO(response.content))
                elif extension == 'json':
                    network.data.load_from_json(BytesIO(response.content))
                elif extension in ['xls', 'xlsx', 'xlsm', 'xlsb', 'odf', 'ods', 'odt']:
                    network.data.load_from_excel(BytesIO(response.content))
                else:
                    self.report_error(f"ERROR :: File type with extension .{extension} is not supported.")
                    return
                
                self.connection.send("OK")
                print("Dataset loaded.")
                
            elif received == 'LoadTestData':
                # Receive data
                data = self.connection.receive_bytes()
                # Receive file name
                file_name = self.connection.receive()
                    
                extension = file_name.split(".")[-1]
                if   extension == 'csv':
                    network.data.load_test_from_csv(BytesIO(data))
                elif extension == 'json':
                    network.data.load_test_from_json(BytesIO(data))
                elif extension in ['xls', 'xlsx', 'xlsm', 'xlsb', 'odf', 'ods', 'odt']:
                    network.data.load_test_from_excel(BytesIO(data))
                else:
                    self.report_error(f"ERROR :: File type with extension .{extension} is not supported.")
                    return
                
                self.connection.send("OK")
                print("Test Dataset loaded.")
                
            elif received == 'SaveDataset':
                experiment_id = self.experiment_id
                file_dir = os.path.join(os.curdir, 'data', experiment_id)
                
                if not os.path.exists(file_dir):
                    self.report_error("ERROR :: File does not exist.")
                    return
                
                dir_files = os.listdir(file_dir)
                if len(dir_files) == 0:
                    self.report_error("ERROR :: File does not exist.")
                    return
                
                file_name = dir_files[0]
                file_path = os.path.join(file_dir, file_name)
                
                extension = file_name.split(".")[-1]
                if   extension == 'csv':
                    network.data.save_to_csv(file_path)
                elif extension == 'json':
                    network.data.save_to_json(file_path)
                elif extension in ['xls', 'xlsx', 'xlsm', 'xlsb', 'odf', 'ods', 'odt']:
                    network.data.save_to_excel(file_path)
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
                
                self.connection.send("OK")
                print("Changes saved.")
            
            elif received == 'SelectInputs':
                # Receive inputs
                inputs_string = self.connection.receive()
                inputs = [int(x) for x in inputs_string.split(":")]
                if not network.data.columns_are_valid(inputs):
                    self.report_error("ERROR :: Illegal columns selected.")
                    return
                
                if not network.data.select_input_columns(inputs):
                    self.report_error("ERROR :: All input columns need to be numerical or encoded.")
                    return
                
                self.connection.send("OK")
                print("Inputs selected.")
                
            elif received == 'SelectOutputs':
                # Receive outputs
                outputs_string = self.connection.receive()
                outputs = [int(x) for x in outputs_string.split(":")]
                if not network.data.columns_are_valid(outputs):
                    self.report_error("ERROR :: Illegal columns selected.")
                    return
                
                if not network.data.select_output_columns(outputs):
                    self.report_error("ERROR :: All output columns need to be numerical or encoded.")
                    return
                
                self.connection.send("OK")
                print("Outputs selected")
                
            elif received == 'RandomTrainTestSplit':
                # Receive ratio
                ratio = float(self.connection.receive())
                if ratio < 0.0 or ratio > 1.0:
                    self.report_error("ERROR :: Illegal ratio given.")
                    return
                network.data.random_train_test_split(ratio)
                
                self.connection.send("OK")
                print("Random train-test split preformed.")
            
            # Data access #
            
            elif received == 'GetRows':
                # Receive row indices
                row_string = self.connection.receive()
                row_indices = [int(x) for x in row_string.split(":")]
                try: data = network.data.get_rows(row_indices)
                except:
                    self.report_error("ERROR :: Invalid row requested.")
                    return
                
                self.connection.send("OK")
                self.connection.send(data.to_json(orient='records'))
                
                print(f"Rows: {row_indices} requested.")
                
            elif received == 'GetRowCount':
                count = network.data.get_row_count()
                self.connection.send(count)
                
                print(f"Row count ({count}) requested.")
                
            elif received == 'GetColumnTypes':
                column_types = network.data.get_column_types()
                self.connection.send(json.dumps(column_types))
                
                print(f"Column types requested.")
            
            # Data manipulation : CRUD operation #
            
            elif received == 'AddRow':
                # Receive row values
                row_string = self.connection.receive()
                new_row = json.loads(row_string)["Data"]
                return_code = network.data.add_row(new_row)
                if return_code >= 0:
                    self.report_error(f"ERROR :: Invalid type for column {i} given.")
                    return
                
                self.connection.send("OK")
                print(f"Row: {new_row} added to the dataset.")
            
            elif received == 'AddRowToTest':
                # Receive row values
                row_string = self.connection.receive()
                new_row = json.loads(row_string)["Data"]
                return_code = network.data.add_row(new_row, True)
                if return_code >= 0:
                    self.report_error(f"ERROR :: Invalid type for column {i} given.")
                    return
                
                self.connection.send("OK")
                print(f"Row: {new_row} added to the test dataset.")
                
            elif received == 'UpdateRow':
                # Receive row index
                row_index = int(self.connection.receive())
                # Receive row values
                row_string = self.connection.receive()
                new_row = json.loads(row_string)["Data"]
                
                return_code = network.data.update_row(row_index, new_row)
                if return_code >= 0:
                    self.report_error(f"ERROR :: Invalid type for column {i} given.")
                    return
                if return_code == -2:
                    self.report_error(f"ERROR :: Row with index {row_index} doesn't exist.")
                    return
                
                self.connection.send("OK")
                print(f"Row {row_index} replaced with values: {new_row}.")
                
            elif received == 'DeleteRow':
                # Receive row index
                row = int(self.connection.receive())
                deleted = network.data.remove_row(row)
                if not deleted:
                    self.report_error(f"ERROR :: Row with index {row} doesn't exist.")
                    return
                
                self.connection.send("OK")
                print(f"Row {row} removed from the dataset.")
                
            elif received == 'AddColumn':
                # Receive column values
                column_string = self.connection.receive()
                new_column = json.loads(column_string)["Data"]
                # Receive column name
                column_name = self.connection.receive()
                network.data.add_column(new_column, column_name)
                
                print(f"Column: {new_column} added to the dataset.")
                
            elif received == 'UpdateColumn':
                # Receive column index
                column_index = int(self.connection.receive())
                # Receive column values
                column_string = self.connection.receive()
                new_column = json.loads(column_string)["Data"]
                network.data.update_column(column_index, new_column, None)
                
                print(f"Column {column_index} replaced with values: {new_column}.")
                
            elif received == 'RenameColumn':
                # Receive column index
                column_index = int(self.connection.receive())
                # Receive column name
                column_name = self.connection.receive()
                network.data.update_column(column_index, None, column_name)
                
                print(f"Column {column_index} renamed from {network.data.dataset.columns[column_index]} to {column_name}.")
                
            elif received == 'UpdateAndRenameColumn':
                # Receive column index
                column_index = int(self.connection.receive())
                # Receive column values
                column_string = self.connection.receive()
                new_column = json.loads(column_string)["Data"]
                # Receive column name
                column_name = self.connection.receive()
                network.data.update_column(column_index, new_column, column_name)
                
                print(f"Column {column_index} replaced with values: {new_column}.")
                print(f"Column {column_index} renamed from {network.data.dataset.columns[column_index]} to {column_name}.")
                
            elif received == 'DeleteColumn':
                # Receive column index
                column = int(self.connection.receive())
                network.data.remove_column(column)
                
                print(f"Column {column} removed from the dataset.")
                
            elif received == 'UpdateValue':
                # Receive row
                row = int(self.connection.receive())
                # Receive column
                column = int(self.connection.receive())
                # Receive value
                value = self.connection.receive()
                
                return_code = network.data.update_field(row, column, value)
                if return_code > 0:
                    if return_code == 1:
                        self.report_error(f"ERROR :: Row with index {row} doesn't exist.")
                    elif return_code == 2:
                        self.report_error(f"ERROR :: Column with index {column} doesn't exist.")
                    else:
                        self.report_error("ERROR :: Value given is of the invalid type.")
                    return
                
                self.connection.send("OK")
                print(f"Field ({row}, {column}) updated to {value}.")
                
            # Data manipulation : NA values #
            elif received == 'EmptyStringToNA':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                network.data.replace_value_with_na(columns, '')
                
                self.connection.send("OK")
                print(f"Empty strings from columns {columns} replaced with NA.")
            
            elif received == 'ZeroToNA':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                network.data.replace_value_with_na(columns, 0)
                
                self.connection.send("OK")
                print(f"Zero values from columns {columns} replaced with NA.")
            
            elif received == 'DropNAListwise':
                network.data.drop_na_listwise()
                
                print("All rows with any NA values dropped from dataset.")
            
            elif received == 'DropNAPairwise':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                network.data.drop_na_pairwise(columns)
                
                self.connection.send("OK")
                print("All selected rows with any NA values dropped from dataset.")
            
            elif received == 'DropNAColumns':
                network.data.drop_na_columns()
                
                print("All columns with any NA values dropped from dataset.")
                
            elif received == 'FillNAWithMean':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                if not network.data.replace_na_with_mean(columns):
                    self.report_error("ERROR :: Only numerical columns can be used.")
                    return
                
                self.connection.send("OK")
                print(f"NA values in columns {columns} replaced using mean value.")
            
            elif received == 'FillNAWithMedian':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                if not network.data.replace_na_with_median(columns):
                    self.report_error("ERROR :: Only numerical columns can be used.")
                    return
                
                self.connection.send("OK")
                print(f"NA values in columns {columns} replaced using median value.")
            
            elif received == 'FillNAWithMode':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                network.data.replace_na_with_mode(columns)
                
                self.connection.send("OK")
                print(f"NA values in columns {columns} replaced using mode value.")
            
            elif received == 'FillNAWithRegression':
                # Receive column with NA values
                column = int(self.connection.receive())
                # Receive columns for regression
                columns_string = self.connection.receive()
                input_columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(input_columns):
                    self.report_error("ERROR :: Illegal input columns given.")
                    return
                if not network.data.columns_are_valid([column]):
                    self.report_error("ERROR :: Illegal output column given.")
                    return
                
                if not network.data.replace_na_with_regression(column, input_columns):
                    self.report_error("ERROR :: Only numerical variables can be used as output.")
                    return
                
                self.connection.send("OK")
                print(f"NA values from column {column} replaced using a model fit on columns {input_columns}.")
                
            # Data manipulation : Encoding #
            elif received == 'LabelEncoding':
                # Receive columns to encode
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                network.data.label_encode_columns(columns)
                
                self.connection.send("OK")
                print(f"Columns {columns} were label encoded.")
            
            elif received == 'OneHotEncoding':
                # Receive columns to encode
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                network.data.one_hot_encode_columns(columns)
                
                self.connection.send("OK")
                print(f"Columns {columns} were one-hot encoded.")
            
            # Data manipulation : Normalization #
            elif received == 'ScaleAbsoluteMax':
                # Receive columns to scale
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                return_code = network.data.maximum_absolute_scaling(columns)
                if return_code >= 0:
                    self.report_error(f"ERROR :: Column {return_code} is not numerical.")
                    return
                
                self.connection.send("OK")
                print(f"Columns {columns} were maximum absolute scaled.")
                
            elif received == 'ScaleMinMax':
                # Receive columns to scale
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                return_code = network.data.min_max_scaling(columns)
                if return_code >= 0:
                    self.report_error(f"ERROR :: Column {return_code} is not numerical.")
                    return
                
                self.connection.send("OK")
                print(f"Columns {columns} were min-max scaled.")
                
            elif received == 'ScaleZScore':
                # Receive columns to scale
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                return_code = network.data.z_score_scaling(columns)
                if return_code >= 0:
                    self.report_error(f"ERROR :: Column {return_code} is not numerical.")
                    return
                
                self.connection.send("OK")
                print(f"Columns {columns} were z-score scaled.")
                
            # Data manipulation : Outliers #
            elif received == 'RemoveOutliersStandardDeviation':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                # Receive treshold
                treshold = float(self.connection.receive())
                
                if not network.data.standard_deviation_outlier_removal(columns, treshold):
                    self.report_error("ERROR :: Method can only be applied to numerical variables.")
                    return
                
                self.connection.send("OK")
                print(f'Outliers removed from columns {columns} using standard deviation method.')
            
            elif received == 'RemoveOutliersQuantiles':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                # Receive treshold
                treshold = float(self.connection.receive())
                
                if not network.data.quantile_outlier_removal(columns, treshold):
                    self.report_error("ERROR :: Method can only be applied to numerical variables.")
                    return
                
                self.connection.send("OK")
                print(f'Outliers removed from columns {columns} using quantiles method.')
            
            elif received == 'RemoveOutliersZScore':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                # Receive treshold
                treshold = float(self.connection.receive())
                
                if not network.data.z_score_outlier_removal(columns, treshold):
                    self.report_error("ERROR :: Method can only be applied to numerical variables.")
                    return
                
                self.connection.send("OK")
                print(f'Outliers removed from columns {columns} using z-score method.')
            
            elif received == 'RemoveOutliersIQR':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                if not network.data.iqr_outlier_removal(columns):
                    self.report_error("ERROR :: Method can only be applied to numerical variables.")
                    return
                
                self.connection.send("OK")
                print(f'Outliers removed from columns {columns} using inter-quantile range method.')
            
            elif received == 'RemoveOutliersIsolationForest':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                if not network.data.isolation_forest_outlier_removal(columns):
                    self.report_error("ERROR :: Method can only be applied to numerical variables.")
                    return
                
                self.connection.send("OK")
                print(f'Outliers removed from columns {columns} using isolation forest method.')
            
            elif received == 'RemoveOutliersOneClassSVM':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                if not network.data.one_class_svm_outlier_removal(columns):
                    self.report_error("ERROR :: Method can only be applied to numerical variables.")
                    return
                
                self.connection.send("OK")
                print(f'Outliers removed from columns {columns} using one class svm method.')
                
            elif received == 'RemoveOutliersByLocalFactor':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                if not network.data.local_outlier_factor_outlier_removal(columns):
                    self.report_error("ERROR :: Method can only be applied to numerical variables.")
                    return
                
                self.connection.send("OK")
                print(f'Outliers removed from columns {columns} using local outlier factor method.')
            
            # Data analysis #
            elif received == 'NumericalStatistics':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                statistics = network.data.get_numerical_statistics(columns)
                if statistics is None:
                    self.report_error("ERROR :: Not all columns are numerical.")
                    return
                
                self.connection.send(json.dumps(statistics))
                
                self.connection.send("OK")
                print(f"Numerical statistics computed for columns {columns}.")
                
            elif received == 'CategoricalStatistics':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                if not network.data.columns_are_valid(columns):
                    self.report_error("ERROR :: Illegal columns given.")
                    return
                
                statistics = network.data.get_categorical_statistics(columns)
                self.connection.send(json.dumps(statistics))
                
                self.connection.send("OK")
                print(f"Categorical statistics computed for columns {columns}.")
            
            elif received == 'AllStatistics':
                numerical_columns = []
                categorical_columns = []
                for i, column_type in enumerate(network.data.get_column_types()):
                    if column_type == 'object':
                        categorical_columns.append(i)
                    else:
                        numerical_columns.append(i)
                
                statistics = {k:v for k, v in network.data.get_numerical_statistics(numerical_columns).items()}
                for k, v in network.data.get_categorical_statistics(categorical_columns).items():
                    statistics[k] = v
                
                self.connection.send(json.dumps(statistics))
                
                print(f"Categorical and Numerical statistics computed for all columns.")
                
            # Model selection #
            elif received == 'SaveModel':
                # Receive model name
                model_name = self.connection.receive()
                
                experiment_id = self.experiment_id
                model_dir = os.path.join(os.curdir, 'data', experiment_id, 'models')
                model_path = os.path.join(model_dir, f"{model_name}.pt")
                
                if not os.path.exists(model_dir):
                    os.makedirs(model_dir)
                
                network.save_weights(model_path)
                
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
                
            elif received == 'LoadModel':
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
                
                if not network.load_weights(model_path):
                    self.report_error("ERROR :: Wrong model shape given.")
                    return
                
                self.connection.send("OK")
                print(f"Model {model_name} loaded.")
            
            elif received == 'LoadEpoch':
                # Receive epoch to load
                epoch = self.connection.receive()
                
                if not network.load_weights_at(epoch):
                    self.report_error("ERROR :: Wrong model shape given.")
                    return
                    
                self.connection.send("OK")
                print(f"Model loaded from epoch {epoch}")
            
            # Working with networks #
            elif received == 'ComputeMetrics':
                if len(network.data.train_indices) == 0:
                    self.report_error("ERROR :: Train dataset not selected.")
                    return
                if len(network.data.test_indices) == 0:
                    self.report_error("ERROR :: Test dataset not selected.")
                    return
                
                if network.isRegression:
                    train = network.compute_regression_statistics("train")
                    test = network.compute_regression_statistics("test")
                else:
                    train = network.compute_classification_statistics("train")
                    test = network.compute_classification_statistics("test")
                self.connection.send(json.dumps({"test": test, "train": train}))
                
                self.connection.send("OK")
                print("Network statistics requested.")
            
            elif received == 'ChangeSettings':
                # Receive settings to change to
                settingsString = self.connection.receive()
                annSettings = ANNSettings.load(settingsString)
                network.load_settings(annSettings)
                
                print("ANN settings changed.")
                
            elif received == 'Start':
                # Initialize random data if no dataset is selected
                if network.data.dataset is None:
                    network.initialize_random_data()
                
                # Train
                Thread(target= lambda : self.train(network)).start()
                
                print("Traning commences.")
                
                
    def train(self, network):
        sr_connection = SignalRConnection(self.token)
        sr_connection.set_method("SendLoss")
        for loss in network.train():
            sr_connection.send_string(json.dumps(loss))
        print("Traning complete.")
        
    def report_error(self, message):
        print(message)
        self.connection.send(message)