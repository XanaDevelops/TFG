AFRAME.registerComponent('desktop-controller', {
    schema: {
        
    },

    init: function () {
      this.enabled = true;
      this.grabbedEl = null;
      this.grabDistance = 0;
      this.prevAmmoType = null;
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      this.onMouseDown = (e) => {
        if (!this.enabled || !this.el.sceneEl.camera) return;
        this._setMouseFromEvent(e);
        this.raycaster.setFromCamera(this.mouse, this.el.sceneEl.camera);
        const hits = this.raycaster.intersectObjects(this.el.sceneEl.object3D.children, true);
        const hit = hits.find((h) => h.object && h.object.el && h.object.el.classList && h.object.el.classList.contains('grabbable'));
        if (!hit) return;

        this.grabbedEl = hit.object.el;
        this.grabDistance = hit.distance;
        const ammo = this.grabbedEl.components['ammo-body'];
        if (ammo) {
          this.prevAmmoType = ammo.data.type;
          this.grabbedEl.setAttribute('ammo-body', 'type', 'kinematic');
        }
      };

      this.onMouseMove = (e) => {
        if (!this.enabled || !this.grabbedEl || !this.el.sceneEl.camera) return;
        this._setMouseFromEvent(e);
        this.raycaster.setFromCamera(this.mouse, this.el.sceneEl.camera);
        const targetWorld = new THREE.Vector3();
        targetWorld.copy(this.raycaster.ray.origin);
        targetWorld.add(this.raycaster.ray.direction.clone().multiplyScalar(this.grabDistance));
        if (this.grabbedEl.object3D.parent) {
          this.grabbedEl.object3D.parent.worldToLocal(targetWorld);
        }
        this.grabbedEl.object3D.position.copy(targetWorld);
        const ammo = this.grabbedEl.components['ammo-body'];
        if (ammo && ammo.body) ammo.syncToPhysics();
      };

      this.onMouseUp = () => {
        if (!this.grabbedEl) return;
        const ammo = this.grabbedEl.components['ammo-body'];
        if (ammo) {
          this.grabbedEl.setAttribute('ammo-body', 'type', this.prevAmmoType || 'dynamic');
        }
        this.grabbedEl = null;
        this.prevAmmoType = null;
      };

      this.onEnterVr = () => {
        this.enabled = false;
        this.onMouseUp();
      };

      this.onExitVr = () => {
        this.enabled = true;
      };

      this._setMouseFromEvent = (e) => {
        const canvas = this.el.sceneEl.canvas;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      };

      this._bindEvents = () => {
        const canvas = this.el.sceneEl.canvas;
        if (!canvas) return;
        canvas.addEventListener('mousedown', this.onMouseDown);
        canvas.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
        this.el.sceneEl.addEventListener('enter-vr', this.onEnterVr);
        this.el.sceneEl.addEventListener('exit-vr', this.onExitVr);
      };

      if (this.el.sceneEl.hasLoaded) {
        this._bindEvents();
      } else {
        this.el.sceneEl.addEventListener('loaded', this._bindEvents);
      }
    },

    update: function () {
      // Do something when component's data is updated.
    },

    remove: function () {
      const canvas = this.el.sceneEl && this.el.sceneEl.canvas;
      if (canvas) {
        canvas.removeEventListener('mousedown', this.onMouseDown);
        canvas.removeEventListener('mousemove', this.onMouseMove);
      }
      window.removeEventListener('mouseup', this.onMouseUp);
      if (this.el.sceneEl) {
        this.el.sceneEl.removeEventListener('enter-vr', this.onEnterVr);
        this.el.sceneEl.removeEventListener('exit-vr', this.onExitVr);
      }
    },

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
    }
});
