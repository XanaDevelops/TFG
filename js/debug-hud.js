AFRAME.registerComponent('debug-hud', {
    schema: {},

    init: function () {
      const oldLog = console.log;
      const el = this.el;
      // Buscar el texto y el fondo
      const textEntity = el.querySelector('#debugHudText');
      const MAX_LINES = 15;


      const myLog = (...data) => {
        oldLog(...data);
        let current = textEntity.getAttribute('text').value || '';
        let lines = current.split('\n');
        const msg = data.map(String).join(' ');
        lines.push(msg);
        if (lines.length > MAX_LINES) {
          lines = lines.slice(lines.length - MAX_LINES);
        }
        textEntity.setAttribute('text', 'value', lines.join('\n'));
      };

      console.log = myLog;
      console.log("hook ok");
    },

    update: function () {},
    remove: function () {},
    tick: function () {}
});
