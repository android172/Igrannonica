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
        
        self.Accuracy         = Accuracy
        self.BalancedAccuracy = BalancedAccuracy
        self.Precision        = Precision
        self.Recall           = Recall
        self.F1Score          = F1Score
        self.HammingLoss      = HammingLoss
        self.CrossEntropyLoss = CrossEntropyLoss
    
    