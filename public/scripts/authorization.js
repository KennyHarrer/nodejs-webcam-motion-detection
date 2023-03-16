window.addEventListener('load', async () => {
    const hasAuth = await hasAuthorization();
    if (!hasAuth && window.location.pathname != '/') {
        location.href = '/';
    } else if (hasAuth && window.location.pathname == '/') {
        location.href = '/home';
    }
});

async function hasAuthorization() {
    if (!localStorage.authorization) return false;
    let res = await fetch('/api/authentication/test', {
        method: 'POST',
        headers: generateAuthroizationHeader(),
    });
    if (!res.ok) {
        deleteAuthorization();
    }
    return res.ok;
}

function getAuthorization() {
    return localStorage.authorization;
}

function setAuthorization(token) {
    localStorage.authorization = token;
}

function deleteAuthorization() {
    delete localStorage.authorization;
}

function generateAuthroizationHeader() {
    const headers = new Headers();
    headers.append('Authorization', getAuthorization());
    return headers;
}

const Authorization = window.Authorization || {
    hasAuthorization,
    getAuthorization,
    setAuthorization,
    generateAuthroizationHeader,
};

window.Authorization = Authorization;
