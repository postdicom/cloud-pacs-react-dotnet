namespace CloudPACS.Backend.Controllers
{
    using System;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/v1")]
    [ApiController]
    public class SeriesController : ControllerBase
    {
        private readonly ISeriesRepository seriesRepository;
        private AuditLogService auditLogService;
        private readonly IUserRepository userRepository;
        public SeriesController(ISeriesRepository seriesRepository, AuditLogService auditLogService, IUserRepository userRepository)
        {
            this.seriesRepository = seriesRepository;
            this.auditLogService = auditLogService;
            this.userRepository = userRepository;
        }

        [HttpGet("studies/{id}/series")]
        public async Task<IActionResult?> GetSeries(string id)
        {
            try
            {
                List<Series> seriesList = await seriesRepository.FindSeriesAsync(id);

                string userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;
                var user = await userRepository.FindUserByUserIdAsync(userId);
                string userName = user.Name;
                auditLogService.LogAsync(userId, userName, AuditActions.Login, ResourceType.Session, "User viewed instances in the series with the:  " + id);
                return Ok(seriesList);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DATABASE ERROR: {ex.Message}");
                return NotFound();
            }
        }
    }
}