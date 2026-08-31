namespace CloudPACS.Backend.Controllers
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using CloudPACS.Backend;
    using Microsoft.AspNetCore.Authorization;
    using System.Security.Claims;

    [ApiController]
    [Route("api/v1")]
    public class SettingsController : ControllerBase
    {
        private readonly IStudyRepository _studyRepository;

        public SettingsController(IStudyRepository studyRepository)
        {
            _studyRepository = studyRepository;
        }

        [HttpGet("patients/{id}/studies")]
        [Authorize(Roles = "Radiologist,Admin,SuperAdmin")]
        public async Task<ActionResult<List<Study>>> GetStudiesForPatient(string id)
        {
            var studies = await _studyRepository.GetStudiesByPatientIdAsync(id);
            return Ok(studies);
        }

        [HttpGet("checkForAdmin")]
        [Authorize(Roles = "Radiologist,Admin,SuperAdmin,Viewer")]
        public async Task<bool> IsAdmin()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if(role.Equals(UserRole.Admin) || role.Equals(UserRole.SuperAdmin))
            {
                return true;
            }
            return false;
        }

        [HttpGet("checkRole")]
        [Authorize(Roles = "Radiologist,Admin,SuperAdmin,Viewer")]
        public async Task<SettingsDto> GetSettingsData()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

    
            var settingsDto = new SettingsDto(
                AccountName: "", 
                UserRole: role,
                UserName: "",
                Email: "",
                UsedStorage: 1,
                TotalStorage: 1);
            
            return settingsDto;
        }
    }
}