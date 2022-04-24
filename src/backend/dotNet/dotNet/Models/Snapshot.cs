namespace dotNet.Models
{
    public class Snapshot
    {
        int id { get; set; }
        int ideksperimenta { get; set; }
        string Ime { get; set; }
        string csv { get; set; }
        public Snapshot(int id, int eksperiment, string ime, string csv)
        {
            this.id = id;
            this.ideksperimenta = eksperiment;
            this.csv = csv;
            this.Ime = ime;
        }
    }
}
