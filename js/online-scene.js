AFRAME.registerComponent('online-scene', {
    schema: {

    },

    init: function () {
        // Crea una nueva conexión.
        const socket = new WebSocket("ws://localhost:5050");
        this.socket = socket

        // Abre la conexión
        this.socket.addEventListener("open", function (e) {
            //socket.send("Hello Server!");
            let event = { type: "login", username: "prueba"}
            socket.send(JSON.stringify(event))
            event = {type: "echo", message: "hola, que tal"}
            socket.send(JSON.stringify(event))
        });

        // Escucha por mensajes
        this.socket.addEventListener("message", function (event) {
            console.log("Message from server", JSON.parse(event.data));
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
