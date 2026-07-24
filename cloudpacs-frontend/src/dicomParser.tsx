import * as dicomParser from "dicom-parser";

export function parseByteArray(byteArray: Uint8Array): string{
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