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
        /* var config = {
            onUploadProgress: function(progressEvent) {
              var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
            }
          }; */
        const sendToBackendResponse = await api.post('api/v1/upload', fileList/* , config */);
    }

    catch (error) {
        throw new Error('Blob name transfer failed' + error);
    }
}


export function uploadFile(file: File, onProgress: (percentage: number) => void) {
    const url = `http://127.0.0.1:10000/devstoreaccount1/dicom-uploads`; // /${file.name}.dcm
    //const key = sasKey;

    return new Promise<string>((res, rej) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);

        xhr.onload = () => {
            const resp = JSON.parse(xhr.responseText);
            res(resp.secure_url);
        };
        xhr.onerror = (evt) => rej(evt);
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentage = (event.loaded / event.total) * 100;
                onProgress(Math.round(percentage));
            }
        };

        const formData = new FormData();
        formData.append('file', file);
        //formData.append('upload_preset', key);

        xhr.send(formData);
    });
}