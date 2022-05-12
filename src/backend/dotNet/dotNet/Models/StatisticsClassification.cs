namespace dotNet.Models {
    public class StatisticsClassification {
        public StatisticsClassification(
            float accuracy, 
            float balancedAccuracy, 
            float precision, 
            float recall, 
            float f1Score, 
            float hammingLoss, 
            float crossEntropyLoss, 
            int[][]? confusionMatrix
            ) {
            Accuracy = accuracy;
            BalancedAccuracy = balancedAccuracy;
            Precision = precision;
            Recall = recall;
            F1Score = f1Score;
            HammingLoss = hammingLoss;
            CrossEntropyLoss = crossEntropyLoss;
            ConfusionMatrix = confusionMatrix;
        }

        public float Accuracy { get; set; }
        public float BalancedAccuracy { get; set; }
        public float Precision { get; set; }
        public float Recall { get; set; }
        public float F1Score { get; set; }
        public float HammingLoss { get; set; }
        public float CrossEntropyLoss { get; set; }
        public int[][]? ConfusionMatrix { get; set; }

    }
}
