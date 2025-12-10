import { BlobServiceClient } from "@azure/storage-blob";

const blobSasUrl = import.meta.env.VITE_BLOB_URL;
const blobServiceClient = new BlobServiceClient(blobSasUrl);
const containerName = "sarlacc";
const containerClient = blobServiceClient.getContainerClient(containerName);

export const saveImagesToBlobStorage = async (images) => {
  const imageUrls = await Promise.all(
    images.map(async (image) => {
      const ts = new Date().getTime();
      const fileName = `${ts}_${image.name}`;
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.uploadBrowserData(image, {
        blobHTTPHeaders: {
          blobContentType: image.type || "application/octet-stream",
        },
      });
      return blockBlobClient.url;
    })
  );
  return imageUrls;
};
