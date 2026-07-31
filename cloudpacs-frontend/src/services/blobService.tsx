import { BlockBlobClient } from "@azure/storage-blob";
import type { FileDetails } from "../interfaces/FileDetails";
import React, { useState } from 'react';
import api from "../queryClientProvider";

export async function uploadToBlob(arrayBuffer: ArrayBuffer, fDetails: FileDetails) {

    const fileName = fDetails.selectedFile.name;

    const blobResponse = api.get(`api/v1/generate-sas?fileName=${encodeURIComponent(fileName)}`);
    const blobData = (await blobResponse).data;
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
    try {
        /* const sendToBackendResponse = await fetch('https://localhost:5001/api/v1/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fileList)
        }) */
        const sendToBackendResponse = await api.post('api/v1/upload', fileList);
        /* onUploadProgress: data => {
            progressPercentage = (Math.round((100 * data.loaded) / data.total))
        }}); */
        //TO DO: onUploadProgress
    }

    catch (error) {
        throw new Error('Blob name transfer failed' + error);
    }
}