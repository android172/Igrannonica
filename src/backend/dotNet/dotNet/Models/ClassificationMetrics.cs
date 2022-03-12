
namespace dotNet.Models {
    public class ClassificationMetrics {
        public ClassificationMetrics(float trainAccuracy, float testAccuracy) {
            TrainAccuracy = trainAccuracy;
            TestAccuracy = testAccuracy;
        }

        public float TrainAccuracy { get; set; }
        public float TestAccuracy { get; set; }
    }
}
