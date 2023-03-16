window.addEventListener('load', async () => {
    const { generateAuthroizationHeader } = window.Authorization;

    let clips = await (
        await fetch('/api/clips', { headers: generateAuthroizationHeader() })
    ).json();

    for (let clip of clips) {
        let clipBlob = await (
            await fetch('/clips/' + clip, { headers: generateAuthroizationHeader() })
        ).blob();
        let clipURL = URL.createObjectURL(clipBlob);
        let clipElement = document.createElement('video');
        clipElement.setAttribute('controls', true);
        clipElement.src = clipURL;
        document.body.appendChild(clipElement);
    }
});
