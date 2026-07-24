import type React from "react";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/navbar";
import "../stylesheets/upload.css";
import { parseByteArray } from "../dicomParser"

interface UploadProps {
    onFileChange: (files: File[]) => void;
}

interface FileDetails {
    selectedFile: File;
    patientName: String;
}

function Upload({ onFileChange }: UploadProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileList, setFileList] = useState<File[]>([]);
    const [patientsAndFiles, setPatientsAndFiles] = useState<FileDetails[]>([]);
    const [patientsShown, setPatientsShown] = useState<string[]>([]);
    const [test, setTest] = useState<string>(" n");

    const onDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        wrapperRef.current?.classList.add('dragover');
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        wrapperRef.current?.classList.remove('dragover');
    };

    const onDrop = (e: React.DragEvent) => {
        wrapperRef.current?.classList.remove('dragover');

        const droppedFiles = Array.from(e.dataTransfer.files);

        if (droppedFiles.length > 0) {
            const updatedList = [...fileList, ...droppedFiles];
            updatedList.forEach(async (file: File) => {
                const arrayBuffer = await file.arrayBuffer();
                const byteArray = new Uint8Array(arrayBuffer);
                setTest(file.name);
                setTest(parseByteArray(byteArray));
                const fDetails: FileDetails = {selectedFile: file, patientName:parseByteArray(byteArray)};
                setPatientsAndFiles(prev => [...prev, fDetails]);
            });

            setFileList(updatedList);
            onFileChange(updatedList);
        }

        e.preventDefault();
        e.stopPropagation();
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
        const fDetails = patientsAndFiles.filter((f) => f !== file)
        setPatientsAndFiles(fDetails);
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
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={onFileChangeSelection}
                                multiple
                                style={{ display: 'none' }}
                                accept=".dcm"
                            />

                        </div>
                    </div>
                    {fileList.length > 0 && (
                        <div className="drop-file-preview">
                            {patientsAndFiles.map((item, index) => (
                                <div key={index} className="filesBeingUploaded">
                                    <div className="fileDetails">
                                        <p>{item.patientName}</p>
                                        <p>{(item.selectedFile.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <progress className="progressBar" value="70" max="100">70 %</progress>
                                    <span className="drop-file-preview__item__del" onClick={() => fileRemove(item)}>x</span>
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