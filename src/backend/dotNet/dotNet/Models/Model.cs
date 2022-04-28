namespace dotNet.Models
{
    public class Model
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public int Vlasnik { get; set; }
        public string Opis { get; set; }
    }
}
