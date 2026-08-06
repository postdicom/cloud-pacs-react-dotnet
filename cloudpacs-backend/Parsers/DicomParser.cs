namespace CloudPACS.Backend
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using FellowOakDicom;

    public class DicomParser
    {
        public Dictionary<string, string> ExtractMetadataDictionary(Stream stream)
        {
            var dicomFile = DicomFile.Open(stream);
            var metadata = new Dictionary<string, string>();

            ExtractDataset(dicomFile.Dataset, metadata, string.Empty);

            return metadata;
        }

        internal Dictionary<string, string> ExtractMetadataDictionary(string filePath)
        {
            using var stream = File.OpenRead(filePath);
            return ExtractMetadataDictionary(stream);
        }

        private void ExtractDataset(DicomDataset dataset, Dictionary<string, string> metadata, string prefix)
        {
            foreach (var item in dataset)
            {
                string tagKey = $"({item.Tag.Group:X4},{item.Tag.Element:X4})";
                string tagName = item.Tag.DictionaryEntry.Name;

                string fullKey = string.IsNullOrEmpty(prefix)
                    ? $"{tagKey} {tagName}"
                    : $"{prefix} > {tagKey} {tagName}";

                if (item.ValueRepresentation == DicomVR.SQ)
                {
                    var sequence = (DicomSequence)item;
                    metadata[fullKey] = $"[Sequence with {sequence.Items.Count} item(s)]";

                    for (int i = 0; i < sequence.Items.Count; i++)
                    {
                        ExtractDataset(sequence.Items[i], metadata, $"{fullKey}[{i}]");
                    }
                }
                else if (item.ValueRepresentation == DicomVR.OB || item.ValueRepresentation == DicomVR.OW ||
                          item.ValueRepresentation == DicomVR.UN || item.Tag == DicomTag.PixelData)
                {
                    if (item is DicomElement element)
                    {
                        metadata[fullKey] = $"[Binary Data: {element.Buffer.Size} bytes]";
                    }
                    else
                    {
                        metadata[fullKey] = "[Binary Data]";
                    }
                }
                else
                {
                    try
                    {
                        var values = dataset.GetValues<string>(item.Tag);
                        string stringValue = string.Join("\\", values);

                        metadata[fullKey] = string.IsNullOrWhiteSpace(stringValue) ? "[Empty]" : stringValue;
                    }
                    catch (Exception ex)
                    {
                        metadata[fullKey] = $"[Error reading value: {ex.Message}]";
                    }
                }
            }
        }
    }
}