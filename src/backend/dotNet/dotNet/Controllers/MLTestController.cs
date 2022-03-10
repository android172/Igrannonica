using dotNet.MLService;
using dotNet.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotNet.Controllers {

    [Route("api/[controller]")]
    [ApiController]
    public class MLTestController : Controller {

        private IConfiguration configuration;

        public MLTestController(IConfiguration configuration) {
            this.configuration = configuration;
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult Test() {
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

            MLConnection connection = new();
            connection.Send(settings.ToString());
            connection.Receive();
            return Ok("");
        }
    }
}
