AFRAME.registerComponent('projector-platform', {
    schema: {
        
    },

    init: function () {
      // Do something when component first attached.

      this.restPos = new THREE.Vector3(0, 1.20, 0)
      this.placePos = new THREE.Vector3(-1, 1.2, 0.5)
      
      this.rot = new THREE.Euler(0, 0, 0, 'XYZ') //en radianes
      this.quaternion = new THREE.Quaternion()

      this.isInRest = true

      this.detectedEl = null

      this.el.setAttribute('rotation', {
        x: 0, y:0, z:0
      })

      this.el.setAttribute('pid-move', {
        followStrength: 30, //compensar peso
        angularFactor: {x: 0, y:1, z:0},
        maxLinearSpeed: 1,
        maxAcceleration: 0.2 * 10,
        surfaceFriction: 10000
      })


      this.detector = document.createElement('a-cylinder')
      this.el.appendChild(this.detector)
      this.detector.id = "platDetector"
      this.detector.setAttribute('scale', {x:1,  y: 8,  z: 1})
      this.detector.setAttribute("position", {x: 0, y: 4.47833, z: 0})
      this.detector.setAttribute("obb-collider", {})
      this.detector.setAttribute('visible', false)
      

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

      this.rotate = (e) => {
        let rotVal = THREE.MathUtils.degToRad(e.detail)
        console.log("rot (radians): ", rotVal);
        this.rot.y += rotVal
        this.quaternion.setFromEuler(this.rot)
        this.pid.targetRotation.copy(this.quaternion)
      }

      this.enterEnt = (e) => {
        let hitEl = e.detail

        if(!this.detectedEl){
          this.detectedEl = hitEl
        }
        console.log("[platform]: entrado: ", hitEl);
      }

      this.exitEl = (e) => {
        let hitEl = e.detail

        console.log("[platform]: salir: ", hitEl);
        if(this.detectedEl == hitEl){
          this.detectedEl = null
        }
      }

      this.el.addEventListener('toggle-position', this.togglePos)
      this.el.addEventListener('rotate-platform', this.rotate)

      this.detector.addEventListener("obbcollisionstarted", this.enterEnt)
      this.detector.addEventListener("obbcollisionended", this.exitEl)
    },

    // coloca en posicion al mover
    recolocate: function () {
        if(!this.detectedEl){
          return
        }

        
    },

    update: function () {
      // Do something when component's data is updated.
    },

    remove: function () {
      // Do something the component or its entity is detached.
      this.el.removeEventListener('toggle-position', this.togglePos)
      this.el.removeEventListener('rotate-platform', this.rotate)
    },

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
    }
});
