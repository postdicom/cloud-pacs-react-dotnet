namespace CloudPACS.Backend.Controllers
{
    using System;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Azure.Cosmos;

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
        public async Task<IActionResult> GetPatients([FromBody] string userId)
        {
            try
            {
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
        public async Task<IActionResult> GetPatientDetails([FromBody] PatientListDto patientListDto)
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
    }
}