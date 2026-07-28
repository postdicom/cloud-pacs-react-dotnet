import { BlobServiceClient } from "@azure/storage-blob";
import type { FileDetails } from "../interfaces/FileDetails";

export async function uploadToBlob (arrayBuffer: ArrayBuffer, fDetails: FileDetails) {
    const account = "cloudPACS";
    const sas = await fetch(`https://localhost/5000/generate-sas`);

    const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net?${sas}`);

    const containerName = fDetails.patientId;
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobName = `newblob ${+new Date()}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const uploadBlobResponse = await blockBlobClient.uploadData(arrayBuffer, {
        blobHTTPHeaders: {
            blobContentType: "application/dicom",
            blobContentDisposition: "attachment",
        },
    });
    console.log(
        `Upload block blob ${blobName} successfully with request ID: ${uploadBlobResponse.requestId}`,
    );
}