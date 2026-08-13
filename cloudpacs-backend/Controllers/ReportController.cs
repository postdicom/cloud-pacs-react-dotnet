namespace CloudPACS.Backend.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Security.Claims;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;
    using CloudPACS.Backend.Interfaces;
    using CloudPACS.Backend;
    using System.Text.Json;

    [ApiController]
    [Route("api/v1/reports")]
    [Authorize]
    public class ReportController : ControllerBase
    {
        private readonly IReportRepository _reportRepository;
        private readonly IStudyRepository _studyRepository;
        private readonly ReportGenerationService _reportGenerationService;
        private readonly AuditLogService _auditLogService;
        private readonly ILogger<ReportController> _logger;

        public ReportController(
            IReportRepository reportRepository,
            IStudyRepository studyRepository,
            ReportGenerationService reportGenerationService,
            AuditLogService auditLogService,
            ILogger<ReportController> logger)
        {
            _reportRepository = reportRepository;
            _studyRepository = studyRepository;
            _reportGenerationService = reportGenerationService;
            _auditLogService = auditLogService;
            _logger = logger;
        }

        [HttpPost("generate")]
        public async Task<ActionResult<Report>> GenerateReport([FromBody] GenerateReportRequestDto request, CancellationToken cancellationToken = default)
        {
            Response.ContentType = "text/event-stream";
            Response.Headers.Append("Cache-Control", "no-cache");
            Response.Headers.Append("Connection", "keep-alive");

            if (request is null || string.IsNullOrWhiteSpace(request.StudyId))
            {
                return BadRequest("StudyId is required.");
            }

            if (string.IsNullOrWhiteSpace(request.ImageBase64))
            {
                return BadRequest("Image data is required.");
            }

            var (userId, userName) = GetCurrentUser();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var instance = await _studyRepository.GetStudyByStudyIdAsync(request.StudyId, cancellationToken);
            if (instance is null)
            {
                return NotFound($"Study '{request.StudyId}' was not found.");
            }

            byte[] imageBytes;
            try
            {
                imageBytes = Convert.FromBase64String(request.ImageBase64);
            }
            catch (FormatException)
            {
                return BadRequest("ImageBase64 is not valid base64 image data.");
            }

            string findings = "";
            try
            {
                await _reportGenerationService.SetPrompt(imageBytes);
                await foreach (var chunk in _reportGenerationService.GetReport())
                {
                    findings += chunk;
                    var json = JsonSerializer.Serialize(chunk);
                    await Response.WriteAsync($"{json}", cancellationToken: cancellationToken);
                    await Response.Body.FlushAsync(cancellationToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI report generation failed for the instance {StudyId}", instance.Id);
                return StatusCode(StatusCodes.Status502BadGateway, "Report generation failed. Please try again.");
            }
            try
            {
            var report = new Report(
                id: Guid.NewGuid().ToString(),
                studyId: instance.StudyInstanceUid,
                findings: findings,
                createdByUserId: userId,
                createdByUserName: userName,
                createdAtUtc: DateTime.UtcNow);

            var created = await _reportRepository.CreateReportAsync(report, cancellationToken);

            await _auditLogService.LogAsync(
                userId,
                userName ?? userId,
                AuditActions.GenerateReport,
                ResourceType.Study,
                instance.Id,
                $"AI report {created.Id} generated for instance {instance.Id}");

            return CreatedAtAction(nameof(GetReportsForStudy), new { studyId = instance.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save the generated report for the instance {StudyId}", instance.Id);
                return StatusCode(StatusCodes.Status500InternalServerError, "Failed to save the generated report. Please try again.");
            }
        }

        [HttpGet("{studyId}")]
        public async Task<ActionResult<List<Report>>> GetReportsForStudy(string studyId, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(studyId))
            {
                return BadRequest("studyId is required.");
            }

            var reports = await _reportRepository.GetReportsByStudyIdAsync(studyId, cancellationToken);
            return Ok(reports);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Report>> UpdateReport(string id, [FromBody] UpdateReportRequestDto request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest("id is required.");
            }

            if (request is null || string.IsNullOrWhiteSpace(request.Findings))
            {
                return BadRequest("Findings is required.");
            }
            var existing = await _reportRepository.GetReportsByStudyIdAsync(id, cancellationToken);
            if (existing is null)
            {
                return NotFound($"Report '{id}' was not found.");
            }

            existing.Findings = request.Findings;
            existing.UpdatedAtUtc = DateTime.UtcNow;

            var updated = await _reportRepository.UpdateReportAsync(existing, cancellationToken);

            return Ok(updated);
        }

        private (string? userId, string? userName) GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue("name") ?? userId;

            return (userId, userName);
        }
    }
}