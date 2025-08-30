using ctp_docente_portal.Server.DTOs.EvaluationCriteria;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace ctp_docente_portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "DocenteOnly")]
    public class EvaluationCriteriaController : ControllerBase
    {
        private readonly IEvaluationCriteriaService _service;

        public EvaluationCriteriaController(IEvaluationCriteriaService service)
        {
            _service = service;
        }

        // POST /api/evaluationcriteria/bulk
        [HttpPost("bulk")]
        public async Task<IActionResult> CreateMany([FromBody] List<EvaluationCriteriaDto> criteriaList)
        {
            // ⚠️ Validación mínima: estructura válida
            if (criteriaList == null || !criteriaList.Any())
                return BadRequest("La lista de criterios no puede estar vacía.");

            var result = await _service.CreateManyAsync(criteriaList);

            // 201 Created con datos guardados
            return Created(string.Empty, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromBody] List<EvaluationCriteriaDto> criteriaList)
        {
            var result = await _service.UpdateManyAsync(criteriaList);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }

        [HttpGet("item/{evaluationItemId}")]
        public async Task<IActionResult> GetByEvaluationItemId(int evaluationItemId)
        {
            var result = await _service.GetByEvaluationItemIdAsync(evaluationItemId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            //Console.WriteLine(result);
            return Ok(result);
        }
    }
}
