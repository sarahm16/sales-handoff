// src/api/azureApi.js
import { azureClient } from "./azureClient";

// Generic save function
export const saveItemToAzure = async (item, containerId) => {
  try {
    const saveResponse = await azureClient.post(
      `/save?databaseId=procurement&containerId=${containerId}`,
      item
    );
    return saveResponse.data;
  } catch (error) {
    console.error(`Failed to save to ${containerId}:`, error);
    throw new Error(error.response?.data?.message || "Failed to save entity");
  }
};

// Generic update function
export const updateItemInAzure = async (updates, containerId, itemId) => {
  try {
    const updateResponse = await azureClient.post(
      `/update?databaseId=procurement&containerId=${containerId}&id=${itemId}`,
      updates
    );
    return updateResponse.data;
  } catch (error) {
    console.error(`Failed to update in ${containerId}:`, error);
    throw new Error(error.response?.data?.message || "Failed to update entity");
  }
};

// Generic delete function
export const deleteItemFromAzure = async (containerId, itemId) => {
  try {
    const deleteResponse = await azureClient.delete(
      `/delete?databaseId=procurement&containerId=${containerId}&id=${itemId}`
    );
    return deleteResponse.data;
  } catch (error) {
    console.error(`Failed to delete from ${containerId}:`, error);
    throw new Error(error.response?.data?.message || "Failed to delete entity");
  }
};

// Generic get function
export const getItemFromAzure = async (containerId, itemId) => {
  try {
    const response = await azureClient.get(
      `/getById?databaseId=procurement&containerId=${containerId}&id=${itemId}`
    );
    return response.data[0];
  } catch (error) {
    console.error(`Failed to get from ${containerId}:`, error);
    throw new Error(error.response?.data?.message || "Failed to fetch entity");
  }
};

// Generic list function
export const getItemsFromAzure = async (containerId, filters = {}) => {
  try {
    const response = await azureClient.get(
      `/getAll?databaseId=procurement&containerId=${containerId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to list from ${containerId}:`, error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch entities"
    );
  }
};

export const queryItemsFromAzure = async (containerId, query) => {
  console.log("Executing query:", query);
  try {
    const response = await azureClient.post(
      `/noSqlQuery?databaseId=procurement&containerId=${containerId}`,
      { query }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to query from ${containerId}:`, error);
    throw new Error(
      error.response?.data?.message || "Failed to query entities"
    );
  }
};

/* export const saveAttachments = async (attachments) => {
    const attachmentUrls = await Promise.all(
      attachments.map(async (attachment) => {
        const ts = new Date().getTime();
        const fileName = `${ts}_${attachment.name}`;
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        await blockBlobClient.uploadBrowserData(attachment, {
          blobHTTPHeaders: {
            blobContentType: attachment.type || "application/octet-stream",
          },
        });
        return {
          url: blockBlobClient.url,
          name: attachment.name,
          type: attachment.type || "application/octet-stream",
        };
      })
    );
    return attachmentUrls;
  }; */
