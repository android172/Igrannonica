using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NekiController : ControllerBase
    {
        // GET: api/<NekiController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<NekiController>/5
        [HttpPost("login")]
        public string Login([FromBody] User user) {
            if (user.username != "admin" && user.password != "admin")
                return "User not found";
            return $"Welcome {user.username}!";
        }

        // POST api/<NekiController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<NekiController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<NekiController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}

public class User
{
    public string username { get; set; }
    public string password { get; set; }
}