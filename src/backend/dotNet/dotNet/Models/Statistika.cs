namespace dotNet.Models
{
    public class Statistika
    {
        public Dictionary<string, StatisticsNumerical> statsNum { get; set; }
        public Dictionary<string, StatisticsCategorical> statsCat { get; set; }

        public Statistika() { }

        public Statistika(Dictionary<string, StatisticsNumerical> statsNum, Dictionary<string, StatisticsCategorical> statsCat)
        {
            this.statsNum = statsNum;
            this.statsCat = statsCat;
        }
    }
}
