using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using dotNet.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using System.Data.Common;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using dotNet.ModelValidation;
using Microsoft.Net.Http.Headers;
using dotNet.DBFunkcije;
using dotNet.MLService;

namespace dotNet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GraphController : ControllerBase
    {
        private IConfiguration _config;
        DB db;

        public GraphController(IConfiguration config)
        {
            _config = config;
            db = new DB(_config);
        }

        [Authorize]
        [HttpPost("scatterplot")]
        public IActionResult getScatterplot(int idEksperimenta, int[] nizKolona)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest("");
                eksperiment.DrawScatterPlot(nizKolona);
                return Ok("Scatterplot");
            }
            catch
            {
                return BadRequest("Greska");
            }
        }

        [Authorize]
        [HttpPost("boxplot")]
        public IActionResult getBoxplot(int idEksperimenta, int[] nizKolona)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest("");
                eksperiment.DrawBoxPlot(nizKolona);
                return Ok("BoxPlot");
            }
            catch
            {
                return BadRequest("Greska");
            }
        }

        [Authorize]
        [HttpPost("violinplot")]
        public IActionResult getViolinplot(int idEksperimenta, int[] nizKolona)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest("");
                eksperiment.DrawViolinPlot(nizKolona);
                return Ok("Violinplot");
            }
            catch
            {
                return BadRequest("Greska");
            }
        }

        [Authorize]
        [HttpPost("barplot")]
        public IActionResult getBarplot(int idEksperimenta, int[] nizKolona)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest("");
                eksperiment.DrawBarPlot(nizKolona);
                return Ok("Barplot");
            }
            catch
            {
                return BadRequest("Greska");
            }
        }

        [Authorize]
        [HttpPost("histogram")]
        public IActionResult getHistogram(int idEksperimenta, int[] nizKolona)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest("");
                eksperiment.DrawHistogram(nizKolona);
                return Ok("Histogram");
            }
            catch
            {
                return BadRequest("Greska");
            }
        }

        [Authorize]
        [HttpPost("hexbin")]
        public IActionResult getHexbin(int idEksperimenta, int[] nizKolona)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest("");
                eksperiment.DrawHexbin(nizKolona);
                return Ok("Hexbin");
            }
            catch
            {
                return BadRequest("Greska");
            }
        }

        [Authorize]
        [HttpPost("densityplot")]
        public IActionResult getDensityPlot(int idEksperimenta, int[] nizKolona)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest("");
                eksperiment.DrawDensityPlot(nizKolona);
                return Ok("DensityPlot");
            }
            catch
            {
                return BadRequest("Greska");
            }
        }

    }
}
