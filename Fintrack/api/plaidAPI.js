import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL;


export const createLinkToken = async (userId) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/create_link_token`, { userId });
        return response.data
    }
    catch (error) {
        console.error("Error creating link token:", error);
        throw error;
    }
}

export const exchangePublicToken = async (userId, public_token) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/exchange_public_token`, { userId, public_token });
        return response.data
    }
    catch (error) {
        console.error("Error generating access token:", error);
        throw error;
    }
}