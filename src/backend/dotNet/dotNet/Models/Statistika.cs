namespace dotNet.Models
{
    public class Statistika
    {
        public Dictionary<string, StatisticsNumerical> statsNum { get; set; }
        public Dictionary<string, StatisticsNumerical> statsCat { get; set; }

        public Statistika() { }

        public Statistika(Dictionary<string, StatisticsNumerical> statsNum, Dictionary<string, StatisticsNumerical> statsCat)
        {
            this.statsNum = statsNum;
            this.statsCat = statsCat;
        }
    }
}
