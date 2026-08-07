namespace CloudPACS.Backend
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Azure.Storage.Blobs;
    using Azure.Storage.Sas;
    using System.Linq;

    [ApiController]
    [Authorize(Roles = "Admin,Radiologist,Viewer")]
    [Route("api/v1/viewer")]
    public class ViewerController : ControllerBase
    {
        private readonly IDicomViewRepository _repository;
        private readonly BlobContainerClient _dicomsContainerClient;

        public ViewerController(IDicomViewRepository repository, BlobServiceClient blobServiceClient)
        {
            _repository = repository;
            _dicomsContainerClient = blobServiceClient.GetBlobContainerClient("dicom-uploads");
        }

        [HttpGet("instance/{id}/metadata")]
        public async Task<IActionResult> GetInstanceMetadata(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { message = "Instance ID is required." });
            }
            try
            {
                var instanceDoc = await _repository.GetInstanceByIdAsync(id);

                if (instanceDoc != null)
                {
                    return Ok(instanceDoc.Metadata);
                }

                return NotFound(new { message = $"Metadata for instance '{id}' not found." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error fetching metadata: {ex.Message}" });
            }
        }

        [HttpGet("study/{studyGuid}/series")]
        public async Task<IActionResult> GetSeriesForStudy(string studyGuid)
        {
            var results = await _repository.GetSeriesForStudyAsync(studyGuid);

            if (!results.Any())
                return NotFound(new { message = $"No series found for study '{studyGuid}'." });

            var ordered = results
                .OrderBy(s => int.TryParse(s.SeriesNumber, out var n) ? n : int.MaxValue)
                .Select(s => new
                {
                    seriesInstanceUid = s.SeriesInstanceUid,
                    id = s.Id,
                    seriesNumber = s.SeriesNumber,
                    patientName = s.PatientName,
                    numberOfInstances = s.numberOfInstances
                });

            return Ok(ordered);
        }

        [HttpGet("series/{seriesGuid}/instances")]
        public async Task<IActionResult> GetInstancesForSeries(string seriesGuid)
        {
            var results = await _repository.GetInstancesForSeriesAsync(seriesGuid);

            if (!results.Any())
            {
                return NotFound(new { message = $"No instances found for series '{seriesGuid}'." });
            }

            var ordered = results
             .OrderBy(i => GetInstanceNumber(i))
             .Select(i => new
             {
                 sopInstanceUid = i.SopInstanceUid,
                 instanceNumber = GetInstanceNumber(i),
                 downloadUrl = $"/api/v1/viewer/instance/{i.SopInstanceUid}/download?seriesGuid={seriesGuid}",
                 metadata = i.Metadata
             });

            return Ok(ordered);
        }

        [HttpGet("instance/{id}/download")]
        public async Task<IActionResult> DownloadInstance(string id, [FromQuery] string seriesGuid)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { message = "Instance ID is required." });
            }
            Instance? instanceDoc = null;

            if (!string.IsNullOrEmpty(seriesGuid))
            {
                instanceDoc = await _repository.GetInstanceByPartitionKeyAsync(id, seriesGuid);
            }

            if (instanceDoc == null)
            {
                instanceDoc = await _repository.GetInstanceBySopUidAsync(id);
            }

            if (instanceDoc == null)
            {
                return NotFound(new { message = $"Instance '{id}' not found." });
            }

            var fileName = new Uri(instanceDoc.FilePath).Segments.Last();
            var blobClient = _dicomsContainerClient.GetBlobClient(fileName);

            if (!await blobClient.ExistsAsync())
            {
                return NotFound(new { message = "Underlying blob not found." });
            }
            try
            {
                var downloadResult = await blobClient.DownloadContentAsync();
                var bytes = downloadResult.Value.Content.ToArray();
                return File(bytes, "application/dicom", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error downloading blob: {ex.Message}" });
            }

        }

        private static int GetInstanceNumber(Instance instance)
        {
            if (instance.Metadata != null && instance.Metadata.TryGetValue("(0020,0013) Instance Number", out var val)
            && int.TryParse(val, out var n))
            {
                return n;
            }
            return int.MaxValue;
        }
    }
}