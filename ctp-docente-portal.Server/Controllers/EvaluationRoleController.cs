using ctp_docente_portal.Server.Services.Implementations;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EvaluationRoleController : ControllerBase
    {
        private readonly IEvaluationRoleService _evaluationRoleService;

        public EvaluationRoleController(IEvaluationRoleService evaluationRoleService)
        {
            _evaluationRoleService = evaluationRoleService;
        }

        [HttpGet]
        [Authorize(Policy = "AdministrativoOnly")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _evaluationRoleService.GetAllAsync();
            return Ok(result);
        }
    }
}
