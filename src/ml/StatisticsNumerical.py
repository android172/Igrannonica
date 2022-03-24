
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
        self.Mean         = float(mean)
        self.StdDeviation = float(std_deviation)
        self.Median       = float(median)
        self.Quantile25   = float(quantiles_25)
        self.Quantile50   = float(quantiles_50)
        self.Quantile75   = float(quantiles_75)
        self.Minimum      = float(min)
        self.Maximum      = float(max)