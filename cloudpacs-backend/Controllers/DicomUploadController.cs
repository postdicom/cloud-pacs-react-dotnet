namespace CloudPACS.Backend
{
    using System.Net;
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
        private AuditLogService auditLogService;
        private readonly IUserRepository userRepository;

        private int _imageCount;
        private int _studyCount;

        public DicomUploadController(CosmosClient cosmosClient, BlobServiceClient blobServiceClient, AuditLogService auditLogService, IUserRepository userRepository)
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

            _blobServiceClient = blobServiceClient;

            _dicomsContainerClient = _blobServiceClient.GetBlobContainerClient("dicom-uploads");

            this.auditLogService = auditLogService;

            this.userRepository = userRepository;
        }
    
        [Authorize(Roles = "Radiologist,Admin,SuperAdmin")]
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
        [Authorize(Roles = "Radiologist,Admin,SuperAdmin")]
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
            string role = User.FindFirstValue(ClaimTypes.Role) ?? User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
            User user = await userRepository.FindUserByUserIdAsync(userId);

            if (string.IsNullOrEmpty(userId))
            {
                errors.Add("User ID claim was not found in the authenticated context.");
            }

            var StudyImageCount = new Dictionary<string, int>();
            var PatientStudyCount = new Dictionary<string, int>();
            var SeriesImageCount = new Dictionary<string, int>();

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

                    string? accountId = user.accountId; //Here
                    string? patientId = "UNKNOWN";
                    string? studyUid = "UNKNOWN";
                    string? seriesUid = "UNKNOWN";
                    string? dateOfBirth = "UNKNOWN";
                    string? gender = "UNKNOWN";
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
                    studyInstanceUid = studyInstanceUid ?? "UNKNOWN";
                    seriesUid = seriesUid ?? "UNKNOWN";

                    if (!StudyImageCount.ContainsKey(studyInstanceUid))
                    {
                        int existingImageCount = 0;
                        bool isNewStudy = false;

                        try
                        {
                            var studyResponse = await _studyContainer.ReadItemAsync<Study>(studyInstanceUid, new PartitionKey(patientId));

                            existingImageCount = studyResponse.Resource.ImageCount;
                        }
                        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
                        {
                            existingImageCount = 0;
                            isNewStudy = true;
                        }

                        StudyImageCount[studyInstanceUid] = existingImageCount;

                        if (!PatientStudyCount.ContainsKey(patientId))
                        {
                            int existingStudyCount = 0;
                            try
                            {
                                var patientResponse = await _patientContainer.ReadItemAsync<Patient>(patientId, new PartitionKey(userId));
                                existingStudyCount = patientResponse.Resource.NumOfStudies;
                            }
                            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
                            {
                                existingStudyCount = 0;
                            }

                            PatientStudyCount[patientId] = existingStudyCount;
                        }
                        if (isNewStudy)
                        {
                            PatientStudyCount[patientId]++;
                        }
                    }
                    if (!SeriesImageCount.ContainsKey(seriesUid))
                    {
                        int existingSeriesImageCount = 0;

                        try
                        {
                            var seriesResponse = await _seriesContainer.ReadItemAsync<Series>(seriesUid, new PartitionKey(studyInstanceUid));

                            existingSeriesImageCount = seriesResponse.Resource.NumberOfInstances;
                        }
                        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
                        {
                            existingSeriesImageCount = 0;
                        }

                        SeriesImageCount[seriesUid] = existingSeriesImageCount;
                    }

                    bool isNewInstance;
                    try
                    {
                        await _instanceContainer.ReadItemAsync<Instance>(documentId, new PartitionKey(seriesUid));
                        isNewInstance = false;
                    }
                    catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
                    {
                        isNewInstance = true;
                    }

                    if (isNewInstance)
                    {
                        StudyImageCount[studyInstanceUid]++;
                        SeriesImageCount[seriesUid]++; // NEW: keep series count in step with study count
                    }

                    int currentImageCount = StudyImageCount[studyInstanceUid];
                    int currentStudyCount = PatientStudyCount[patientId];
                    int numberOfInstances = SeriesImageCount[seriesUid]; // NEW


                    var instanceDoc = new Instance(
                        documentId,
                        seriesUid ?? "UNKNOWN",
                        seriesUid ?? "UNKNOWN",
                        studyUid ?? "UNKNOWN",
                        documentId,
                        blobClient.Uri.ToString(),
                        DateTime.UtcNow,
                        extractedMetadata,
                        accountId ?? "UNKNOWN"
                    );
                    var studyDoc = new Study(
                        studyInstanceUid ?? "UNKNOWN",
                        patientId ?? "UNKNOWN",
                        studyDate ?? "UNKNOWN",
                        modality ?? "UNKNOWN",
                        seriesNumber ?? "UNKNOWN",
                        currentImageCount,
                        Common.objectType.Study,
                        studyInstanceUid ?? "UNKNOWN",
                        accountId ?? "UNKNOWN"
                    );
                    var patientDoc = new Patient(
                        patientId ?? "UNKNOWN",
                        userId,
                        patientId ?? "UNKNOWN",
                        patientName ?? "UNKNOWN",
                        dateOfBirth ?? "UNKNOWN",
                        currentStudyCount,
                        Common.objectType.Patient,
                        gender ?? "UNKNOWN",
                        accountId ?? "UNKNOWN"
                    );

                    var seriesDoc = new Series(
                        seriesUid ?? "UNKNOWN",
                        patientId ?? "UNKNOWN",
                        patientName ?? "UNKNOWN",
                        userId,
                        seriesNumber ?? "UNKNOWN",
                        studyInstanceUid ?? "UNKNOWN",
                        Common.objectType.Series,
                        seriesUid ?? "UNKNOWN",
                        numberOfInstances,
                        accountId ?? "UNKNOWN"
                    );
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

                    string userName = user.Name;
                    auditLogService.LogAsync(userId, userName, AuditActions.UploadDICOM, ResourceType.Session, "User uploaded instance/s", studyDoc.Mod);
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