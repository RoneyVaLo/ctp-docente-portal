using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.Staff;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StaffController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StaffController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StaffDto>>> Get()
        {
            var staffDtos = await _context.Staff
       .Select(s => new StaffDto
       {
           Id = s.Id,
           Name = s.Name,
       })
       .ToListAsync();

            return Ok(staffDtos);
        }

        // GET api/<StaffController>/5
        //[HttpGet("{id}")]
        //public string Get(int id)
        //{
        //    return "value";
        //}
    }
}
