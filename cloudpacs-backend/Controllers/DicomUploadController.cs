namespace CloudPACS.Backend
{
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Azure.Cosmos;
    using Azure.Storage.Blobs;
    using Azure.Storage.Sas;
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
        private readonly BlobServiceClient _blobServiceClient;
        private readonly BlobContainerClient _dicomsContainerClient;

        public DicomUploadController(CosmosClient cosmosClient)
        {
            _uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(), "UploadedDicoms");

            if (!Directory.Exists(_uploadDirectory))
            {
                Directory.CreateDirectory(_uploadDirectory);
            }

            _instanceContainer = cosmosClient.GetContainer("CloudPACS", "Instance");
        }

        [HttpGet("generate-sas")]
        public IActionResult GenerateSasUrl([FromQuery] string fileName)
        {

            if (string.IsNullOrEmpty(fileName))
            {
                return BadRequest(new { message = "File name is required." });
            }

            var blobClient = _dicomsContainerClient.GetBlobClient(fileName);

            var sasBuilder = new BlobSasBuilder()
            {
                BlobContainerName = _dicomsContainerClient.Name,
                BlobName = blobClient.Name,
                Resource = "b",
                StartsOn = DateTimeOffset.UtcNow,
                ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(15)
            };

            sasBuilder.SetPermissions(BlobSasPermissions.Write | BlobSasPermissions.Create);

            Uri sasUri = blobClient.GenerateSasUri(sasBuilder);

            return Ok(new { sasUrl = sasUri.ToString() });
        }
        [HttpPost("upload")]
        public async Task<IActionResult> UploadDicomFiles([FromBody] List<string> uploadedFileNames)
        {
            if (uploadedFileNames == null || uploadedFileNames.Count == 0)
            {
                return BadRequest(new { message = "There are no files." });
            }

            var uploadedFilesData = new List<object>();
            var errors = new List<string>();
            var parser = new DicomParser();

            foreach (var fileName in uploadedFileNames)
            {
                var extension = Path.GetExtension(fileName);
                if (!string.Equals(extension, ".dcm", StringComparison.OrdinalIgnoreCase))
                {
                    errors.Add($"File '{fileName}' rejected: You can only upload .dcm files");
                    continue;
                }

                try
                {
                    var blobClient = _dicomsContainerClient.GetBlobClient(fileName);

                    if (!await blobClient.ExistsAsync())
                    {
                        errors.Add($"File '{fileName}' not found in Azure. Did the upload finish?");
                        continue;
                    }

                    Dictionary<string, string> extractedMetadata = new Dictionary<string, string>();
                    try
                    {
                        using (var memoryStream = new MemoryStream())
                        {
                            await blobClient.DownloadToAsync(memoryStream);
                            memoryStream.Position = 0;
                            extractedMetadata = parser.ExtractMetadataDictionary(memoryStream);
                        }
                    }
                    catch (Exception parseEx)
                    {
                        errors.Add($"Metadata extraction failed for '{fileName}': {parseEx.Message}");
                        continue;
                    }

                    string patientId = "UNKNOWN";
                    string studyUid = "UNKNOWN";
                    string seriesUid = "UNKNOWN";
                    string sopInstanceUid = null;

                    try
                    {
                        if (!extractedMetadata.TryGetValue("(0010,0020) Patient ID", out patientId))
                            errors.Add($"'{fileName}': key '(0010,0020) Patient ID' not found.");

                        if (!extractedMetadata.TryGetValue("(0020,000D) Study Instance UID", out studyUid))
                            errors.Add($"'{fileName}': key '(0020,000D) Study Instance UID' not found.");

                        if (!extractedMetadata.TryGetValue("(0020,000E) Series Instance UID", out seriesUid))
                            errors.Add($"'{fileName}': key '(0020,000E) Series Instance UID' not found.");

                        if (!extractedMetadata.TryGetValue("(0008,0018) SOP Instance UID", out sopInstanceUid))
                            errors.Add($"'{fileName}': key '(0008,0018) SOP Instance UID' not found.");
                    }
                    catch (Exception lookupEx)
                    {
                        errors.Add($"Metadata lookup failed: '{fileName}': {lookupEx.Message}");
                    }

                    string documentId = !string.IsNullOrWhiteSpace(sopInstanceUid) ? sopInstanceUid : Guid.NewGuid().ToString();
                    patientId = patientId ?? "UNKNOWN";

                    var instanceDoc = new Instance
                    {
                        Id = documentId,
                        patientId = patientId,
                        StudyInstanceUid = studyUid ?? "UNKNOWN",
                        SeriesInstanceUid = seriesUid ?? "UNKNOWN",
                        SopInstanceUid = documentId,
                        FilePath = blobClient.Uri.ToString(),
                        UploadDate = DateTime.UtcNow,
                        Metadata = extractedMetadata
                    };

                    await _instanceContainer.UpsertItemAsync(
                        instanceDoc,
                        new PartitionKey(patientId)
                    );

                    uploadedFilesData.Add(new
                    {
                        originalFileName = fileName,
                        instanceId = instanceDoc.Id,
                        patientId = instanceDoc.patientId,
                        status = "Saved to Azure and Cosmos DB"
                    });
                }
                catch (Exception ex)
                {
                    errors.Add($"Failed to process '{fileName}': {ex.Message}");
                }
            }

            if (!uploadedFilesData.Any())
            {
                return BadRequest(new { message = "Upload failed for all files.", errors });
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