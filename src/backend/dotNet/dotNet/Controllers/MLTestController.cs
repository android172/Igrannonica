using dotNet.DBFunkcije;
using dotNet.MLService;
using dotNet.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;

namespace dotNet.Controllers {


    [Route("api/[controller]")]
    [ApiController]
    public class MLTestController : Controller {

        private readonly IConfiguration configuration;

        public static MLExperiment? experiment = null;

        public DB db;

        public MLTestController(IConfiguration configuration) {
            this.configuration = configuration;
            db = new DB(configuration);
        }

        [HttpPost("train")]
        public IActionResult train(int idEksperimenta) {
            var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            var tokenS = jsonToken as JwtSecurityToken;
            Korisnik korisnik;
            MLExperiment experiment;

            if (tokenS != null)
            {
                korisnik = db.dbkorisnik.Korisnik(int.Parse(tokenS.Claims.ToArray()[0].Value));

                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    experiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest();
            }
            else
                return BadRequest("Korisnik nije ulogovan.");



            if (experiment == null)
                experiment = new(configuration, "st", 1);
            // Load data
            experiment.LoadDataset("test_data.csv");

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
                batchSize: 64,
                numberOfEpochs: 10,
                currentEpoch: 0,
                inputSize: 13,
                outputSize: 2,
                hiddenLayers: hiddentLayers,
                activationFunctions: activationFunctions,
                regularization: RegularizationMethod.L1,
                regularizationRate: 0.0001f,
                lossFunction: LossFunction.CrossEntropyLoss,
                optimizer: Optimizer.Adam,
                 optimizationParams: new float[] { 0f },
                kFoldCV: 0
                );

            experiment.ApplySettings(settings);


            // Start training
            experiment.Start(1);

            return Ok("");
        }

        [AllowAnonymous]
        [HttpGet]
        public string Test() {
            try
            {
                if (experiment == null)
                    experiment = new(configuration, "st", 1);

                // Load data
                experiment.LoadDataset("test_data.csv");

                //experiment.DrawScatterPlot(new int[] { 4, 6, 10 });

                //return "Done";

                // Add row and column
                //experiment.AddRow(new[] { "1", "1123", "0", "1", "44", "1", "999",
                //                      "1", "1", "1", "12412.1", "0", "1"});

                int rowCounts = experiment.GetRowCount();
                Console.WriteLine(rowCounts);
                //var column = new string[rowCounts];
                //for (int i = 0; i < column.Length; i++)
                //    column[i] = "2";
                //experiment.AddColumn("IDK", column);

                //experiment.Undo();

                // Normalize rows
                experiment.ScaleZScore(new int[] { 3, 12 });

                // Encode categorical values
                experiment.LabelEncoding(new int[] { 4, 5 });
                //experiment.OneHotEncoding(new int[] { 7 });

                //experiment.Undo();

                //experiment.Redo();

                //var x = experiment.GetRows(new int[] { 0, 1, 2, 3, 4, 5 });
                //Console.WriteLine(x);

                //return "Done";

                // Save dataset
                //experiment.SaveDataset();

                // Replace NA values
                experiment.ReplaceZeroWithNA(new int[] { 8 });
                experiment.FillNAWithRegression(8, new int[] { 5, 9, 10, 12 });

                // Set ANN settings
                int networkSize = 5;

                // Get column types
                Console.WriteLine(experiment.GetColumnTypes());

                // Select inputs, outputs and split data
                experiment.LoadInputs(new int[] { 3, 4, 5, 6, 8, 9, 10, 11, 12, 13 });
                experiment.LoadOutputs(new int[] { 7 });
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
                    batchSize: 64,
                    numberOfEpochs: 3,
                    currentEpoch: 0,
                    inputSize: 10,
                    outputSize: 1,
                    hiddenLayers: hiddentLayers,
                    activationFunctions: activationFunctions,
                    regularization: RegularizationMethod.L1,
                    regularizationRate: 0.0001f,
                    lossFunction: LossFunction.NLLLoss,
                    optimizer: Optimizer.SGD,
                    optimizationParams: new float[] { 0.9f },
                    kFoldCV: 0
                    );

                experiment.ApplySettings(settings);


                // Start training
                experiment.Start(1);

                //Thread.Sleep(4000);

                //experiment.Stop(1);

                //Thread.Sleep(5000);

                //experiment.Continue(1);

                //experiment.ComputeMetrics(1);
                //experiment.Predict(new string[] { "0.01", "0.01", "0.01", "0.01", "0.01", "0.01", "0.01", "0.01", "0.01", "0.01" });
                // Save model / load model
                //try { experiment.LoadEpoch("2"); }
                //catch (MLException e) { Console.WriteLine(e.Message); }
                //experiment.SaveModel("TestModel");

                // Get metrics
                //var stats = experiment.ComputeMetrics();
                //Console.WriteLine(stats);
            }
            catch (MLException e) {
                Console.WriteLine(e.Message);
            }

            return "done";
        }
    }
}
