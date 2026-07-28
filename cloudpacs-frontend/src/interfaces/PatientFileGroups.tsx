export interface PatientFileGroups {
    patientName: string;
    patientId: string;
    files: File[];
    studies: string[];
    totalFileSize: number;
}