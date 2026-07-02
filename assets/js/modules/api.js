import { API_URL, API_KEY } from "./config.js";

export async function postData(endpoint, data) {

    try {

        const response = await fetch(API_URL + endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        return result;
    }  catch (error) {
            console.error(`Network error on ${endpoint}:`, error);
            return { success: false, message: "Unable to connect to the server." };
    }
    
}