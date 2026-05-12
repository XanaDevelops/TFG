AFRAME.registerComponent('debug-hud', {
    schema: {},

    init: function () {
      this._origLog = console.log;
      const el = this.el;
      // Buscar el texto y el fondo
      const textEntity = el.querySelector('#debugHudText');
      const MAX_LINES = 15;


      this._logFn = (...data) => {
        this._origLog(...data);
        let current = textEntity.getAttribute('text').value || '';
        let lines = current.split('\n');
        const msg = data.map(String).join(' ');
        lines.push(msg);
        if (lines.length > MAX_LINES) {
          lines = lines.slice(lines.length - MAX_LINES);
        }
        textEntity.setAttribute('text', 'value', lines.join('\n'));
      };

      console.log = this._logFn;
      console.log("hook ok");
    },

    update: function () {},
    remove: function () {
      if (this._origLog && console.log === this._logFn) {
        console.log = this._origLog;
      }
      this._origLog = null;
      this._logFn = null;
    },
    tick: function () {}
});
