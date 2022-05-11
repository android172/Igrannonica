namespace dotNet.Models
{
    public class NovModel
    {
        public string naziv { get; set; }
        public string opis { get; set; }
        public int snapshot { get; set; }
        public ANNSettings podesavalja { get; set; }
        public Kolone kolone { get; set; }
    }
}
