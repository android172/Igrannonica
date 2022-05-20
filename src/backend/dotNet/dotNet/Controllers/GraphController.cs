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
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.DrawScatterPlot(nizKolona);
                return Ok("Scatterplot");
            }
            catch (MLException e)
            {
                return BadRequest(e.Message);
            }
            catch
            {
                return StatusCode(500);
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
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.DrawBoxPlot(nizKolona);
                return Ok("BoxPlot");
            }
            catch (MLException e)
            {
                return BadRequest(e.Message);
            }
            catch
            {
                return StatusCode(500);
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
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.DrawViolinPlot(nizKolona);
                return Ok("Violinplot");
            }
            catch (MLException e)
            {
                return BadRequest(e.Message);
            }
            catch
            {
                return StatusCode(500);
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
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.DrawBarPlot(nizKolona);
                return Ok("Barplot");
            }
            catch (MLException e)
            {
                return BadRequest(e.Message);
            }
            catch
            {
                return StatusCode(500);
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
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.DrawHistogram(nizKolona);
                return Ok("Histogram");
            }
            catch (MLException e)
            {
                return BadRequest(e.Message);
            }
            catch
            {
                return StatusCode(500);
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
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.DrawHexbin(nizKolona);
                return Ok("Hexbin");
            }
            catch (MLException e)
            {
                return BadRequest(e.Message);
            }
            catch
            {
                return StatusCode(500);
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
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.DrawDensityPlot(nizKolona);
                return Ok("DensityPlot");
            }
            catch (MLException e)
            {
                return BadRequest(e.Message);
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpPost("piePlot/{idEksperimenta}/{kolona}")]
        public IActionResult getPiePlot(int idEksperimenta, int kolona)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.DrawPiePlot(kolona);
                return Ok("PiePlot");
            }
            catch (MLException e)
            {
                return BadRequest(e.Message);
            }
            catch
            {
                return StatusCode(500);
            }
        }

    }
}
