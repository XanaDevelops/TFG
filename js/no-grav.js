AFRAME.registerComponent('no-grav', {
    schema: {
  linearDamping: { type: 'number', default: 0.95 },
  angularDamping: { type: 'number', default: 0.5 }
    },

    configureNoGrav: function () {
        var ammoBody = this.el.components['ammo-body'];
        if (!ammoBody || !ammoBody.body) return;

        var zero = new Ammo.btVector3(0, 0, 0);
        ammoBody.body.setGravity(zero);
        ammoBody.body.setLinearVelocity(zero);
        ammoBody.body.setAngularVelocity(zero);
        ammoBody.body.setDamping(this.data.linearDamping, this.data.angularDamping);
        ammoBody.body.activate(true);
        Ammo.destroy(zero);
    },

    init: function () {
      this.el.addEventListener('body-fixed', () => {
        this.configureNoGrav();
      });
    },

    // mirar de no depender de esto...
    update: function () {
      //this.configureNoGrav();
    },

    remove: function () {
    },

    tick: function (time, timeDelta) {
    }
});
