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
      this._onBodyFixed = () => {
        this.configureNoGrav();
      };
      this.el.addEventListener('body-fixed', this._onBodyFixed);
    },

    // mirar de no depender de esto...
    update: function () {
      //this.configureNoGrav();
    },

    remove: function () {
      if (this._onBodyFixed) {
        this.el.removeEventListener('body-fixed', this._onBodyFixed);
        this._onBodyFixed = null;
      }
    },

    tick: function (time, timeDelta) {
    }
});
