AFRAME.registerComponent('projector-platform', {
    schema: {
        
    },

    init: function () {
      // Do something when component first attached.

      this.restPos = new THREE.Vector3(0, 1.20, 0)
      this.placePos = new THREE.Vector3(-1, 1.2, 0.5)
      
      this.isInRest = true

      this.el.setAttribute('pid-move', {
        followStrength: 30, //compensar peso
        angularFactor: {x: 0, y:1, z:0},
        maxLinearSpeed: 1,
        maxAcceleration: 0.2 * 10,
        surfaceFriction: 10000
      })

      this.pid = this.el.components['pid-move']
      console.log(this.pid);
      
      this.togglePos = () => {
        this.isInRest = !this.isInRest
        console.log(this.isInRest)
        if (this.isInRest){
          this.pid.targetPosition.copy(this.restPos)
        }
        else {
          this.pid.targetPosition.copy(this.placePos)
        }
      }

      this.el.addEventListener('toggle-position', this.togglePos)
    },

    update: function () {
      // Do something when component's data is updated.
    },

    remove: function () {
      // Do something the component or its entity is detached.
      this.el.removeEventListener('toggle-position', this.togglePos)
    },

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
    }
});
