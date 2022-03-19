using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
//using SoftCircuits.CsvParser; 
using System.Text.Json;
using dotNet.Models;
using CsvHelper;
using System.Globalization;
using System.Text;
using ChoETL;

namespace dotNet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private IConfiguration _config;

        public UploadController(IConfiguration config)
        {
            _config = config; 
        }

        [HttpPost("upload")]
        public string Upload(IFormFile file) //JsonResult
        {   
            var result = new StringBuilder();
            using (var reader = new StreamReader(file.OpenReadStream()))
            {
                while (reader.Peek() >= 0)
                    result.AppendLine(reader.ReadLine());
            }
            //Console.WriteLine(result);


            StringBuilder sb = new StringBuilder();
            using (var p1 = ChoCSVReader.LoadText(result.ToString()) //result.ToString()
                .WithFirstLineHeader()
                )
            {
                using (var w = new ChoJSONWriter(sb))
                    w.Write(p1);
            }

            Console.WriteLine(sb.ToString());

            // return new JsonResult(sb.ToString());
            return sb.ToString();


        }
    }
}
