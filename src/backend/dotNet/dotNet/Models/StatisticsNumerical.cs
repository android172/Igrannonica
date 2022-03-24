namespace dotNet.Models {
    public class StatisticsNumerical {
        public StatisticsNumerical(
            int validCount, int naCount, int uniqueCount, float mean, 
            float standardDeviation, float median, float quantile25, 
            float quantile50, float quantile75, float minimum, float maximum) {

            ValidCount = validCount;
            NaCount = naCount;
            UniqueCount = uniqueCount;
            Mean = mean;
            StdDeviation = standardDeviation;
            Median = median;
            Quantile25 = quantile25;
            Quantile50 = quantile50;
            Quantile75 = quantile75;
            Minimum = minimum;
            Maximum = maximum;
        }

        public static Dictionary<string, StatisticsNumerical>? Load(string data) {
            return Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, StatisticsNumerical>>(data);
        }

        public int ValidCount { get; set; }
        public int NaCount { get; set; }
        public int UniqueCount { get; set; }
        public float Mean { get; set; }
        public float StdDeviation { get; set; }
        public float Median { get; set; }
        public float Quantile25 { get; set; }
        public float Quantile50 { get; set; }
        public float Quantile75 { get; set; }
        public float Minimum { get; set; }
        public float Maximum { get; set; }
    }
}
