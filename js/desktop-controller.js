AFRAME.registerComponent('desktop-controller', {
    schema: {
        
    },

    init: function () {
      this.enabled = true;
      this.grabbedEl = null;
      this.grabDistance = 0;
      this.prevAmmoType = null;
      this.cursorEl = null;
      this.lastIntersection = null;
      this._createdCursor = false;
      this._targetWorld = new THREE.Vector3();

      this.onMouseDown = () => {
        if (!this.enabled || !this.lastIntersection) return;
        const hit = this.lastIntersection;
        if (!hit) return;

        this.grabbedEl = hit.object.el;
        this.grabDistance = hit.distance;
        const ammo = this.grabbedEl.components['ammo-body'];
        if (ammo) {
          this.prevAmmoType = ammo.data.type;
          this.grabbedEl.setAttribute('ammo-body', 'type', 'kinematic');
        }
      };

      this.onRaycasterIntersection = (e) => {
        const intersections = (e.detail && e.detail.intersections) || [];
        const hit = intersections.find((i) => i.object && i.object.el && i.object.el.classList && i.object.el.classList.contains('grabbable'));
        this.lastIntersection = hit || null;
      };

      this.onRaycasterIntersectionCleared = () => {
        this.lastIntersection = null;
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

      this._ensureCursor = () => {
        const cameraEl = this.el.sceneEl.camera && this.el.sceneEl.camera.el;
        if (!cameraEl) return;
        this.cursorEl = cameraEl.querySelector('[cursor]');
        if (!this.cursorEl) {
          this.cursorEl = document.createElement('a-entity');
          this.cursorEl.setAttribute('cursor', 'rayOrigin: mouse');
          this.cursorEl.setAttribute('raycaster', 'objects: .grabbable');
          cameraEl.appendChild(this.cursorEl);
          this._createdCursor = true;
        }
      };

      this._bindEvents = () => {
        const canvas = this.el.sceneEl.canvas;
        if (!canvas) return;
        this._ensureCursor();
        if (this.cursorEl) {
          this.cursorEl.addEventListener('raycaster-intersection', this.onRaycasterIntersection);
          this.cursorEl.addEventListener('raycaster-intersection-cleared', this.onRaycasterIntersectionCleared);
        }
        canvas.addEventListener('mousedown', this.onMouseDown);
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
      }
      window.removeEventListener('mouseup', this.onMouseUp);
      if (this.el.sceneEl) {
        this.el.sceneEl.removeEventListener('enter-vr', this.onEnterVr);
        this.el.sceneEl.removeEventListener('exit-vr', this.onExitVr);
      }
      if (this.cursorEl) {
        this.cursorEl.removeEventListener('raycaster-intersection', this.onRaycasterIntersection);
        this.cursorEl.removeEventListener('raycaster-intersection-cleared', this.onRaycasterIntersectionCleared);
        if (this._createdCursor && this.cursorEl.parentNode) {
          this.cursorEl.parentNode.removeChild(this.cursorEl);
        }
      }
    },

    tick: function (time, timeDelta) {
      if (!this.enabled || !this.grabbedEl || !this.cursorEl) return;
      const raycaster = this.cursorEl.components && this.cursorEl.components.raycaster;
      if (!raycaster || !raycaster.raycaster) return;
      const ray = raycaster.raycaster.ray;
      this._targetWorld.copy(ray.origin);
      this._targetWorld.add(ray.direction.clone().multiplyScalar(this.grabDistance));
      if (this.grabbedEl.object3D.parent) {
        this.grabbedEl.object3D.parent.worldToLocal(this._targetWorld);
      }
      this.grabbedEl.object3D.position.copy(this._targetWorld);
      const ammo = this.grabbedEl.components['ammo-body'];
      if (ammo && ammo.body) ammo.syncToPhysics();
    }
});
