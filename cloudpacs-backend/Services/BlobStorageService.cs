namespace CloudPACS.Backend
{
    using System.IO;
    using System.Threading.Tasks;
    using Azure.Storage.Blobs;
    using Azure.Storage.Blobs.Models;

    public class BlobUploadResult
    {
        public string BlobUri { get; set; } = String.Empty;
        public string BlobPath { get; set; } = String.Empty;
        public long FileSizeBytes { get; set; }
    }
    public class BlobStorageService
    {
        private readonly BlobContainerClient _blobContainerClient;

        public BlobStorageService(BlobServiceClient blobServiceClient)
        {
            _blobContainerClient = blobServiceClient.GetBlobContainerClient("dicom-scans");
            _blobContainerClient.CreateIfNotExists();
        }

        public async Task<BlobUploadResult> UploadDicomFileAsync(Stream fileStream, string studyUid, string seriesUid, string sopInstanceUid)
        {
            string blobPath = $"{studyUid}/{seriesUid}/{sopInstanceUid}.dcm";

            fileStream.Position = 0;
            long fileSizeBytes = fileStream.Length;

            var blobClient = _blobContainerClient.GetBlobClient(blobPath);
            var blobOptions = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders { ContentType = "application/dicom" }
            };

            await blobClient.UploadAsync(fileStream, blobOptions);

            return new BlobUploadResult
            {
                BlobUri = blobClient.Uri.ToString(),
                BlobPath = blobPath,
                FileSizeBytes = fileSizeBytes
            };
        }
    }
}