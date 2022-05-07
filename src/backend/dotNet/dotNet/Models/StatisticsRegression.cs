namespace dotNet.Models
{
    public class StatisticsRegression {
        public StatisticsRegression(float mAE, float mSE, float rSE, float r2, float adjustedR2) {
            MAE = mAE;
            MSE = mSE;
            RSE = rSE;
            R2 = r2;
            AdjustedR2 = adjustedR2;
        }

        public float MAE { get; set; }
        public float MSE { get; set; }
        public float RSE { get; set; }
        public float R2 { get; set; }
        public float AdjustedR2 { get; set; }
    }
}
