AFRAME.registerComponent('online-scene', {
    schema: {

    },

    init: function () {
        // Crea una nueva conexión.
        const socket = new WebSocket("ws://localhost:5050");
        this.socket = socket

        // Abre la conexión
        this._onOpen = function (e) {
            //socket.send("Hello Server!");
            let event = { type: "login", username: "prueba"}
            socket.send(JSON.stringify(event))
            event = {type: "echo", message: "hola, que tal"}
            socket.send(JSON.stringify(event))
        };
        this.socket.addEventListener("open", this._onOpen);

        // Escucha por mensajes
        this._onMessage = function (event) {
            console.log("Message from server", JSON.parse(event.data));
        };
        this.socket.addEventListener("message", this._onMessage);
    },

    update: function () {
        // Do something when component's data is updated.
    },

    remove: function () {
        if (this.socket) {
            if (this._onOpen) this.socket.removeEventListener("open", this._onOpen);
            if (this._onMessage) this.socket.removeEventListener("message", this._onMessage);
            try { this.socket.close(); } catch (e) {}
        }
        this._onOpen = null;
        this._onMessage = null;
        this.socket = null;
    },

    tick: function (time, timeDelta) {
        // Do something on every scene tick or frame.
    }
});
