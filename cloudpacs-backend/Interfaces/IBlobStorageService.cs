using Azure.Storage.Blobs;
 
namespace CloudPACS.Backend.Dicom;
 
public interface IBlobStorageService
{
    Task<Stream> GetDicomStreamAsync(string blobName);
}
 
public class BlobStorageService : IBlobStorageService
{
    private readonly BlobContainerClient _containerClient;
 
    public BlobStorageService(BlobServiceClient blobServiceClient)
    {
        _containerClient = blobServiceClient.GetBlobContainerClient("dicom-uploads");
    }
 
    public async Task<Stream> GetDicomStreamAsync(string blobName)
    {
        var blobClient = _containerClient.GetBlobClient(blobName);
        var download = await blobClient.DownloadStreamingAsync();
        return download.Value.Content;
    }
}