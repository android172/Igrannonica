

namespace dotNet.Models {
    public class ANNSettings {

        // General info
        public ProblemType ANNType { get; set; }

        public ANNSettings(
            ProblemType aNNType, 
            float learningRate, 
            int batchSize,
            int numberOfEpochs, 
            int currentEpoch, 
            int inputSize, 
            int outputSize, 
            int[] hiddenLayers, 
            ActivationFunction[]? activationFunctions,
            RegularizationMethod regularization,
            float regularizationRate,
            LossFunction lossFunction, 
            Optimizer optimizer,
            float[] optimizationParams,
            int kFoldCV) {

            ANNType = aNNType;
            LearningRate = learningRate;
            BatchSize = batchSize;
            NumberOfEpochs = numberOfEpochs;
            CurrentEpoch = currentEpoch;
            InputSize = inputSize;
            OutputSize = outputSize;
            HiddenLayers = hiddenLayers;
            ActivationFunctions = activationFunctions;
            Regularization = regularization;
            RegularizationRate = regularizationRate;
            LossFunction = lossFunction;
            Optimizer = optimizer;
            OptimizationParams = optimizationParams;
            KFoldCV = kFoldCV;
        }

        public float LearningRate { get; set;}
        public int BatchSize { get; set; }
        public int NumberOfEpochs { get; set; }
        public int CurrentEpoch { get; set; }
        // IO
        public int InputSize { get; set; }
        public int OutputSize { get; set; }
        // Layers
        public int[]? HiddenLayers { get; set; }
        public ActivationFunction[]? ActivationFunctions { get; set; }
        // Other
        public RegularizationMethod Regularization { get; set; }
        public float RegularizationRate { get; set; }
        public LossFunction LossFunction { get; set; }
        public Optimizer Optimizer { get; set; }
        public float[]? OptimizationParams { get; set; }
        public int KFoldCV { get; set; }

        // To JSON string
        public override string ToString() {
            return Newtonsoft.Json.JsonConvert.SerializeObject(this);
        }
    }

    public enum ProblemType {
        Regression,
        Classification
    }

    public enum ActivationFunction {
        ReLU,
        LeakyReLU,
        Sigmoid,
        Tanh,
        Linear
    }

    public enum RegularizationMethod {
        L1,
        L2
    }

    public enum LossFunction {
        // Regression
        L1Loss,
        L2Loss,
        SmoothL1Loss,
        HuberLoss,
        // Classification
        NLLLoss,
        CrossEntropyLoss,
        KLDivLoss,
        MultiMarginLoss
    }

    public enum Optimizer {
        Adadelta,
        Adagrad,
        Adam,
        AdamW,
        Adamax,
        ASGD,
        NAdam,
        RAdam,
        RMSprop,
        SGD
    }
}
