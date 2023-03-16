window.addEventListener('load', () => {
    const { getAuthorization } = window.Authorization;

    const socket = io();

    socket.on('connect', () => {
        socket.emit('authenticate', getAuthorization());
    });

    socket.once('authenticated', () => {
        console.log('authed');
        socket.emit('getCameras');
    });

    socket.on('cameras', (cameraList) => {
        console.log('got cameras');
        for (let camera of cameraList) {
            console.log(camera);
            socket.emit('subscribeCamera', camera);
        }
    });

    socket.on('cameraFrame', (cameraNumber, data, width, height) => {
        console.log('got frame');
        let cameraCanvas = document.getElementById(cameraNumber);
        if (!cameraCanvas) {
            cameraCanvas = document.createElement('canvas');
            cameraCanvas.style = `width:${width}px;height:${height}px;`;
            cameraCanvas.setAttribute('id', cameraNumber);
            cameraCanvas.width = width;
            cameraCanvas.height = height;
            document.body.appendChild(cameraCanvas);
        }

        const ctx = cameraCanvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        ctx.putImageData(new ImageData(new Uint8ClampedArray(data), width, height), 0, 0);
    });
});
