import { BlockBlobClient } from "@azure/storage-blob";
import type { FileDetails } from "../interfaces/FileDetails";
import React, { useState } from 'react';

export async function uploadToBlob(arrayBuffer: ArrayBuffer, fDetails: FileDetails) {
    const fileName = fDetails.selectedFile.name;

    const blobResponse = await fetch(`https://localhost:5001/api/v1/generate-sas?fileName=${encodeURIComponent(fileName)}`, {
        method: "GET"
    });
    const blobData = await blobResponse.json();
    const blobSasUrl = blobData.sasUrl;

    const blockBlobClient = new BlockBlobClient(blobSasUrl);

    const uploadBlobResponse = await blockBlobClient.uploadData(arrayBuffer, {
        blobHTTPHeaders: {
            blobContentType: "application/dicom",
            blobContentDisposition: "attachment",
        },
    });

    console.log(
        `Upload block blob successfully with request ID: ${uploadBlobResponse.requestId}`,
    );

    return blockBlobClient.name;
}

export async function sendToBackend(fileList: string[]) {
    const token = localStorage.getItem('token');
    const sendToBackendResponse = await fetch('https://localhost:5001/api/v1/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadedFileNames: fileList, jwtToken: token})
    })

    if (!sendToBackendResponse.ok) {
        throw new Error('Blob name transfer failed');
    }
}