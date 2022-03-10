

namespace dotNet.Models {
    public class ANNSettings {

        // General info
        public ProblemType ANNType;

        public ANNSettings(
            ProblemType aNNType, float learningRate, int batchSize, int numberOfEpochs, 
            int inputSize, int outputSize, int[]? hiddenLayers, ActivationFunction[]? activationFunctions
            ) {
            ANNType = aNNType;
            LearningRate = learningRate;
            BatchSize = batchSize;
            NumberOfEpochs = numberOfEpochs;
            InputSize = inputSize;
            OutputSize = outputSize;
            HiddenLayers = hiddenLayers;
            ActivationFunctions = activationFunctions;
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
        Tanh
    }
}
