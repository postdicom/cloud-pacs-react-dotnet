namespace CloudPACS.Backend.Controllers
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using CloudPACS.Backend;

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
        public async Task<ActionResult<List<Study>>> GetStudiesForPatient(string id)
        {
            var studies = await _studyRepository.GetStudiesByPatientIdAsync(id);
            return Ok(studies);
        }

        [HttpGet("studies/{id}")]
        public async Task<ActionResult<Study>> GetStudy(string id)
        {
            var study = await _studyRepository.GetStudyByStudyIdAsync(id);
            if (study == null)
            {
                return NotFound($"Study with the ID of {id} couldn't be found.");
            }
            return Ok(study);
        }
    }
}