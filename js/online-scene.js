AFRAME.registerComponent('online-scene', {
    schema: {

    },

    init: function () {
        // Crea una nueva conexión.
        const socket = new WebSocket("ws://localhost:5050");

        // Abre la conexión
        socket.addEventListener("open", function (event) {
            socket.send("Hello Server!");
        });

        // Escucha por mensajes
        socket.addEventListener("message", function (event) {
            console.log("Message from server", event.data);
        });
    },

    update: function () {
        // Do something when component's data is updated.
    },

    remove: function () {
        // Do something the component or its entity is detached.
    },

    tick: function (time, timeDelta) {
        // Do something on every scene tick or frame.
    }
});
