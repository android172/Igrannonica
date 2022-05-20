namespace dotNet.Models
{
    public class Statistic
    {
        public List<Classification> klasifikacija { get; set; }
        public List<Regression> regresija { get; set; }
        public Statistic(List<Classification> clas , List<Regression> reg)
        {
            klasifikacija = clas;
            regresija = reg;
        }
    }
}
