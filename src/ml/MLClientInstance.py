
import json
from threading import Thread

from ANN import ANN
from ANNSettings import ANNSettings

class MLClientInstance(Thread):
    
    def setupConnection(self, connection) -> None:
        self.connection = connection
    
    def run(self) -> None:
        super().run()
        
        network = ANN()
        
        while True:
            # Receive command
            received = self.connection.receive()
                
            # Load data #
            if received == 'LoadData':
                # Receive path to dataset
                path = self.connection.receive()
                network.data.load_from_csv(path)
                network.data.initialize_column_types()
                
                print("Dataset loaded.")
                
            elif received == 'LoadTestData':
                # Receive path to dataset
                path = self.connection.receive()
                network.data.load_test_from_csv(path)
                
                print("Test dataset loaded.")
                
            elif received == 'SelectInputs':
                # Receive inputs
                inputs_string = self.connection.receive()
                inputs = [int(x) for x in inputs_string.split(":")]
                network.data.select_input_columns(inputs)
                
                print("Inputs selected.")
                
            elif received == 'SelectOutputs':
                # Receive outputs
                outputs_string = self.connection.receive()
                outputs = [int(x) for x in outputs_string.split(":")]
                network.data.select_output_columns(outputs)
                
                print("Outputs selected")
                
            elif received == 'RandomTrainTestSplit':
                # Receive ratio
                ratio = float(self.connection.receive())
                network.data.random_train_test_split(ratio)
                
                print("Random train-test split preformed.")
            
            # Data access #
            
            elif received == 'GetRows':
                # Receive row indices
                row_string = self.connection.receive()
                row_indices = [int(x) for x in row_string.split(":")]
                data = network.data.get_rows(row_indices)
                self.connection.send(data.to_json(orient='records'))
                
                print(f"Rows: {row_indices} requested.")
                
            elif received == 'GetRowCount':
                count = network.data.get_row_count()
                self.connection.send(count)
                
                print(f"Row count ({count}) requested.")
                
            elif received == 'GetColumnTypes':
                column_types = network.data.get_column_types()
                print(column_types)
                self.connection.send(json.dumps(column_types))
                
                print(f"Column types requested.")
            
            # Data manipulation : CRUD operation #
            
            elif received == 'AddRow':
                # Receive row values
                row_string = self.connection.receive()
                new_row = json.loads(row_string)["Data"]
                network.data.add_row(new_row)
                
                print(f"Row: {new_row} added to the dataset.")
            
            elif received == 'AddRowToTest':
                # Receive row values
                row_string = self.connection.receive()
                new_row = json.loads(row_string)["Data"]
                network.data.add_row(new_row, True)
                
                print(f"Row: {new_row} added to the test dataset.")
                
            elif received == 'UpdateRow':
                # Receive row index
                row_index = int(self.connection.receive())
                # Receive row values
                row_string = self.connection.receive()
                new_row = json.loads(row_string)["Data"]
                network.data.update_row(row_index, new_row)
                
                print(f"Row {row_index} replaced with values: {new_row}.")
                
            elif received == 'DeleteRow':
                # Receive row index
                row = int(self.connection.receive())
                network.data.remove_row(row)
                
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
                network.data.update_field(row, column, value)
                
                print(f"Field ({row}, {column}) updated to {value}.")
                
            # Data manipulation : NA values #
            elif received == 'EmptyStringToNA':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                network.data.replace_value_with_na(columns, '')
                
                print(f"Empty strings from columns {columns} replaced with NA.")
            
            elif received == 'ZeroToNA':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                network.data.replace_value_with_na(columns, 0)
                
                print(f"Zero values from columns {columns} replaced with NA.")
            
            elif received == 'DropNAListwise':
                network.data.drop_na_listwise()
                
                print("All rows with any NA values dropped from dataset.")
            
            elif received == 'DropNAPairwise':
                network.data.drop_na_pairwise()
                
                print("All selected rows with any NA values dropped from dataset.")
            
            elif received == 'DropNAColumns':
                network.data.drop_na_columns()
                
                print("All columns with any NA values dropped from dataset.")
                
            elif received == 'FillNAWithMean':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                network.data.replace_na_with_mean(columns)
                
                print(f"NA values in columns {columns} replaced using mean value.")
            
            elif received == 'FillNAWithMedian':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                network.data.replace_na_with_median(columns)
                
                print(f"NA values in columns {columns} replaced using median value.")
            
            elif received == 'FillNAWithMode':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                network.data.replace_na_with_mode(columns)
                
                print(f"NA values in columns {columns} replaced using mode value.")
            
            elif received == 'FillNAWithRegression':
                # Receive column with NA values
                column = int(self.connection.receive())
                # Receive columns for regression
                columns_string = self.connection.receive()
                input_columns = [int(x) for x in columns_string.split(":")]
                network.data.replace_na_with_regression(column, input_columns)
                
                print(f"NA values from column {column} replaced using a model fit on columns {input_columns}.")
                
            # Data manipulation : Encoding #
            elif received == 'LabelEncoding':
                # Receive columns to encode
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                network.data.label_encode_columns(columns)
                
                print(f"Columns {columns} were label encoded.")
            
            elif received == 'OneHotEncoding':
                # Receive columns to encode
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                network.data.one_hot_encode_columns(columns)
                
                print(f"Columns {columns} were one-hot encoded.")
            
            # Data manipulation : Normalization #
            elif received == 'ScaleAbsoluteMax':
                # Receive columns to scale
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                network.data.maximum_absolute_scaling(columns)
                
                print(f"Columns {columns} were maximum absolute scaled.")
                
            elif received == 'ScaleMinMax':
                # Receive columns to scale
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                network.data.min_max_scaling(columns)
                
                print(f"Columns {columns} were min-max scaled.")
                
            elif received == 'ScaleZScore':
                # Receive columns to scale
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                network.data.z_score_scaling(columns)
                
                print(f"Columns {columns} were z-score scaled.")
                
            # Data manipulation : Outliers #
            elif received == 'RemoveOutliersStandardDeviation':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                # Receive treshold
                treshold = float(self.connection.receive())
                network.data.standard_deviation_outlier_removal(columns, treshold)
                
                print(f'Outliers removed from columns {columns} using standard deviation method.')
            
            elif received == 'RemoveOutliersQuantiles':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                # Receive treshold
                treshold = float(self.connection.receive())
                network.data.quantile_outlier_removal(columns, treshold)
                
                print(f'Outliers removed from columns {columns} using quantiles method.')
            
            elif received == 'RemoveOutliersZScore':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                # Receive treshold
                treshold = float(self.connection.receive())
                network.data.z_score_outlier_removal(columns, treshold)
                
                print(f'Outliers removed from columns {columns} using z-score method.')
            
            # Data analysis #
            elif received == 'NumericalStatistics':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                statistics = network.data.get_numerical_statistics(columns)
                self.connection.send(json.dumps(statistics))
                
                print(f"Numerical statistics computed for columns {columns}.")
                
            elif received == 'CategoricalStatistics':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                statistics = network.data.get_categorical_statistics(columns)
                self.connection.send(json.dumps(statistics))
                
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
            
            # Working with networks #
            elif received == 'ComputeMetrics':
                if network.isRegression:
                    train = network.compute_regression_statistics("train")
                    test = network.compute_regression_statistics("test")
                else:
                    train = network.compute_classification_statistics("train")
                    test = network.compute_classification_statistics("test")
                self.connection.send(json.dumps({"test": test, "train": train}))
                
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
                print("Traning commences.")
                network.train()
                
                print("Traning complete.")
                