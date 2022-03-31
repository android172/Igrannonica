class StatisticsClassification:
    
    def __init__(
        self,
        Accuracy         = 0,
        BalancedAccuracy = 0,
        Precision        = 0,
        Recall           = 0,
        F1Score          = 0,
        HammingLoss      = 0,
        CrossEntropyLoss = 0
        ) -> None:
        
        self.Accuracy         = float(Accuracy)
        self.BalancedAccuracy = float(BalancedAccuracy)
        self.Precision        = float(Precision)
        self.Recall           = float(Recall)
        self.F1Score          = float(F1Score)
        self.HammingLoss      = float(HammingLoss)
        self.CrossEntropyLoss = float(CrossEntropyLoss)
    
    