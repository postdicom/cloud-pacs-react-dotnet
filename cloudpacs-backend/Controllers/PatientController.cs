namespace CloudPACS.Backend.Controllers
{
    using System;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/[controller]")]
    [ApiController]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientRepository patientRepository;
        public PatientsController(IPatientRepository patientRepository)
        {
            this.patientRepository = patientRepository;
        }

        [HttpGet]
        public async Task<IActionResult?> GetPatients()
        {
            try
            {
                string userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;
                List<Patient> patientList = await patientRepository.FindPatientsAsync(userId);
                return Ok(patientList);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return null;
            }

        }

        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult?> GetPatientDetails([FromBody] PatientListDto patientListDto)
        {
            try
            {
                Patient patient = await patientRepository.GetPatientByMrn(patientListDto);
                return Ok(patient);
            }

            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return null;
            }
        }


        [HttpGet]
        [Route("search/{keyword}")]
        public async Task<IActionResult?> SearchForPatient(string keyword)
        {
            try
            {
                string userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;
                Patient patient = await patientRepository.SearchPatientAsync(keyword, userId);
                return Ok(patient);
            }


            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return null;
            }
        }
    }
}