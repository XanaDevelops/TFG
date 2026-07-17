AFRAME.registerComponent('projector-platform', {
  schema: {},

  init: function () {
    this.restPos = new THREE.Vector3(0, 1.1, 0)
    this.placePos = new THREE.Vector3(-1.54, 1.1, -0.3)

    this.rot = new THREE.Euler(0, 0, 0, 'XYZ')
    this.quaternion = new THREE.Quaternion()

    this.isInRest = true
    this.detectedEl = null
    this.activeConstraintId = null

    this.el.setAttribute('rotation', { x: 0, y: 0, z: 0 })

    this.el.setAttribute('pid-move', {
      followStrength: 30,
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

    this.togglePos = () => {
      this.isInRest = !this.isInRest
      if (this.isInRest) {
        this.el.setAttribute('pid-move', {linearFactor: {x:0, y:0, z:0}})
        this.recolocate(this.placePos).then(() => {
          this.el.setAttribute('pid-move', {linearFactor: {x:1, y:1, z:1}})
          this.pid.targetPosition.copy(this.restPos)
        })
      } else {
        this.delConstraint()  
        this.pid.targetPosition.copy(this.placePos)
      }
    }

    this.rotate = (e) => {
      let rotVal = THREE.MathUtils.degToRad(e.detail)
      this.rot.y += rotVal
      this.quaternion.setFromEuler(this.rot)
      this.pid.targetRotation.copy(this.quaternion)
    }

    this.enterEnt = (e) => {
      let hitEl = e.detail && e.detail.withEl

      if(this.filterEl(hitEl)) return

      if (!this.detectedEl) {
        this.detectedEl = hitEl
        let meshID = this.detectedEl.getAttribute('figure-id') || this.detectedEl.id.replace('e', '').replace('Forat', 'forat')
        this.el.emit('figure-detected', { meshID: meshID }, true)
      }
    }

    this.exitEl = (e) => {
      let hitEl = e.detail && e.detail.withEl

      if(this.filterEl(hitEl)) return

      if (this.detectedEl == hitEl) {
        this.delConstraint()
      }
      this.el.emit('figure-detected', { meshID: null }, true)
      this.detectedEl = null;


    }

    this.el.addEventListener('toggle-position', this.togglePos)
    this.el.addEventListener('rotate-platform', this.rotate)

    this.detector.addEventListener("obbcollisionstarted", this.enterEnt)
    this.detector.addEventListener("obbcollisionended", this.exitEl)

    this.togglePos()
  },

  filterEl: function(hitEl) {
    return !hitEl.classList.contains("grabbable")
  },

  setConstraint: function () {
    if (!this.detectedEl || this.activeConstraintId) return;

    this.activeConstraintId = 'ammo-constraint__' + Math.random().toString(36).substr(2, 9);

    this.detectedEl.setAttribute(this.activeConstraintId, {
      target: '#' + this.el.id,
      type: 'lock'
    });

    if (!this.detectedEl.components['log-spatial']) {
      this.detectedEl.setAttribute('log-spatial', { mode: 'delta' });
    }

    if (this.detectedEl.components['ammo-body']) {
      this.detectedEl.setAttribute('ammo-body', 'activationState', 'disableDeactivation');
    }
  },

  delConstraint: function () {
    if (!this.detectedEl || !this.activeConstraintId) return;

    this.detectedEl.removeAttribute(this.activeConstraintId);

    if (this.detectedEl.components['log-spatial']) {
      this.detectedEl.removeAttribute('log-spatial');
    }

    this.detectedEl = null;
    this.activeConstraintId = null;
    
    //this.el.emit('figure-detected', { meshID: null }, true);
  },

  recolocate: function (target) {
    return new Promise((resolve) => {
      if (!this.detectedEl) {
        resolve();
        return;
      }
      
      const worldPos = new THREE.Vector3();
      this.detectedEl.object3D.getWorldPosition(worldPos);

      const obbSize = new THREE.Vector3()
      this.detectedEl.components['obb-collider'].obb.getSize(obbSize)

      const targetWorldPos = new THREE.Vector3(target.x, worldPos.y + (obbSize.y * 0.4 * 1) + 0.0, target.z)
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
        this.setConstraint();

        setTimeout(() => {
          if (this.detectedEl) {
            this.el.emit('reset-detected-figure')
          }
          resolve()
        }, 1000)
      }

      const onPosEnd = () => {
        poseDone = true;
        if (rotDone) {
          ending()
        }
      };
      
      const onRotEnd = () => {
        rotDone = true;
        if (poseDone) {
          ending()
        }
      };

      this.detectedEl.addEventListener('pid-move-end', onPosEnd, { once: true });
      this.detectedEl.addEventListener('pid-rotate-end', onRotEnd, { once: true });
    });
  },

  update: function () {},

  remove: function () {
    this.delConstraint()
    this.el.removeEventListener('toggle-position', this.togglePos)
    this.el.removeEventListener('rotate-platform', this.rotate)
  },

  tick: function (time, timeDelta) {}
});