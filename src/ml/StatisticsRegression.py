
class StatisticsRegression:
    
    def __init__(
        self,
        MAE = 0,
        MSE = 0,
        RSE = 0,
        R2  = 0,
        AdjustedR2 = 0
        ) -> None:
        self.MAE = float(MAE)
        self.MSE = float(MSE)
        self.RSE = float(RSE)
        self.R2  = float(R2)
        self.AdjustedR2 = float(AdjustedR2)