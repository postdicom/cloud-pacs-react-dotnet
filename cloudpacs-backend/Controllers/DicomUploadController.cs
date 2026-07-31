namespace CloudPACS.Backend
{
    using System.Net;
    using Azure.Core.Pipeline;
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
    using System.IdentityModel.Tokens.Jwt;
    using Microsoft.AspNetCore.Authorization;
    using System.Security.Claims;

    [ApiController]
    [Route("api/v1")]
    public class DicomUploadController : ControllerBase
    {
        private readonly string _uploadDirectory;
        private readonly Container _instanceContainer;
        private readonly Container _patientContainer;
        private readonly Container _studyContainer;
        private readonly Container _seriesContainer;
        private readonly BlobServiceClient _blobServiceClient;
        private readonly BlobContainerClient _dicomsContainerClient;

        private int _imageCount;
        private int _studyCount;

        public DicomUploadController(CosmosClient cosmosClient, BlobServiceClient blobServiceClient)
        {
            _uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(), "UploadedDicoms");

            if (!Directory.Exists(_uploadDirectory))
            {
                Directory.CreateDirectory(_uploadDirectory);
            }

            _instanceContainer = cosmosClient.GetContainer("CloudPACS", "Instance");
            _patientContainer = cosmosClient.GetContainer("CloudPACS", "Patient");
            _studyContainer = cosmosClient.GetContainer("CloudPACS", "Study");
            _seriesContainer = cosmosClient.GetContainer("CloudPACS", "Series");

            _imageCount = 0;
            _studyCount = 0;
            _blobServiceClient = blobServiceClient;

            _dicomsContainerClient = _blobServiceClient.GetBlobContainerClient("dicom-uploads");


        }

        [HttpGet("generate-sas")]
        public async Task<IActionResult> GenerateSasUrlAsync([FromQuery] string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                return BadRequest(new { message = "File name is required." });
            }

            await _dicomsContainerClient.CreateIfNotExistsAsync();

            var blobClient = _dicomsContainerClient.GetBlobClient(fileName);

            var sasBuilder = new BlobSasBuilder()
            {
                BlobContainerName = _dicomsContainerClient.Name,
                BlobName = blobClient.Name,
                Resource = "b",
                StartsOn = DateTimeOffset.UtcNow,
                ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(15)
            };

            sasBuilder.SetPermissions(BlobContainerSasPermissions.Create | BlobContainerSasPermissions.Write | BlobContainerSasPermissions.List);

            Uri sasUri = blobClient.GenerateSasUri(sasBuilder);

            return Ok(new { sasUrl = sasUri.ToString() });
        }

        [HttpPost("upload")]
        [Authorize]
        public async Task<IActionResult> UploadDicomFiles([FromBody] List<string> uploadedFileNames)
        {
            if (uploadedFileNames == null || uploadedFileNames.Count == 0)
            {
                return BadRequest(new { message = "There are no files." });
            }

            var uploadedFilesData = new List<object>();
            var parser = new DicomParser();
            var errors = new List<string>();

            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;
            string userRole = User.FindFirstValue(ClaimTypes.Role);

            if (string.Equals(userRole, "Radiologist", StringComparison.OrdinalIgnoreCase) &&
                string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase))
            {


                if (string.IsNullOrEmpty(userId))
                {
                    errors.Add("User ID claim was not found in the authenticated context.");
                }
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
                                var downloadOptions = new Azure.Storage.Blobs.Models.BlobDownloadToOptions
                                {
                                    TransferOptions = new Azure.Storage.StorageTransferOptions
                                    {
                                        MaximumConcurrency = 1,
                                        InitialTransferSize = 4 * 1024 * 1024,
                                        MaximumTransferSize = 4 * 1024 * 1024
                                    }
                                };

                                await blobClient.DownloadToAsync(memoryStream, downloadOptions);

                                memoryStream.Position = 0;
                                extractedMetadata = parser.ExtractMetadataDictionary(memoryStream);
                            }
                        }
                        catch (Exception parseEx)
                        {
                            errors.Add($"Metadata extraction failed for '{fileName}': {parseEx.Message}");
                            continue;
                        }

                        string? patientId = "UNKNOWN";
                        string? studyUid = "UNKNOWN";
                        string? seriesUid = "UNKNOWN";
                        string? dateOfBirth = "UNKNOWN";
                        string? patientName = "UNKNOWN";
                        string? studyId = "UNKNOWN";
                        string? studyDate = "UNKNOWN";
                        string? modality = "UNKNOWN";
                        string? seriesNumber = "UNKNOWN";
                        string? sopInstanceUid = null;
                        string? studyInstanceUid = "UNKNOWN";

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

                            if (!extractedMetadata.TryGetValue("(0010,0030) Patient's Birth Date", out dateOfBirth))
                                errors.Add($"'{fileName}': key '(0010,0030) Patient's Birth Date' not found.");

                            if (!extractedMetadata.TryGetValue("(0010,0010) Patient's Name", out patientName))
                                errors.Add($"'{fileName}': key '(0010,0010) Patient's Name' not found.");

                            if (!extractedMetadata.TryGetValue("(0008,0020) Study Date", out studyDate))
                                errors.Add($"'{fileName}': key '(0008,0020) Study Date' not found.");

                            if (!extractedMetadata.TryGetValue("(0008,0060) Modality", out modality))
                                errors.Add($"'{fileName}': key '(0008,0060) Modality' not found.");

                            if (!extractedMetadata.TryGetValue("(0020,0011) Series Number", out seriesNumber))
                                errors.Add($"'{fileName}': key '(0020,0011) Series Number' not found.");

                            if (!extractedMetadata.TryGetValue("(0020,000D) Study Instance UID", out studyInstanceUid))
                                errors.Add($"'{fileName}': key '(0020,000D)  Study Instance UID' not found.");

                            if (!extractedMetadata.TryGetValue("(0020,0010) Study ID", out studyId))
                                errors.Add($"'{fileName}': key '(0020,0010)  Study ID' not found.");
                        }
                        catch (Exception lookupEx)
                        {
                            errors.Add($"Metadata lookup failed: '{fileName}': {lookupEx.Message}");
                        }

                        string documentId = !string.IsNullOrWhiteSpace(sopInstanceUid) ? sopInstanceUid : Guid.NewGuid().ToString();
                        patientId = patientId ?? "UNKNOWN";

                        var instanceDoc = new Instance(
                            documentId,
                            patientId ?? "UNKNOWN",
                            seriesUid ?? "UNKNOWN",
                            studyUid ?? "UNKNOWN",
                            documentId,
                            blobClient.Uri.ToString(),
                            DateTime.UtcNow,
                            extractedMetadata
                        );
                        var studyDoc = new Study(
                            studyInstanceUid ?? "UNKNOwN",
                            patientId ?? "UNKNOwN",
                            studyDate ?? "UNKNOwN",
                            modality ?? "UNKNOwN",
                            seriesNumber ?? "UNKNOwN",
                            _imageCount + 1,
                            Common.objectType.Study
                            );
                        var patientDoc = new Patient(
                            patientId ?? "UNKNOwN",
                            userId,
                            patientId ?? "UNKNOwN",
                            patientName ?? "UNKNOWN",
                            dateOfBirth ?? "UNKNOWN",
                            _studyCount + 1,
                            Common.objectType.Patient
                        );
                        var seriesDoc = new Series(
                            studyInstanceUid ?? "UNKNOWN",
                            patientId ?? "UNKNOwN",
                            patientName ?? "UNKNOWN",
                            seriesNumber ?? "UNKNOWN",
                            studyInstanceUid ?? "UNKNOWN",
                            Common.objectType.Series
                        );
                        patientDoc.userId = patientDoc.userId + "Test";
                        try
                        {
                            await _instanceContainer.UpsertItemAsync(
                            instanceDoc,
                            new PartitionKey(instanceDoc.seriesGuid)
                        );
                        }
                        catch (Exception ex)
                        {
                            errors.Add($"instance failed: {ex.Message}");
                        }
                        try
                        {
                            await _patientContainer.UpsertItemAsync(
                                patientDoc,
                                new PartitionKey(patientDoc.userId)
                            );
                        }
                        catch (Exception ex)
                        {
                            errors.Add($"patient failed: {ex.Message}");
                        }
                        try
                        {
                            await _studyContainer.UpsertItemAsync(
                                studyDoc,
                                new PartitionKey(studyDoc.patientGuid)
                            );
                        }
                        catch (Exception ex)
                        {
                            errors.Add($"study failed: {ex.Message}");
                        }
                        try
                        {
                            await _seriesContainer.UpsertItemAsync(
                                seriesDoc,
                                new PartitionKey(seriesDoc.studyGuid)
                            );
                        }
                        catch (Exception ex)
                        {
                            errors.Add($"series failed: {ex.Message}");
                        }

                        uploadedFilesData.Add(new
                        {
                            originalFileName = fileName,
                            instanceId = instanceDoc.Id,
                            patientId = instanceDoc.seriesGuid,
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
            else
            {
                return Unauthorized(new { message = "You dont have the right authorization to upload a file." });
            }
        }

        [HttpGet("viewer/instance/{id}/metadata")]
        public async Task<IActionResult> GetInstanceMetadata(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { message = "Instance ID is required." });
            }
            try
            {
                var queryDef = new QueryDefinition("SELECT * FROM c WHERE c.id = @id")
                    .WithParameter("@id", id);

                using var iterator = _instanceContainer.GetItemQueryIterator<Instance>(queryDef);

                if (iterator.HasMoreResults)
                {
                    var response = await iterator.ReadNextAsync();
                    var instanceDoc = response.FirstOrDefault();

                    if (instanceDoc != null)
                    {
                        return Ok(instanceDoc.Metadata);
                    }
                }
                return NotFound(new { message = $"Metadata for instance '{id}' not found." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error fetching metadata: {ex.Message}" });
            }
        }
    }
}