
import json

class StatisticsNumerical:
    def __init__(
        self,
        valid_count   = 0,
        na_count      = 0,
        unique_count  = 0,
        mean          = 0,
        std_deviation = 0,
        median        = 0,
        quantiles_25  = 0,
        quantiles_50  = 0,
        quantiles_75  = 0,
        min           = 0,
        max           = 0
        ) -> None:
        
        self.ValidCount   = int(valid_count)
        self.NaCount      = int(na_count)
        self.UniqueCount  = int(unique_count)
        self.Mean         = str(float(mean))
        self.StdDeviation = str(float(std_deviation))
        self.Median       = str(float(median))
        self.Quantile25   = str(float(quantiles_25))
        self.Quantile50   = str(float(quantiles_50))
        self.Quantile75   = str(float(quantiles_75))
        self.Minimum      = str(float(min))
        self.Maximum      = str(float(max))