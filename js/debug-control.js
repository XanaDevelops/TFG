AFRAME.registerComponent('debug-control', {
  schema: {
    debug: { type: 'boolean', default: false }
  },

  init: function () {
    this._onAButtonDown = () => {
      const isDebug = this.data.debug;
      const hud = document.querySelector('#debugHud');

      if (hud && isDebug) {
        const isVisible = hud.getAttribute('visible');
        hud.setAttribute('visible', !isVisible);
      }
    };

    this._onYButtonDown = () => {
      const sceneEl = this.el.sceneEl;

      if (sceneEl) {
        if (!sceneEl.components.screenshot) {
          sceneEl.setAttribute('screenshot', {
            width: 1920,
            height: 1080
          });
        } else {
          const screenshotComp = sceneEl.components.screenshot;
          if (screenshotComp.data.width !== 1920 || screenshotComp.data.height !== 1080) {
            screenshotComp.el.setAttribute('screenshot', {
              width: 1920,
              height: 1080
            });
          }
        }
      }

      if (sceneEl && sceneEl.components.screenshot) {
        sceneEl.components.screenshot.capture('perspective');
      }
    };

    this.el.addEventListener('abuttondown', this._onAButtonDown);
    this.el.addEventListener('ybuttondown', this._onYButtonDown);
  },

  update: function () {},

  remove: function () {
    if (this._onAButtonDown) {
      this.el.removeEventListener('abuttondown', this._onAButtonDown);
      this._onAButtonDown = null;
    }
    if (this._onYButtonDown) {
      this.el.removeEventListener('ybuttondown', this._onYButtonDown);
      this._onYButtonDown = null;
    }
  },

  tick: function (time, timeDelta) {}
});