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

            // Get statistics
            var statistics = experiment.ColumnStatistics();
            Console.WriteLine(statistics);

            // Get column types
            Console.WriteLine(experiment.GetColumnTypes());

            // Add row and column
            experiment.AddRow(new[] { "1", "1123", "hiThere", "144", "France", "Female", "44", "1", "9",
                                      "1", "1", "1", "12412.1", "0"});
            int rowCounts = experiment.GetRowCount();
            Console.WriteLine(rowCounts);
            //var column = new string[rowCounts];
            //for (int i = 0; i < column.Length; i++)
            //    column[i] = "2";
            //experiment.AddColumn("IDK", column);

            // Normalize rows
            experiment.ScaleZScore(new int[] { 3, 12 });

            // Get rows
            var rows = experiment.GetRows(new[] { 0, 1, 2, 3, 5, 6 });
            Console.WriteLine(rows);

            // Encode categorical values
            experiment.OneHotEncoding(new int[] { 4, 5, 13 });

            // Replace NA values
            //experiment.ReplaceZeroWithNA(new int[] { 8 });
            //experiment.FillNAWithRegression(8, new int[] { 5, 7, 9, 10, 12, 13, 14, 15, 16});

            // Set ANN settings
            int networkSize = 5;

            // Select inputs, outputs and split data
            experiment.LoadInputs(new int[] { 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 });
            experiment.LoadOutputs(new int[] { 16, 17 });
            experiment.TrainTestSplit(0.1f);

            int[] hiddentLayers = new int[networkSize];
            hiddentLayers[0] = 5;
            hiddentLayers[1] = 7;
            hiddentLayers[2] = 9;
            hiddentLayers[3] = 9;
            hiddentLayers[4] = 7;

            ActivationFunction[] activationFunctions = new ActivationFunction[networkSize];
            activationFunctions[0] = ActivationFunction.ReLU;
            activationFunctions[1] = ActivationFunction.ReLU;
            activationFunctions[2] = ActivationFunction.ReLU;
            activationFunctions[3] = ActivationFunction.ReLU;
            activationFunctions[4] = ActivationFunction.ReLU;

            ANNSettings settings = new(
                aNNType: ProblemType.Classification,
                learningRate: 0.001f,
                batchSize:  64,
                numberOfEpochs: 10,
                inputSize:  13,
                outputSize: 2,
                hiddenLayers: hiddentLayers,
                activationFunctions: activationFunctions,
                regularization: RegularizationMethod.L1,
                lossFunction: LossFunction.CrossEntropyLoss,
                optimizer: Optimizer.Adam
                );

            experiment.ApplySettings(settings);

            // Start training
            experiment.Start();

            // Get metrics
            experiment.ComputeMetrics();

            return "done";
        }
    }
}
