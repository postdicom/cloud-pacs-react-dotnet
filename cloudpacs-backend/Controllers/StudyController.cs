namespace CloudPACS.Backend.Controllers
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using CloudPACS.Backend;
    using Microsoft.AspNetCore.Authorization;
    using System.Security.Claims;
    using System.IdentityModel.Tokens.Jwt;

    [ApiController]
    [Route("api/v1")]
    public class StudyController : ControllerBase
    {
        private readonly IStudyRepository _studyRepository;

        public StudyController(IStudyRepository studyRepository)
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

        [HttpGet("studies/{id}")]
        [Authorize(Roles = "Radiologist,Admin,SuperAdmin")]
        public async Task<ActionResult<Study>> GetStudy(string id)
        {
            var study = await _studyRepository.GetStudyByStudyIdAsync(id);
            if (study == null)
            {
                return NotFound($"Study with the ID of {id} couldn't be found.");
            }
            return Ok(study);
        }

        [HttpGet("studies/search/{patientGuid}/{keyword}")]
        [Authorize(Roles = "Radiologist,Admin,SuperAdmin")]
        public async Task<IActionResult?> SearchForStudy(string keyword, string patientGuid)
        {
            try
            {
                List<Study> patientList = await _studyRepository.SearchStudyAsync(keyword, patientGuid);
                return Ok(patientList);
            }

            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");

                return NotFound(new List<Study>());
            }
        }
    }
}