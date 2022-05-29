namespace dotNet.Models
{
    public class ModelDetaljnije
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string Snapshot { get; set; }
        public int SnapshotVerzija { get; set; }
        public string Opis { get; set; }
        public string ProblemType { get; set; }
        public string Optimizacija { get; set; }
        public int Epohe { get; set; }
        public int trenutnaEpoha { get; set; }
        public int[] HiddenLayers { get; set; }
        public int[] IzlazneKolone { get; set; }
    }
}
