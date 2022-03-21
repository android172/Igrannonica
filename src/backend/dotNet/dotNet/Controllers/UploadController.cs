using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using dotNet.Models;
using System.Globalization;
using System.Text;
using ChoETL;
using Microsoft.VisualBasic.FileIO;
using Newtonsoft.Json;

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
                csvParse.SetDelimiters(",");
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
            /*
            var csv = new List<string[]>();
            var lines = File.ReadAllLines(path);

            foreach (string line in lines)
                csv.Add(line.Split(','));

            var properties = lines[0].Split(',');

            var listObjResult = new List<Dictionary<string, string>>();

            for (int i = 1; i < lines.Length; i++)
            {
                var objResult = new Dictionary<string, string>();
                for (int j = 0; j < properties.Length; j++)
                    objResult.Add(properties[j], csv[i][j]);

                listObjResult.Add(objResult);
            }

            return JsonConvert.SerializeObject(listObjResult);
            */
        }
    }
}
