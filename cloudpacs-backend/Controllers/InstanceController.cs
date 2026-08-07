namespace CloudPACS.Backend.Controllers
{
    using System;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/v1")]
    [ApiController]
    public class InstanceController : ControllerBase
    {
        private readonly IInstanceRepository instanceRepository;
        private readonly IUserRepository userRepository;
        private AuditLogService auditLogService;
        public InstanceController(IInstanceRepository instanceRepository, AuditLogService auditLogService, IUserRepository userRepository)
        {
            this.instanceRepository = instanceRepository;
            this.auditLogService = auditLogService;
            this.userRepository = userRepository;
        }

        [HttpGet("series/{id}/instances")]
        public async Task<IActionResult?> GetInstances(string id)
        {
            try
            {
                List<Instance> instanceList = await instanceRepository.FindInstancesAsync(id);
                return Ok(instanceList);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return null;
            }

        }
    }
}