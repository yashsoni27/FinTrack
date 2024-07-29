import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export const scanReceipt = async (imageData) => {
  try {    
    const response = await axios.post(
      `${BASE_URL}/ocr/scan-receipt`,
      {
        image: imageData,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching receiptData: ", error);
    throw error;
  }
};
