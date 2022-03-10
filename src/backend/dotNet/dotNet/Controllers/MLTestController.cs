using dotNet.MLService;
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
            MLConnection connection = new();
            Console.WriteLine(connection.Receive());
            connection.Receive();
            return Ok("");
        }
    }
}
