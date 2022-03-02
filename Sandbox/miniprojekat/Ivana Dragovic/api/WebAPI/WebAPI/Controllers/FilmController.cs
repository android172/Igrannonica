using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Data;
using System.Data.SqlClient;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilmController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        public FilmController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public JsonResult Get()
        {
            string query = @"select * from film";

            DataTable table = new DataTable();
            string sqlDataSource = _configuration.GetConnectionString("FilmConnectionString");

            SqlDataReader reader;

            using (SqlConnection conn = new SqlConnection(sqlDataSource))
            {
                conn.Open();
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    reader = cmd.ExecuteReader();
                    table.Load(reader);

                    reader.Close();
                    conn.Close();
                }
            }

            return new JsonResult(table);
        }

        [HttpPost]
        public JsonResult Post(Film film)
        {
            string query = @"insert into film values('" + film.filmNaziv + @"','" + film.filmZanr + @"','" + film.filmOcena + @"')";

            DataTable table = new DataTable();

            string sqlDataSource = _configuration.GetConnectionString("FilmConnectionString");
            SqlDataReader reader;
            using (SqlConnection conn = new SqlConnection(sqlDataSource))
            {
                conn.Open();
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    reader = cmd.ExecuteReader();
                    table.Load(reader);

                    reader.Close();
                    conn.Close();
                }
            }
            return new JsonResult("Uspesno dodato!");
        }

        [HttpPut]
        public JsonResult Put(Film film)
        {
            string query = @"update film set filmNaziv=@filmNaziv, filmZanr=@filmZanr, filmOcena=@filmOcena where filmId=@filmId";

            DataTable table = new DataTable();

            string sqlDataSource = _configuration.GetConnectionString("FilmConnectionString");
            SqlDataReader reader;
            using (SqlConnection conn = new SqlConnection(sqlDataSource))
            {
                conn.Open();
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@filmNaziv", film.filmNaziv);
                    cmd.Parameters.AddWithValue("@filmZanr", film.filmZanr);
                    cmd.Parameters.AddWithValue("@filmOcena", film.filmOcena);
                    cmd.Parameters.AddWithValue("@filmId", film.filmId);
                    reader = cmd.ExecuteReader();
                    table.Load(reader);

                    reader.Close();
                    conn.Close();
                }
            }
            return new JsonResult("Uspesno izmenjeno!");
        }

        [HttpDelete("{id}")]
        public JsonResult Delete(int id)
        {
            string query = @"delete from film where filmId=" + id;

            DataTable table = new DataTable();

            string sqlDataSource = _configuration.GetConnectionString("FilmConnectionString");
            SqlDataReader reader;
            using (SqlConnection conn = new SqlConnection(sqlDataSource))
            {
                conn.Open();
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    reader = cmd.ExecuteReader();
                    table.Load(reader);

                    reader.Close();
                    conn.Close();
                }
            }
            return new JsonResult("Uspesno obrisano!");
        }
    }
}
