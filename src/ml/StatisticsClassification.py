class StatisticsClassification:
    
    def __init__(
        self,
        Accuracy         = 0,
        BalancedAccuracy = 0,
        Precision        = 0,
        Recall           = 0,
        F1Score          = 0,
        HammingLoss      = 0,
        CrossEntropyLoss = 0,
        ConfusionMatrix  = []
        ) -> None:
        
        self.Accuracy         = str(float(Accuracy))
        self.BalancedAccuracy = str(float(BalancedAccuracy))
        self.Precision        = str(float(Precision))
        self.Recall           = str(float(Recall))
        self.F1Score          = str(float(F1Score))
        self.HammingLoss      = str(float(HammingLoss))
        self.CrossEntropyLoss = str(float(CrossEntropyLoss))
        self.ConfusionMatrix  = [[int(i) for i in row] for row in ConfusionMatrix]
    
    