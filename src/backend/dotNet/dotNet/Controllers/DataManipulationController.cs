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
                    return BadRequest("Korisnik mora ponovo da se prijavi!");
                if (niz == null)
                    return BadRequest("Nisu unete kolone");
                eksperiment.OneHotEncoding(niz);
                return Ok("OneHotEncoding izvrseno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return Ok("");
                if (niz == null)
                    return BadRequest("Nisu unete kolone");
                eksperiment.LabelEncoding(niz);
                return Ok("LabelEncoding izvrseno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (niz.Length == 0)
                    return BadRequest("Prazan niz");
                eksperiment.DeleteColumns(niz);
                return Ok("Obrisane zeljene kolone");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.FillNAWithMean(niz);
                return Ok("Mean");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.FillNAWithMedian(niz);
                return Ok("Median");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.FillNAWithMode(niz);
                return Ok("Mode");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (niz.Length == 0)
                    return BadRequest("Vrednosti za zamenu ne postoje");
                eksperiment.ReplaceEmptyWithNA(niz);
                return Ok("Zamenjene string vrednosti sa NA");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (niz.Length == 0)
                    return BadRequest("Vrednosti za zamenu ne postoje");
                eksperiment.ReplaceZeroWithNA(niz);
                return Ok("Zamenjene 0 vrednosti sa NA");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik nije pronadjen"); //BadRequest
                if (niz.Length == 0)
                    return BadRequest("Redovi za brisanje nisu izabrani");
                eksperiment.DeleteRows(niz);
                // Ukupan broj redova ucitanog fajla
                return Ok(eksperiment.GetRowCount().ToString());
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.UpdataValue(row, column, data);
                return Ok("Polje je izmenjeno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.ScaleAbsoluteMax(kolone);
                return Ok("Absolute Max Scaling izvrseno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.ScaleMinMax(kolone);
                return Ok("Min-Max Scaling izvrseno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.ScaleZScore(kolone);
                return Ok("Z-Score Scaling izvrseno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.RemoveOutliersStandardDeviation(kolone, threshold);
                return Ok("Standard Deviation");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.RemoveOutliersQuantiles(kolone, threshold);
                return Ok("Quantiles");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.RemoveOutliersZScore(kolone, threshold);
                return Ok("ZScore izvresno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.RemoveOutliersIQR(kolone);
                return Ok("Z-Score Scaling izvrseno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.RemoveOutliersIsolationForest(kolone);
                return Ok("Forest Isolation");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.RemoveOutliersOneClassSVM(kolone);
                return Ok("One Class SVM");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije odabrana nijedna kolona.");
                eksperiment.RemoveOutliersByLocalFactor(kolone);
                return Ok("Local Factor");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.DropNAColumns();
                return Ok("Kolone sa NA vrednostima su obrisane");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.DropNAListwise();
                return Ok("Redovi sa NA vrednostima su obrisani");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                if (kolone == null)
                    return BadRequest("Nije uneta nijedna kolona");
                eksperiment.DropNAPairwise(kolone);
                return Ok("Redovi sa NA vrednostima su obrisani za date kolone");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");
                eksperiment.FillNAWithRegression(idKolone, niz);
                return Ok("Linearna regresija - uspesno");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");

                if(red == null)
                {
                    return BadRequest("Podaci nisu uneti.");
                }
                eksperiment.AddRow(red);
                return Ok("Dodat novi red.");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");

                if (value == "")
                {
                    return BadRequest("Podaci nisu uneti.");
                }
                //Console.WriteLine(column + " -- " + value);
                eksperiment.FillNAWithValue(column, value);
                
                
                return Ok("NA vrednosti su zamenjene.");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
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
                    return BadRequest("Korisnik treba ponovo da se prijavi.");

                eksperiment.ToggleColumnsType(idColumn);

                return Ok("Tip kolone je zamenjen");
            }
            catch
            {
                return BadRequest("Doslo do greske.");
            }
        }


    }
}
