using ctp_docente_portal.Server.DTOs.Staff;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        [HttpGet]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<ActionResult<List<StaffDto>>> GetAllAsync()
        {
            var staff = await _staffService.GetAllAsync();
            return Ok(staff);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StaffDto>> GetByIdAsync(int id)
        {
            var staff = await _staffService.GetByIdAsync(id);
            return Ok(staff);
        }

    }
}
