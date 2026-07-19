import { API_URL } from "./config.js";

export async function postData(endpoint, data, token = null) {
    const headers = {
        "Content-Type": "application/json",
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
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });

    return response.json();
}

export async function deleteData(endpoint, token = null) {
    const headers = {
        "Content-Type": "application/json"
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

export async function patchData(endpoint, data, token = null) {
    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(API_URL + endpoint, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data)
    });

    return await response.json();
}
