
class StatisticsRegression:
    
    def __init__(
        self,
        MAE = 0,
        MSE = 0,
        RSE = 0,
        R2  = 0,
        AdjustedR2 = 0
        ) -> None:
        self.MAE = str(float(MAE))
        self.MSE = str(float(MSE))
        self.RSE = str(float(RSE))
        self.R2  = str(float(R2))
        self.AdjustedR2 = str(float(AdjustedR2))