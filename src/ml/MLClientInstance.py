
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
            
            if received == 'ChangeSettings':
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
                
            elif received == 'LoadData':
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