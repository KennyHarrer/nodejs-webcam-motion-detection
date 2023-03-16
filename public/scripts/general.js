window.addEventListener('load', () => {
    let locationButtons = document.querySelectorAll('button[location]');
    for (let button of locationButtons) {
        button.addEventListener('click', () => {
            window.location.href = button.getAttribute('location');
        });
    }
});
