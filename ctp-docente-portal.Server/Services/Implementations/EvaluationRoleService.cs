using AutoMapper;
using ctp_docente_portal.Server.Data;
using ctp_docente_portal.Server.DTOs.EvaluationRole;
using ctp_docente_portal.Server.DTOs.Users;
using ctp_docente_portal.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ctp_docente_portal.Server.Services.Implementations
{
    public class EvaluationRoleService : IEvaluationRoleService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public EvaluationRoleService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<EvaluationRoleDto>> GetAllAsync()
        {
            var roles = await _context.EvaluationRoles
                .AsNoTracking()
                .ToListAsync();

            return _mapper.Map<List<EvaluationRoleDto>>(roles);
        }
    }
}
