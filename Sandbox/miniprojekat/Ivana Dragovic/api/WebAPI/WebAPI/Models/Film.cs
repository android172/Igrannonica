using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Models
{
    public class Film
    {
        public int filmId { get; set; }
        public string filmNaziv { get; set; }
        public string filmZanr { get; set; }
        public string filmOcena { get; set; }
    }
}
