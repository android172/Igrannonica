using dotNet.MLService;
using dotNet.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotNet.Controllers {


    [Route("api/[controller]")]
    [ApiController]
    public class MLTestController : Controller {

        private readonly IConfiguration configuration;

        private static MLExperiment? experiment = null;

        public MLTestController(IConfiguration configuration) {
            this.configuration = configuration;
        }

        [AllowAnonymous]
        [HttpGet]
        public string Test() {
            if (experiment == null)
                experiment = new(configuration);

            // Load data
            string datasetPath = "C:\\Fax\\Softverski Inzinjering\\neuralnetic\\data\\test_data.csv";
            experiment.LoadDataset(datasetPath);

            // Encode categorical values
            experiment.OneHotEncoding(new int[] { 4, 5 });

            // Replace NA values
            experiment.ReplaceZeroWithNA(new int[] { 8 });
            experiment.FillNAWithRegression(8, new int[] { 5, 7, 9, 10, 12, 13, 14, 15, 16});

            // Set ANN settings
            int networkSize = 2;

            // Select inputs, outputs and split data
            experiment.LoadInputs(new int[] { 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16 });
            experiment.LoadOutputs(new int[] { 11 });
            experiment.TrainTestSplit(0.1f);

            int[] hiddentLayers = new int[networkSize];
            hiddentLayers[0] = 5;
            hiddentLayers[1] = 7;

            ActivationFunction[] activationFunctions = new ActivationFunction[networkSize];
            activationFunctions[0] = ActivationFunction.ReLU;
            activationFunctions[1] = ActivationFunction.ReLU;

            ANNSettings settings = new(
                aNNType: ProblemType.Classification,
                learningRate: 0.001f,
                batchSize:  64,
                numberOfEpochs: 10,
                inputSize:  512,
                outputSize: 2,
                hiddenLayers: hiddentLayers,
                activationFunctions: activationFunctions
                );

            experiment.ApplySettings(settings);

            // Start training
            ClassificationMetrics metrics = experiment.Start();

            // Return results
            return $"Train accuracy: {metrics.TrainAccuracy}\nTest accuracy: {metrics.TestAccuracy}";
        }
    }
}
