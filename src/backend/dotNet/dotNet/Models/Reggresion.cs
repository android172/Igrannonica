namespace dotNet.Models
{
    public class Regression
    {
        public Regression(int id,string kolona ,float mAE, float mSE, float rSE, float r2, float adjustedR2)
        {
            this.id = id;
            Kolona = kolona;
            MAE = mAE;
            MSE = mSE;
            RSE = rSE;
            R2 = r2;
            AdjustedR2 = adjustedR2;
        }
        public int id { get; set; }
        public string Kolona { get; set; }
        public float MAE { get; set; }
        public float MSE { get; set; }
        public float RSE { get; set; }
        public float R2 { get; set; }
        public float AdjustedR2 { get; set; }
    }
}
