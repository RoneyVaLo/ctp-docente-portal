using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EvaluationCategoriesController : ControllerBase
    {
        private readonly IEvaluationCategoriesService _service;

        public EvaluationCategoriesController(IEvaluationCategoriesService service)
        {
            _service = service;
        }

        // 📌 GET /api/evaluationcategories
        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var result = await _service.GetCategoriesAsync();
            return Ok(result);
        }

        // 📌 GET /api/evaluationcategories/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var result = await _service.GetCategoryByIdAsync(id);
            return Ok(result);
        }
    }
}
