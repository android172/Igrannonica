namespace dotNet.Models
{
    public class Snapshot
    {
        public int id { get; set; }
        public int ideksperimenta { get; set; }
        public string Ime { get; set; }
        public string csv { get; set; }
        public Snapshot()
        {

        }
        public Snapshot(int id, int eksperiment, string ime, string csv)
        {
            this.id = id;
            this.ideksperimenta = eksperiment;
            this.csv = csv;
            this.Ime = ime;
        }
    }
}
