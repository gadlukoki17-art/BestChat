import { API_URL, API_KEY } from "./config.js";

export async function postData(endpoint, data, token = null) {
    const headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(API_URL + endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
    });

    return await response.json();
}

export async function getData(endpoint, token) {
    const response = await fetch(API_URL + endpoint, {
        method: "GET",
         headers: {
            "Content-type": "application/json",
            "x-api-key": API_KEY,
            "Authorization": `Bearer ${token}`
        }
    });

    const result = await response.json();
    return result;
}

export async function deleteData(endpoint, token = null) {
    const headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(API_URL + endpoint, {
        method: "DELETE",
        headers
    });

    return await response.json();
}
