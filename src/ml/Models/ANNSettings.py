
import json


class ANNSettings:
    
    
    def __init__(
        self,
        problemType         = 0, 
        learningRate        = 0.0, 
        batchSize           = 0, 
        numberOfEpochs      = 0, 
        currentEpoch        = 0,
        inputSize           = 0, 
        outputSize          = 0, 
        hiddenLayers        = None, 
        activationFunctions = None,
        regularization      = 0,
        regularizationRate  = 0.0,
        lossFunction        = 0,
        optimizer           = 0,
        optimizationParams  = [0.0],
        kFoldCV             = 0
        ) -> None:
        
        self.problemType         = problemType
        self.learningRate        = learningRate
        self.batchSize           = batchSize
        self.currentEpoch        = currentEpoch
        self.numberOfEpochs      = numberOfEpochs
        self.inputSize           = inputSize
        self.outputSize          = outputSize
        self.hiddenLayers        = hiddenLayers
        self.activationFunctions = activationFunctions
        self.regularization      = regularization
        self.regularizationRate  = regularizationRate
        self.lossFunction        = lossFunction
        self.optimizer           = optimizer
        self.optimizationParams  = optimizationParams
        self.kFoldCV             = kFoldCV
    
    def load(data) -> None:
        jsonObj = json.loads(data)
        return ANNSettings(
            problemType         = jsonObj["ANNType"],
            learningRate        = jsonObj["LearningRate"],
            batchSize           = jsonObj["BatchSize"],
            numberOfEpochs      = jsonObj["NumberOfEpochs"],
            currentEpoch        = jsonObj["CurrentEpoch"],
            inputSize           = jsonObj["InputSize"],
            outputSize          = jsonObj["OutputSize"],
            hiddenLayers        = jsonObj["HiddenLayers"],
            activationFunctions = jsonObj["ActivationFunctions"],
            regularization      = jsonObj["Regularization"],
            regularizationRate  = jsonObj["RegularizationRate"],
            lossFunction        = jsonObj["LossFunction"],
            optimizer           = jsonObj["Optimizer"],
            optimizationParams  = jsonObj["OptimizationParams"],
            kFoldCV             = jsonObj["KFoldCV"]
        )
    
    
    