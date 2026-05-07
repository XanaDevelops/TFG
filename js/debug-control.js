AFRAME.registerComponent('debug-control', {
    schema: { type: 'boolean', default: false},

    init: function () {
      // Do something when component first attached.
      // Handler para abuttondown: alternar visibilidad de #debugHud
        this.el.addEventListener('abuttondown', () => {
            const hud = document.querySelector('#debugHud');
            if (hud && this.data.debug) {
                const isVisible = hud.getAttribute('visible');
                hud.setAttribute('visible', !isVisible);
            }
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
