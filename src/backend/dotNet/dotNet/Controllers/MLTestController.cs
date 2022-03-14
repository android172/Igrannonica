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

            // Set ANN settings
            int networkSize = 2;

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
                numberOfEpochs: 1,
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
