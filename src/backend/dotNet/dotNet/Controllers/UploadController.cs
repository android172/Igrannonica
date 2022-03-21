using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using dotNet.Models;
using System.Globalization;
using System.Text;
using ChoETL;
using Microsoft.VisualBasic.FileIO;

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
            string[] lines;
            var result = new StringBuilder();
            var csv = new List<string[]>();

            using (TextFieldParser csvParse = new TextFieldParser(file.OpenReadStream()))
            {
                csvParse.CommentTokens = new string[] { "#" };
                csvParse.SetDelimiters(new string[] { "," });
                csvParse.HasFieldsEnclosedInQuotes = true;

                while (!csvParse.EndOfData)
                {
                    string[] line = csvParse.ReadFields();
                    
                    for(var i=0;i<line.Length;i++)
                    {
                        if(line[i].Contains(','))
                        {
                            line[i] = "\"" + line[i] + "\"";
                        }
                    }
                    string linija = string.Join(",", line);
                    result.AppendLine(linija);
                }
            }
            //Console.WriteLine(result.ToString());
            StringBuilder sb = new StringBuilder();
            using (var p1 = ChoCSVReader.LoadText(result.ToString()).WithFirstLineHeader())
            {
                using (var w = new ChoJSONWriter(sb))
                w.Write(p1);
            }
            Console.WriteLine(sb.ToString());

            return sb.ToString();
        }
    }
}
