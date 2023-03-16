window.addEventListener('load', () => {
    const { setAuthorization } = window.Authorization;
    const signInForm = document.getElementById('signin');
    signInForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(signInForm);

        const password = formData.get('password');

        const res = await fetch('/api/authentication/authorize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });

        if (res.ok) {
            let token = await res.text();
            setAuthorization(token);
            location.href = '/home';
        }
    });
});
