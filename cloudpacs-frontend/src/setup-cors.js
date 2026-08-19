import { BlobServiceClient } from "@azure/storage-blob";

await blobServiceClient.setProperties({
  cors: [
    {
      allowedOrigins: "http://localhost:5173",
      allowedMethods: "GET,PUT,POST,DELETE,HEAD,OPTIONS,MERGE",
      allowedHeaders: "*",
      exposedHeaders: "*",
      maxAgeInSeconds: 200
    }
  ]
});

console.log("CORS configured on Azurite");