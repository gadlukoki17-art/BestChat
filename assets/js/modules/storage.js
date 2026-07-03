export function saveToken(token) {
    localStorage.setItem("token", token);
}

export function getToken() {
    return localStorage.setItem.getToken("token");
}

export function removeToken() {
    localStorage.removeItem("token");
}