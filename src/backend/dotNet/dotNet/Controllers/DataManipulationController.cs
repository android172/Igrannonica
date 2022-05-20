using dotNet.DBFunkcije;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;
using dotNet.Models;
using dotNet.MLService;

namespace dotNet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataManipulationController : ControllerBase
    {
        private IConfiguration _config;
        DB db;

        public DataManipulationController(IConfiguration config)
        {
            _config = config;
            db = new DB(_config);
        }

        [Authorize]
        [HttpPost("oneHotEncoding")]
        public IActionResult OneHotEncoding(int idEksperimenta, int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (niz == null)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.OneHotEncoding(niz);
                return Ok("OneHotEncoding izvrseno");
            }
            catch
            {
                return StatusCode(500);
            }
        }

        [Authorize]
        [HttpPost("labelEncoding")]
        public IActionResult LabelEncoding(int idEksperimenta, int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (niz == null)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.LabelEncoding(niz);
                return Ok("LabelEncoding izvrseno");
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
        [HttpPost("deleteColumns")]
        public IActionResult deleteColumns(int idEksperimenta, int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (niz == null)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.DeleteColumns(niz);
                return Ok("Obrisane zeljene kolone");
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
        [HttpPost("fillWithMean")]
        public IActionResult fillNaWithMean(int idEksperimenta, int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.FillNAWithMean(niz);
                return Ok("Mean");
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
        [HttpPost("fillWithMedian")]
        public IActionResult fillNaWithMedian(int idEksperimenta, int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.FillNAWithMedian(niz);
                return Ok("Median");
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
        [HttpPost("fillWithMode")]
        public IActionResult fillNaWithMode(int idEksperimenta, int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.FillNAWithMode(niz);
                return Ok("Mode");
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
        [HttpPost("replaceEmpty")]
        public IActionResult replaceEmpty(int idEksperimenta, int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (niz.Length == 0)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.ReplaceEmptyWithNA(niz);
                return Ok("Zamenjene string vrednosti sa NA");
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
        [HttpPost("replaceZero")]
        public IActionResult replaceZero(int idEksperimenta, int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (niz.Length == 0)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.ReplaceZeroWithNA(niz);
                return Ok("Zamenjene 0 vrednosti sa NA");
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
        [HttpPost("deleteRows")]
        public IActionResult deleteRows(int idEksperimenta, int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded); //BadRequest
                if (niz.Length == 0)
                    return BadRequest(ErrorMessages.RowNotSelected);
                eksperiment.DeleteRows(niz);
                // Ukupan broj redova ucitanog fajla
                return Ok(eksperiment.GetRowCount().ToString());
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
        [HttpPut("updateValue/{row}/{column}/{data}")]
        public IActionResult updateAValue(int idEksperimenta, int row, int column, string data)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.UpdataValue(row, column, data);
                return Ok("Polje je izmenjeno");
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
        //ovde
        [Authorize]
        [HttpPost("absoluteMaxScaling")]
        public IActionResult absoluteMaxScaling(int idEksperimenta, int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (kolone == null)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.ScaleAbsoluteMax(kolone);
                return Ok("Absolute Max Scaling izvrseno");
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
        [HttpPost("minMaxScaling")]
        public IActionResult minMaxScaling(int idEksperimenta, int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (kolone == null)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.ScaleMinMax(kolone);
                return Ok("Min-Max Scaling izvrseno");
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
        [HttpPost("zScoreScaling")]
        public IActionResult zScoreScaling(int idEksperimenta, int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (kolone == null)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.ScaleZScore(kolone);
                return Ok("Z-Score Scaling izvrseno");
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
        [HttpPost("standardDeviation/{threshold}")]
        public IActionResult RemoveStandardDeviation(int idEksperimenta, int[] kolone, float threshold)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (kolone == null)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.RemoveOutliersStandardDeviation(kolone, threshold);
                return Ok("Standard Deviation");
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
        [HttpPost("outliersQuantiles/{threshold}")]
        public IActionResult RemoveQuantiles(int idEksperimenta, int[] kolone, float threshold)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (kolone == null)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.RemoveOutliersQuantiles(kolone, threshold);
                return Ok("Quantiles");
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
        [HttpPost("outliersZScore/{threshold}")]
        public IActionResult RemoveZScore(int idEksperimenta, int[] kolone, float threshold)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (kolone == null)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.RemoveOutliersZScore(kolone, threshold);
                return Ok("ZScore izvresno");
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
        [HttpPost("outliersIQR")]
        public IActionResult RemoveIQR(int idEksperimenta, int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (kolone == null)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.RemoveOutliersIQR(kolone);
                return Ok("Z-Score Scaling izvrseno");
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
        [HttpPost("outliersIsolationForest")]
        public IActionResult RemoveIsolationForest(int idEksperimenta, int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (kolone == null)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.RemoveOutliersIsolationForest(kolone);
                return Ok("Forest Isolation");
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
        [HttpPost("outliersOneClassSVM")]
        public IActionResult RemoveOneClassSVM(int idEksperimenta, int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (kolone == null)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.RemoveOutliersOneClassSVM(kolone);
                return Ok("One Class SVM");
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
        [HttpPost("outliersByLocalFactor")]
        public IActionResult RemoveByLocalFactor(int idEksperimenta, int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (kolone == null)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.RemoveOutliersByLocalFactor(kolone);
                return Ok("Local Factor");
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
        [HttpPost("deleteAllColumnsNA")]
        public IActionResult DeleteAllNAColumns(int idEksperimenta)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.DropNAColumns();
                return Ok("Kolone sa NA vrednostima su obrisane");
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
        [HttpPost("deleteAllRowsNA")]
        public IActionResult DeleteAllNARows(int idEksperimenta)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.DropNAListwise();
                return Ok("Redovi sa NA vrednostima su obrisani");
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
        [HttpPost("deleteNARowsForColumns")]
        public IActionResult DeleteAllNARowsForColumns(int idEksperimenta, int[] kolone)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                if (kolone == null)
                    return BadRequest(ErrorMessages.ColumnsNotSelected);
                eksperiment.DropNAPairwise(kolone);
                return Ok("Redovi sa NA vrednostima su obrisani za date kolone");
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
        [HttpPost("linearRegression/{idKolone}")]
        public IActionResult FillNALinearRegression(int idEksperimenta, int idKolone, int[] niz)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);
                eksperiment.FillNAWithRegression(idKolone, niz);
                return Ok("Linearna regresija - uspesno");
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
        [HttpPost("addNewRow")]
        public IActionResult AddNewRow(int idEksperimenta, string[] red)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);

                if(red == null)
                {
                    return BadRequest(ErrorMessages.RowNotFilled);
                }
                eksperiment.AddRow(red);
                return Ok("Dodat novi red.");
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
        [HttpPost("fillNaWithValue/{column}/{value}")]
        public IActionResult FillNaWithValue(int idEksperimenta, int column, string value)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);

                if (value == "")
                {
                    return BadRequest(ErrorMessages.FieldNotFilled);
                }
                //Console.WriteLine(column + " -- " + value);
                eksperiment.FillNAWithValue(column, value);
                
                
                return Ok("NA vrednosti su zamenjene.");
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
        [HttpPost("toggleColumnType/{idColumn}")]
        public IActionResult ToggleColumnType(int idEksperimenta, int idColumn)
        {
            try
            {
                var token = Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
                MLExperiment eksperiment;
                if (Experiment.eksperimenti.ContainsKey(idEksperimenta))
                    eksperiment = Experiment.eksperimenti[idEksperimenta];
                else
                    return BadRequest(ErrorMessages.ExperimentNotLoaded);

                eksperiment.ToggleColumnsType(idColumn);

                return Ok("Tip kolone je zamenjen");
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
