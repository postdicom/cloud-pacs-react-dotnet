
namespace CloudPACS.Backend
{
    using System;
    using System.Linq;

    public static class DicomParserTest
    {
        public static void TestExtractMetadata(string filePath)
        {
            Console.WriteLine($"-------------Testing DICOM metadata extraction----------");
            Console.WriteLine($"File: {filePath}");
            Console.WriteLine();

            if (!File.Exists(filePath))
            {
                Console.WriteLine($"FAIL: File does not exist at path '{filePath}'.");
                return;
            }

            var parser = new DicomParser();

            try
            {
                var metadata = parser.ExtractMetadataDictionary(filePath);

                if (metadata == null || metadata.Count == 0)
                {
                    Console.WriteLine("FAIL: No metadata was extracted (dictionary is null or empty).");
                    return;
                }

                Console.WriteLine($"SUCCESS: Extracted {metadata.Count} tag(s).");
                Console.WriteLine();

                CheckKey(metadata, "(0010,0020) Patient ID");
                CheckKey(metadata, "(0020,000D) Study Instance UID");
                CheckKey(metadata, "(0020,000E) Series Instance UID");
                CheckKey(metadata, "(0008,0018) SOP Instance UID");
                Console.WriteLine();

                Console.WriteLine("------------------START--------------------");
                foreach (var kvp in metadata.OrderBy(k => k.Key))
                {
                    Console.WriteLine($"{kvp.Key} = {kvp.Value}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"FAIL: Exception during extraction: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
            }

            Console.WriteLine();
            Console.WriteLine("-------------------Finish-----------------");
        }

        private static void CheckKey(System.Collections.Generic.Dictionary<string, string> metadata, string key)
        {
            if (metadata.TryGetValue(key, out var value))
            {
                Console.WriteLine($"OK   - '{key}' found -> \"{value}\"");
            }
            else
            {
                Console.WriteLine($"MISS - '{key}' NOT found in extracted metadata.");
            }
        }
    }
}