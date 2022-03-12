import json
import re
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
            received = self.connection.receive()
            
            if received == 'ChangeSettings':
                settingsString = self.connection.receive()
                annSettings = ANNSettings(settingsString)
                network.load_settings(annSettings)
            elif received == 'Start':
                network.initialize_random_data()        
                network.train()
                train_acc = network.get_accuracy("train")
                test_acc = network.get_accuracy("test")
                print(f"Accuracy for 'train' dataset : {train_acc}")
                print(f"Accuracy for 'test' dataset : {test_acc}")
                self.connection.send(f"{train_acc}:{test_acc}")
            