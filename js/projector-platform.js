AFRAME.registerComponent('projector-platform', {
    schema: {
        
    },

    init: function () {
      // Do something when component first attached.

      this.el.setAttribute('pid-move', {
        followStrength: 30, //compensar peso
        angularFactor: {x: 0, y:1, z:0}
      })
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
