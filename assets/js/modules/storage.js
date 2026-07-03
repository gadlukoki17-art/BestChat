const TOKEN_KEY = "kadea_token";

export function saveToken(token, remember) {
    if(remember) { 
        localStorage.setItem("kadea_token", token);
    } else {
        sessionStorage.removeItem("kadea_token", token);
    }    
}

export function getToken() {
    return (localStorage.setItem("kadea_token") ||
        sessionStorage.removeItem("kadea_token")
    );    
}

export function removeToken() {
    localStorage.removeItem("kadea_token");
    sessionStorage.removeItem("kadea_token");
}