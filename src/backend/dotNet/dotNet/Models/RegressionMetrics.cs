namespace dotNet.Models {
    public class RegressionMetrics {
        public RegressionMetrics(
            float mAE, float mSE, float rSE, float f1, float r2, 
            float adjustedR2, float rocAucScore) {

            MAE = mAE;
            MSE = mSE;
            RSE = rSE;
            F1 = f1;
            R2 = r2;
            AdjustedR2 = adjustedR2;
            RocAucScore = rocAucScore;
        }

        public float MAE { get; set; }
        public float MSE { get; set; }
        public float RSE { get; set; }
        public float F1 { get; set; }
        public float R2 { get; set; }
        public float AdjustedR2 { get; set; }
        public float RocAucScore { get; set; }

        public static RegressionMetrics? Load(string data) {
            return Newtonsoft.Json.JsonConvert.DeserializeObject<RegressionMetrics>(data);
        }
    }
}
