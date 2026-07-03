export function saveToken(token, remember) {
    if(remember) { 
        localStorage.setItem("token", token);
    } else {
        sessionStorage.removeItem("token", token);
    }    
}

export function getToken() {
    return (localStorage.setItem("token", token) ||
        sessionStorage.removeItem("token", token)
    );    
}

export function removeToken() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
}