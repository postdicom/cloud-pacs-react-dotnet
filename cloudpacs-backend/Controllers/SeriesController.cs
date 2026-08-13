namespace CloudPACS.Backend.Controllers
{
    using System;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using global::CloudPACS.Backend;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/v1")]
    [ApiController]
    public class SeriesController : ControllerBase
    {
        private readonly ISeriesRepository seriesRepository;
        private AuditLogService auditLogService;
        private readonly IUserRepository userRepository;
        private readonly IStudyRepository studyRepository;
        public SeriesController(ISeriesRepository seriesRepository, AuditLogService auditLogService, IUserRepository userRepository, IStudyRepository studyRepository)
        {
            this.seriesRepository = seriesRepository;
            this.auditLogService = auditLogService;
            this.userRepository = userRepository;
            this.studyRepository = studyRepository;
        }

        [HttpGet("studies/{id}/series")]
        [Authorize(Roles = "Radiologist,Admin")]
        public async Task<IActionResult?> GetSeries(string id)
        {
            try
            {
                List<Series> seriesList = await seriesRepository.FindSeriesAsync(id);

                string userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;
                var user = await userRepository.FindUserByUserIdAsync(userId);
                string userName = user.Name;
                Study study = await studyRepository.GetStudyByStudyIdAsync(id);
                string studyMod = study.Mod;
                auditLogService.LogAsync(userId, userName, AuditActions.ViewStudy, ResourceType.Session, "User viewed instances in the series with the:  " + id, studyMod);
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