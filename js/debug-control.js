AFRAME.registerComponent('debug-control', {
    schema: { type: 'boolean', default: false},

    init: function () {
      // Do something when component first attached.
      // Handler para abuttondown: alternar visibilidad de #debugHud
        this._onAButtonDown = () => {
            const hud = document.querySelector('#debugHud');
            if (hud && this.data.debug) {
                const isVisible = hud.getAttribute('visible');
                hud.setAttribute('visible', !isVisible);
            }
        };
        this.el.addEventListener('abuttondown', this._onAButtonDown);
    },

    update: function () {
      // Do something when component's data is updated.
    },

    remove: function () {
      if (this._onAButtonDown) {
        this.el.removeEventListener('abuttondown', this._onAButtonDown);
        this._onAButtonDown = null;
      }
    },

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
    }
});
