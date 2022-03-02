using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApi.Models
{
    public class Zaposleni
    {
        public int ZaposleniId { get; set; }
        public string Naziv { get; set; }
        public string Departman { get; set; }
    }
}
