namespace dotNet.Models
{
    public class Paging
    {
        public string data { get; set; }
        public int totalItems { get; set; }

        public Paging()
        {

        }
        public Paging(string data, int totalItems)
        {
            this.data = data;
            this.totalItems = totalItems;
        }
    }
}
