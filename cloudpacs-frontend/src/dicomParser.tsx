import * as dicomParser from "dicom-parser";

export function parseByteArrayForPatientName(byteArray: Uint8Array): string{
    try {
        var dataSet = dicomParser.parseDicom(byteArray);

        var patientName = dataSet.string('x00100010');

        if (patientName !== undefined) {
            return patientName;
        }
        else {
            return "element has no data";
        }

    }
    catch (ex) {
        console.log(ex);
        return "Invalid";
    }
}

export function parseByteArrayForStudyId(byteArray: Uint8Array): string{
    try {
        var dataSet = dicomParser.parseDicom(byteArray);

        var studyId = dataSet.string('x00200010');

        if (studyId !== undefined) {
            return studyId;
        }
        else {
            return "Element has no data";
        }

    }
    catch (ex) {
        console.log(ex);
        return "Invalid";
    }
}

export function parseByteArrayForPatientId(byteArray: Uint8Array): string{
    try {
        var dataSet = dicomParser.parseDicom(byteArray);

        var patientId = dataSet.string('x00100020');

        if (patientId !== undefined) {
            return patientId;
        }
        else {
            return "Element has no data";
        }

    }
    catch (ex) {
        console.log(ex);
        return "Invalid";
    }
}