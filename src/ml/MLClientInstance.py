
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
                network.load_data_from_csv(path)
                
                print("Dataset loaded.")
                
            elif received == 'LoadTestData':
                # Receive path to dataset
                path = self.connection.receive()
                network.load_test_data_from_csv(path)
                
                print("Test dataset loaded.")
                
            elif received == 'SelectInputs':
                # Receive inputs
                inputs_string = self.connection.receive()
                inputs = [int(x) for x in inputs_string.split(":")]
                network.select_input_columns(inputs)
                
                print("Inputs selected.")
                
            elif received == 'SelectOutputs':
                # Receive outputs
                outputs_string = self.connection.receive()
                outputs = [int(x) for x in outputs_string.split(":")]
                network.select_output_columns(outputs)
                
                print("Outputs selected")
                
            elif received == 'RandomTrainTestSplit':
                # Receive ratio
                ratio = float(self.connection.receive())
                network.random_train_test_split(ratio)
                
                print("Random train-test split preformed.")
                
            # Data manipulation #
            elif received == 'EmptyStringToNA':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                network.replace_value_with_na(columns, '')
                
                print(f"Empty strings from columns {columns} replaced with NA.")
            
            elif received == 'ZeroToNA':
                # Receive columns
                columns_string = self.connection.receive()
                columns = [int(x) for x in columns_string.split(":")]
                network.replace_value_with_na(columns, 0)
                
                print(f"Zero values from columns {columns} replaced with NA.")
            
            elif received == 'DropNAListwise':
                network.drop_na_listwise()
                
                print("All rows with any NA values dropped from dataset.")
            
            elif received == 'DropNAPairwise':
                network.drop_na_pairwise()
                
                print("All selected rows with any NA values dropped from dataset.")
            
            elif received == 'DropNAColumns':
                network.drop_na_columns()
                
                print("All columns with any NA values dropped from dataset.")
                
            elif received == 'DropNAFromColumn':
                # Receive column to drop
                column= int(self.connection.receive())
                network.drop_na_from_column(column)
            
            # Working with networks #
            elif received == 'ChangeSettings':
                # Receive settings to change to
                settingsString = self.connection.receive()
                annSettings = ANNSettings(settingsString)
                network.load_settings(annSettings)
                
                print("ANN settings changed.")
                
            elif received == 'Start':
                # Initialize random data if no dataset is selected
                if True:
                    network.initialize_random_data()
                # Train
                network.train()
                # Return scores
                train_acc = network.get_accuracy("train")
                test_acc = network.get_accuracy("test")
                print(f"Accuracy for 'train' dataset : {train_acc}")
                print(f"Accuracy for 'test' dataset : {test_acc}")
                self.connection.send(f"{train_acc}:{test_acc}")
                
                # print("")