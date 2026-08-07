import type React from "react";
import { useRef, useState } from "react";
import Navbar from "../components/navbar";
import "../stylesheets/upload.css";
import { parseByteArrayForPatientName, parseByteArrayForStudyId, parseByteArrayForPatientId } from "../dicomParser"
import { sendToBackend, uploadToBlob } from "../services/blobService";
import type { FileDetails } from "../interfaces/FileDetails";
import type { PatientFileGroups } from "../interfaces/PatientFileGroups";

interface UploadProps {
    onFileChange: (files: File[]) => void;
}

function Upload({ onFileChange }: UploadProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [fileList, setFileList] = useState<File[]>([]);
    const uploadPromises: Promise<void>[] = [];
    const validBlobNames: string[] = [];
    const [blobNameList, setBlobNameList] = useState<string[]>([]);
    const [patientFileGroups, setPatientFileGroups] = useState<PatientFileGroups[]>([]);

    const onDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const getAllFiles = async (e: React.DragEvent): Promise<File[]> => {
        const items = Array.from(e.dataTransfer.items);
        const entries = items
            .map((item) => item.webkitGetAsEntry())
            .filter((entry): entry is FileSystemEntry => entry !== null);

        const files: File[] = [];

        while (entries.length > 0) {
            const entry = entries.shift()!;

            if (entry.isFile) {
                const file = await new Promise<File>((resolve, reject) =>
                    (entry as FileSystemFileEntry).file(resolve, reject)
                );
                files.push(file);

            } else if (entry.isDirectory) {
                const reader = (entry as FileSystemDirectoryEntry).createReader();
                const dirEntries = await readAllDirectoryEntries(reader);
                entries.push(...dirEntries);
            }
        }
        return files;
    };

    const readAllDirectoryEntries = async (directoryReader: FileSystemDirectoryReader) => {
        let entries: FileSystemEntry[] = [];
        let readEntries = await readEntriesPromise(directoryReader);
        while (readEntries && readEntries.length > 0) {
            entries.push(...readEntries);
            readEntries = await readEntriesPromise(directoryReader);
        }
        return entries;
    };

    const readEntriesPromise = async (directoryReader: FileSystemDirectoryReader) => {
        try {
            return await new Promise<FileSystemEntry[]>((resolve, reject) => {
                directoryReader.readEntries(resolve, reject);
            });
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const onDrop = async (e: React.DragEvent) => {
        console.log(e);
        e.preventDefault();
        e.stopPropagation();

        const droppedFiles = await getAllFiles(e);
        setFileList(droppedFiles);

        if (droppedFiles.length > 0) {
            const updatedList = [...droppedFiles];
            updatedList.forEach(async (file: File) => {
                const promise = (async () => {
                    const arrayBuffer = await file.arrayBuffer();
                    const byteArray = new Uint8Array(arrayBuffer);
                    const fDetails: FileDetails = {
                        patientName: parseByteArrayForPatientName(byteArray),
                        patientId: parseByteArrayForPatientId(byteArray),
                        selectedFile: file,
                        studyId: parseByteArrayForStudyId(byteArray)
                    };

                   /*  if (fDetails.selectedFile.size / 102400 > 100) {
                        return;
                    } */

                    if (parseByteArrayForPatientId(byteArray) === "Invalid" || parseByteArrayForPatientId(byteArray) === "Element has no data") {
                        return;
                    }

                    await uploadToBlob(arrayBuffer, fDetails);
                    validBlobNames.push(file.name);

                    setPatientFileGroups((patientFileGroups) => {
                        if (!patientFileGroups.some((p) => p.patientId === fDetails.patientId)) {
                            const patientGroup: PatientFileGroups = {
                                patientName: fDetails.patientName,
                                patientId: fDetails.patientId,
                                files: [fDetails.selectedFile],
                                studies: [fDetails.studyId],
                                totalFileSize: fDetails.selectedFile.size
                            };
                            return [...patientFileGroups, patientGroup];
                        }
                        else {
                            const patientGroup = patientFileGroups.find((p) => p.patientId === fDetails.patientId);
                            if (patientGroup) {
                                const updatedGroup = {
                                    ...patientGroup,
                                    files: [...patientGroup.files, fDetails.selectedFile],
                                    totalFileSize: patientGroup.totalFileSize + fDetails.selectedFile.size,
                                };
                                let updatedStudies = patientGroup.studies;
                                if (!patientGroup.studies.includes(fDetails.studyId)) {
                                    updatedStudies = [...patientGroup.studies, fDetails.studyId];
                                }

                                return patientFileGroups.map((p) =>
                                    p.patientId === fDetails.patientId ? updatedGroup : p
                                );
                            }
                            return [...patientFileGroups];
                        }
                    });
                })()
                uploadPromises.push(promise);
            });
            await Promise.all(uploadPromises);
            //const newBlobNames = updatedList.map((file) => file.name);
            setBlobNameList((prev) => [...prev, ...validBlobNames]);
            await sendToBackend(validBlobNames);
            onFileChange(updatedList);
        }
    };

    const handleDivClick = () => {
        /* {
            wrapperRef.current?.classList.remove('dragover');
     
            const droppedFiles = Array.from(e.target);
     
            if (droppedFiles.length > 0) {
                const updatedList = [...fileList, ...droppedFiles];
                updatedList.forEach(async (file: File) => {
                    const arrayBuffer = await file.arrayBuffer();
                    const byteArray = new Uint8Array(arrayBuffer);
                    setTest(file.name);
                    setTest(parseByteArray(byteArray));
                });
                setFileList(updatedList);
                onFileChange(updatedList);
            }
     
            e.preventDefault();
            e.stopPropagation();
        }; */
    };

    const onFileChangeSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const updatedList = [...fileList, ...files];
            setFileList(updatedList);
            onFileChange(updatedList);
        }
    };

    const fileRemove = (file: FileDetails) => {
        const updatedList = fileList.filter((f) => f !== file.selectedFile);
        //const fDetails = patientsAndFiles.filter((f) => f !== file)
        //setPatientsAndFiles(fDetails);
        setFileList(updatedList);
        onFileChange(updatedList);
    };

    return (
        <>
            <div className="uploadContainer">
                <div className="navbar"><Navbar /></div>
                <div className="uploadPage">
                    <h1 id="uploadTitle">Upload DICOM Files</h1>
                    <div id="dragAndDropArea">
                        <div
                            ref={wrapperRef}
                            className="dragAndDropHeader"
                            onDragEnter={onDragEnter}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            onClick={handleDivClick}
                            style={{ cursor: 'pointer' }}
                        >
                            <svg id="dragAndDropAreaSymbol" viewBox="0 0 24 24">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            <div id="fileDragAndDropInstruction">Drop .dcm files here</div>
                            <div id="fileDragAndDropInfo">or click to browse · Supports .dcm and .dicom · Multiple files accepted</div>
                            {/* <input
                                type="file"
                                ref={fileInputRef}
                                onChange={onFileChangeSelection}
                                multiple
                                style={{ display: 'none' }}
                                accept=".dcm"
                            /> */}

                        </div>
                    </div>
                    {fileList.length > 0 && (
                        <div className="drop-file-preview">
                            {patientFileGroups.map((item, index) => (
                                <div key={index} className="filesBeingUploaded">
                                    <div className="fileDetails">
                                        <p>{item.patientName}</p>
                                        <p>{item.studies.length} studies</p>
                                        <p>{item.files.length} files</p>
                                        <p>{(item.totalFileSize / 102400).toFixed(2)} MB</p>
                                    </div>
                                    <progress className="progressBar" value="70" max="100">70 %</progress>
                                    {/* <span className="drop-file-preview__item__del" onClick={() => fileRemove(item)}>x</span> */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Upload;