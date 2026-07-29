import { BlobServiceClient } from "@azure/storage-blob";
import type { FileDetails } from "../interfaces/FileDetails";

export async function uploadToBlob(arrayBuffer: ArrayBuffer, fDetails: FileDetails) {
    const account = "cloudPACS";
    const response = await fetch(`http://localhost:5000/generate-sas`);
    if (!response.ok) throw new Error("Failed to fetch SAS token");

    let sas = await response.text();

    const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net?${sas}`);

    const containerName = fDetails.patientId;
    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists();

    const blobName = `New instances ${+new Date()}`;
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

    await fetch('/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blobName)
    })

    if (!response.ok) {
        throw new Error('Login failed');
    }
}