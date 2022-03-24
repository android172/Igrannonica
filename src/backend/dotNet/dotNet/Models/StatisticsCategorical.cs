namespace dotNet.Models {
    public class StatisticsCategorical {
        public StatisticsCategorical(
            int validCount, int naCount, int uniqueCount, 
            KeyValuePair<string, float> mostCommon, 
            List<KeyValuePair<string, float>>? frequencies) {

            ValidCount = validCount;
            NaCount = naCount;
            UniqueCount = uniqueCount;
            MostCommon = mostCommon;
            Frequencies = frequencies;
        }

        public static Dictionary<string, StatisticsCategorical>? Load(string data) {
            return Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, StatisticsCategorical>>(data);
        }

        public int ValidCount { get; set; }
        public int NaCount { get; set; }
        public int UniqueCount { get; set; }
        public KeyValuePair<string, float> MostCommon { get; set; }
        public List<KeyValuePair<string, float>>? Frequencies { get; set; }
    }
}
