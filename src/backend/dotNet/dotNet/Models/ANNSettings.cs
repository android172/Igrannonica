

namespace dotNet.Models {
    public class ANNSettings {

        // General info
        public ProblemType ANNType;

        public ANNSettings(
            ProblemType aNNType, 
            float learningRate, 
            int batchSize, int 
            numberOfEpochs, 
            int inputSize, 
            int outputSize, 
            int[]? hiddenLayers, 
            ActivationFunction[]? activationFunctions,
            RegularizationMethod regularization, 
            LossFunction lossFunction, 
            Optimizer optimizer) {

            ANNType = aNNType;
            LearningRate = learningRate;
            BatchSize = batchSize;
            NumberOfEpochs = numberOfEpochs;
            InputSize = inputSize;
            OutputSize = outputSize;
            HiddenLayers = hiddenLayers;
            ActivationFunctions = activationFunctions;
            Regularization = regularization;
            LossFunction = lossFunction;
            Optimizer = optimizer;
        }

        public float LearningRate { get; set;}
        public int BatchSize { get; set; }
        public int NumberOfEpochs { get; set; }
        // IO
        public int InputSize { get; set; }
        public int OutputSize { get; set; }
        // Layers
        public int[]? HiddenLayers { get; set; }
        public ActivationFunction[]? ActivationFunctions { get; set; }
        // Other
        public RegularizationMethod Regularization { get; set; }
        public LossFunction LossFunction { get; set; }
        public Optimizer Optimizer { get; set; }

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
        L1Loss,
        MSELoss,
        CrossEntropyLoss
    }

    public enum Optimizer {
        SGD,
        Adagrad,
        Adadelta,
        Adam
    }
}
