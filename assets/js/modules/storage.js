const TOKEN_KEY = "kadea_token";

export function saveToken(token, remember) {
    if (remember) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        sessionStorage.setItem(TOKEN_KEY, token);
    }
}

export function getToken() {
    return (
        localStorage.getItem(TOKEN_KEY) ||
        sessionStorage.getItem(TOKEN_KEY)
    );
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
}