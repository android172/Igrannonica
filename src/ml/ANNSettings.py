
class ANNSettings:
    def __init__(self) -> None:
        self.problemType         = 0
        self.learningRate        = 0.0
        self.batchSize           = 0
        self.numberOfEpochs      = 0
        self.inputSize           = 0
        self.outputSize          = 0
        self.hiddenLayers        = None
        self.activationFunctions = None
    
    def __init__(self, problemType, learningRate, batchSize, numberOfEpochs, 
                 inputSize, outputSize, hiddenLayers, activationFunctions) -> None:
        self.problemType         = problemType
        self.learningRate        = learningRate
        self.batchSize           = batchSize
        self.numberOfEpochs      = numberOfEpochs
        self.inputSize           = inputSize
        self.outputSize          = outputSize
        self.hiddenLayers        = hiddenLayers
        self.activationFunctions = activationFunctions
    
    
    