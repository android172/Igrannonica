
import json


class ANNSettings:
    
    
    def __init__(
        self,
        problemType         = 0, 
        learningRate        = 0.0, 
        batchSize           = 0, 
        numberOfEpochs      = 0, 
        inputSize           = 0, 
        outputSize          = 0, 
        hiddenLayers        = None, 
        activationFunctions = None
        ) -> None:
        
        self.problemType         = problemType
        self.learningRate        = learningRate
        self.batchSize           = batchSize
        self.numberOfEpochs      = numberOfEpochs
        self.inputSize           = inputSize
        self.outputSize          = outputSize
        self.hiddenLayers        = hiddenLayers
        self.activationFunctions = activationFunctions
    
    def load(data) -> None:
        jsonObj = json.loads(data)
        return ANNSettings(
            problemType         = jsonObj["ANNType"],
            learningRate        = jsonObj["LearningRate"],
            batchSize           = jsonObj["BatchSize"],
            numberOfEpochs      = jsonObj["NumberOfEpochs"],
            inputSize           = jsonObj["InputSize"],
            outputSize          = jsonObj["OutputSize"],
            hiddenLayers        = jsonObj["HiddenLayers"],
            activationFunctions = jsonObj["ActivationFunctions"]
        )
    
    
    