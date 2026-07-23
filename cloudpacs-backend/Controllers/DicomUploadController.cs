namespace CloudPACS.Backend
{
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Azure.Cosmos;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;

    [ApiController]
    [Route("api/v1")]
    public class DicomUploadController : ControllerBase
    {
        private readonly string _uploadDirectory;
        private readonly Container _instanceContainer;

        public DicomUploadController(CosmosClient cosmosClient)
        {
            _uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(), "UploadedDicoms");

            if (!Directory.Exists(_uploadDirectory))
            {
                Directory.CreateDirectory(_uploadDirectory);
            }

            _instanceContainer = cosmosClient.GetContainer("CloudPACS", "Instance");
        }

        [HttpPost("upload")]
        [RequestSizeLimit(104857600)] // 100 MB limit
        public async Task<IActionResult> UploadDicomFiles([FromForm] List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest(new { message = "There are no files." });
            }

            var uploadedFilesData = new List<object>();
            var errors = new List<string>();
            var parser = new DicomParser();

            foreach (var file in files)
            {
                var extension = Path.GetExtension(file.FileName);
                if (!string.Equals(extension, ".dcm", StringComparison.OrdinalIgnoreCase))
                {
                    errors.Add($"File '{file.FileName}' rejected: You can only upload .dcm files");
                    continue;
                }

                if (file.Length == 0)
                {
                    errors.Add($"File '{file.FileName}' rejected: File is empty.");
                    continue;
                }

                try
                {
                    var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
                    var filePath = Path.Combine(_uploadDirectory, uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    Dictionary<string, string> extractedMetadata = new Dictionary<string, string>();
                    try
                    {
                        extractedMetadata = parser.ExtractMetadataDictionary(filePath);
                    }
                    catch (Exception parseEx)
                    {
                        errors.Add($"Metadata extraction failed for '{file.FileName}': {parseEx.Message}");
                    }
                    string patientId = "UNKNOWN";
                    string studyUid = "UNKNOWN";
                    string seriesUid = "UNKNOWN";
                    string sopInstanceUid = null;

                    try
                    {
                        if (!extractedMetadata.TryGetValue("(0010,0020) Patient ID", out patientId))
                            errors.Add($"'{file.FileName}': key '(0010,0020) Patient ID' not found in extracted metadata.");

                        if (!extractedMetadata.TryGetValue("(0020,000D) Study Instance UID", out studyUid))
                            errors.Add($"'{file.FileName}': key '(0020,000D) Study Instance UID' not found in extracted metadata.");

                        if (!extractedMetadata.TryGetValue("(0020,000E) Series Instance UID", out seriesUid))
                            errors.Add($"'{file.FileName}': key '(0020,000E) Series Instance UID' not found in extracted metadata.");

                        if (!extractedMetadata.TryGetValue("(0008,0018) SOP Instance UID", out sopInstanceUid))
                            errors.Add($"'{file.FileName}': key '(0008,0018) SOP Instance UID' not found in extracted metadata.");
                    }
                    catch (Exception lookupEx)
                    {
                        errors.Add($"Metadata lookup failed: '{file.FileName}': {lookupEx.Message}");
                    }

                    string documentId = !string.IsNullOrWhiteSpace(sopInstanceUid) ? sopInstanceUid : Guid.NewGuid().ToString();
                    string safePatientId = patientId ?? "UNKNOWN";

                    var instanceDoc = new Instance
                    {
                        Id = documentId,
                        PatientId = safePatientId,
                        StudyInstanceUid = studyUid ?? "UNKNOWN",
                        SeriesInstanceUid = seriesUid ?? "UNKNOWN",
                        SopInstanceUid = documentId,
                        FilePath = filePath,
                        UploadDate = DateTime.UtcNow,
                        Metadata = extractedMetadata
                    };
                    await _instanceContainer.UpsertItemAsync(
                        instanceDoc,
                        new PartitionKey(safePatientId)
                    );

                    uploadedFilesData.Add(new
                    {
                        originalFileName = file.FileName,
                        instanceId = instanceDoc.Id,
                        patientId = instanceDoc.PatientId,
                        status = "Saved to Disk and Cosmos DB"
                    });
                }
                catch (Exception ex)
                {
                    errors.Add($"Failed to process '{file.FileName}': {ex.Message}");
                }
            }

            if (!uploadedFilesData.Any())
            {
                return BadRequest(new { message = "Upload failed.", errors });
            }

            return Ok(new
            {
                successMessage = $"Successfully processed {uploadedFilesData.Count} file(s).",
                errors = errors.Any() ? errors : null,
                data = uploadedFilesData
            });
        }
    }
}