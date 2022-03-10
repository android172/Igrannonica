import json
from threading import Thread

from ANN import ANN
from ANNSettings import ANNSettings

class MLClientInstance(Thread):
    
    def setupConnection(self, connection) -> None:
        self.connection = connection
    
    def run(self) -> None:
        super().run()
        
        received = self.connection.receive()
        jsonObj = json.loads(received)
        
        annSettings = ANNSettings(
            problemType         = jsonObj["ANNType"],
            learningRate        = jsonObj["LearningRate"],
            batchSize           = jsonObj["BatchSize"],
            numberOfEpochs      = jsonObj["NumberOfEpochs"],
            inputSize           = jsonObj["InputSize"],
            outputSize          = jsonObj["OutputSize"],
            hiddenLayers        = jsonObj["HiddenLayers"],
            activationFunctions = jsonObj["ActivationFunctions"],
        )
        
        network = ANN(annSettings)
        
        network.initialize_random_data()
        
        network.train()
        
        train_acc = network.get_accuracy("train")
        test_acc = network.get_accuracy("test")
        print(f"Accuracy for 'train' dataset : {train_acc}")
        print(f"Accuracy for 'test' dataset : {test_acc}")
        
        self.connection.send("")
            