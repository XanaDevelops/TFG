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
      x: 0, y: 0, z: 0
    })

    this.el.setAttribute('pid-move', {
      followStrength: 30, //compensar peso
      angularFactor: { x: 0, y: 1, z: 0 },
      maxLinearSpeed: 1,
      maxAcceleration: 0.2 * 10,
      surfaceFriction: 10000
    })


    this.detector = document.createElement('a-cylinder')
    this.el.appendChild(this.detector)
    this.detector.id = "platDetector"
    this.detector.setAttribute('scale', { x: 1, y: 8, z: 1 })
    this.detector.setAttribute("position", { x: 0, y: 4.47833, z: 0 })
    this.detector.setAttribute("obb-collider", {})
    this.detector.setAttribute('visible', false)


    this.pid = this.el.components['pid-move']
    console.log(this.pid);

    this.togglePos = () => {
      this.isInRest = !this.isInRest
      console.log(this.isInRest)
      if (this.isInRest) {
        this.el.setAttribute('pid-move', {linearFactor: {x:0, y:0, z:0}})
        this.recolocate().then(() => {
          this.el.setAttribute('pid-move', {linearFactor: {x:1, y:1, z:1}})

          this.pid.targetPosition.copy(this.restPos)
        })
      } else {
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
      let hitEl = e.detail && e.detail.withEl

      if (!this.detectedEl) {
        this.detectedEl = hitEl
      }
      console.log("[platform]: entrado: ", hitEl);
    }

    this.exitEl = (e) => {
      let hitEl = e.detail && e.detail.withEl

      console.log("[platform]: salir: ", hitEl);
      if (this.detectedEl == hitEl) {
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
    return new Promise((resolve) => {
      if (!this.detectedEl) {
        resolve();
        return;
      }
      console.log("[projector-platform]: recolocating: ", this.detectedEl);
      this.el.setAttribute('ammo-body', { collisionFilterGroup: 4, collisionFilterMask: 4 })
      const worldPos = new THREE.Vector3();
      this.detectedEl.object3D.getWorldPosition(worldPos);

      const obbSize = new THREE.Vector3()
      this.detectedEl.components['obb-collider'].obb.getSize(obbSize)

      const targetWorldPos = new THREE.Vector3(this.placePos.x, worldPos.y + (obbSize.y * 0.5) + 0, this.placePos.z)
      const targetLocalPos = targetWorldPos.clone();
      if (this.detectedEl.object3D.parent) {
        this.detectedEl.object3D.parent.worldToLocal(targetLocalPos);
      }

      const parentWorldQuat = new THREE.Quaternion();
      if (this.detectedEl.object3D.parent) {
        this.detectedEl.object3D.parent.getWorldQuaternion(parentWorldQuat);
      }
      const targetLocalQuat = parentWorldQuat.invert();

      if (!this.detectedEl.components['pid-move']) {
        this.detectedEl.setAttribute('pid-move', '');
      }

      const pid = this.detectedEl.components['pid-move'];
      pid.targetPosition.copy(targetLocalPos);
      pid.targetRotation.copy(targetLocalQuat);

      let poseDone = false;
      let rotDone = false;


      const ending = () => {
        this.detectedEl.removeAttribute('pid-move');
        this.el.setAttribute('ammo-body', { collisionFilterGroup: 1, collisionFilterMask: 1 })

        setTimeout(() => {
          resolve()
        }, 1000)
      }

      const onPosEnd = () => {
        poseDone = true;
        console.log("poseEnd")
        if (rotDone) {
          ending()
        }
      };
      const onRotEnd = () => {
        rotDone = true;
        console.log("rotEnd");

        if (poseDone) {
          ending()
        }
      };

      this.detectedEl.addEventListener('pid-move-end', onPosEnd, { once: true });
      this.detectedEl.addEventListener('pid-rotate-end', onRotEnd, { once: true });
    });
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