namespace dotNet.Models
{
    public class TrainingData
    {
        public int ModelId { get; set; }
        public int Snapshot { get; set; }
        public Kolone? Columns { get; set; }
        public ANNSettings? AnnSettings { get; set; }
    }
}
