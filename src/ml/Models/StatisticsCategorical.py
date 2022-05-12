
import json

class StatisticsCategorical:
    
    def __init__(
        self,
        valid_count  = 0,
        na_count     = 0,
        unique_count = 0,
        most_common  = 0,
        frequencies  = []
        ) -> None:
        
        self.ValidCount  = int(valid_count)
        self.NaCount     = int(na_count)
        self.UniqueCount = int(unique_count)
        self.MostCommon  = (str(most_common[0]), str(float(most_common[1])))
        self.Frequencies = [(str(a), str(float(b))) for (a, b) in frequencies]