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
        public InstanceController(IInstanceRepository instanceRepository, AuditLogService auditLogService, UserRepository userRepository)
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
                string userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;
                User user = await userRepository.FindUserByUserIdAsync(userId);
                string userName = user.Name;
                auditLogService.LogAsync(userId, userName, AuditActions.Login, ResourceType.Session, "User viewed instances in the series with the:  " + id);
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