using ctp_docente_portal.Server.DTOs.StaffUserLinks;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StaffUserLinksController : ControllerBase
    {
        private readonly IStaffUserLinkService _service;

        public StaffUserLinksController(IStaffUserLinkService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StaffUserLinksDto>> GetById(int id)
        {
            return Ok(await _service.GetByIdAsync(id));
        }

        [HttpGet]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<ActionResult<IEnumerable<StaffUserLinksDto>>> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpPost]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<ActionResult<StaffUserLinksDto>> Create(StaffUserLinksCreateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _service.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
    }
}
