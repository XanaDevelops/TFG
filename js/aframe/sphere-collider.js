/**
 * from a-frame/extras
 * 
 *  Based on aframe/examples/showcase/tracked-controls.
 *
 * Implement bounding sphere collision detection for entities with a mesh.
 * Sets the specified state on the intersected entities.
 *
 * @property {string} objects - Selector of the entities to test for collision.
 * @property {string} state - State to set on collided entities.
 *
 */
AFRAME.registerComponent('sphere-collider', {
  schema: {
    enabled: {default: true},
    interval: {default: 80},
    objects: {default: ''},
    state: {default: 'collided'},
    radius: {default: 0.05},
    watch: {default: true}
  },

  init: function () {
    /** @type {MutationObserver} */
    this.observer = null;
    /** @type {Array<Element>} Elements to watch for collisions. */
    this.els = [];
    /** @type {Array<Element>} Elements currently in collision state. */
    this.collisions = [];
    this.prevCheckTime = undefined;

    this.eventDetail = {};
    this.handleHit = this.handleHit.bind(this);
    this.handleHitEnd = this.handleHitEnd.bind(this);

    // Debug visuals: group, helpers map, and materials
    this._debug = {
      group: new THREE.Group(),
      helpers: new Map(), // Map<Element, {line, boxGeom, wireGeom}>
      sphere: null,
      materials: {
        wire: new THREE.LineBasicMaterial({ color: 0xFFFF00 }), // amarillo
        green: new THREE.MeshBasicMaterial({ color: 0x00FF00, transparent: true, opacity: 0.25 }), // translúcido verde
        yellowTranslucent: new THREE.MeshBasicMaterial({ color: 0xFFFF00, transparent: true, opacity: 0.25 })
      }
    };
  },

  play: function () {
    const sceneEl = this.el.sceneEl;

    if (this.data.watch) {
      this.observer = new MutationObserver(this.update.bind(this, null));
      this.observer.observe(sceneEl, {childList: true, subtree: true});
    }

    // Add debug group to scene so helpers are visible
    if (this._debug && sceneEl && sceneEl.object3D) {
      sceneEl.object3D.add(this._debug.group);
    }
  },

  pause: function () {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Remove debug group from scene
    if (this._debug && this.el && this.el.sceneEl && this._debug.group) {
      this.el.sceneEl.object3D.remove(this._debug.group);
    }
  },

  /**
   * Update list of entities to test for collision.
   */
  update: function () {
    const data = this.data;
    let objectEls;

    // Push entities into list of els to intersect.
    if (data.objects) {
      objectEls = this.el.sceneEl.querySelectorAll(data.objects);
    } else {
      // If objects not defined, intersect with everything.
      objectEls = this.el.sceneEl.children;
    }
    // Convert from NodeList to Array
    this.els = Array.prototype.slice.call(objectEls);
  },

  tick: (function () {
    const position = new THREE.Vector3(),
        meshPosition = new THREE.Vector3(),
        colliderScale = new THREE.Vector3(),
        size = new THREE.Vector3(),
        box = new THREE.Box3(),
        collisions = [],
        distanceMap = new Map();
    return function (time) {
      if (!this.data.enabled) { return; }

      // Only check for intersection if interval time has passed.
      const prevCheckTime = this.prevCheckTime;
      if (prevCheckTime && (time - prevCheckTime < this.data.interval)) { return; }
      // Update check time.
      this.prevCheckTime = time;

      const el = this.el,
          data = this.data,
          mesh = el.getObject3D('mesh');
      let colliderRadius;

      if (!mesh) { return; }

      collisions.length = 0;
      distanceMap.clear();
      el.object3D.getWorldPosition(position);
      el.object3D.getWorldScale(colliderScale);
      colliderRadius = data.radius * scaleFactor(colliderScale);
      // --- Debug: update own collider sphere (translucent green)
      if (this._debug) {
        const dbg = this._debug;
        if (!dbg.sphere) {
          const sphereGeom = new THREE.SphereGeometry(1, 16, 12);
          const sphereMesh = new THREE.Mesh(sphereGeom, dbg.materials.green);
          dbg.sphere = sphereMesh;
          dbg.group.add(dbg.sphere);
        }
        dbg.sphere.position.copy(position);
        dbg.sphere.scale.setScalar(colliderRadius);
      }
      // Update collision list.
      const self = this;
      this.els.forEach(intersect);

      // Emit events and add collision states, in order of distance.
      collisions
        .sort((a, b) => distanceMap.get(a) > distanceMap.get(b) ? 1 : -1)
        .forEach(this.handleHit);

      // Remove collision state from other elements.
      this.collisions
        .filter((el) => !distanceMap.has(el))
        .forEach(this.handleHitEnd);

      // Store new collisions
      copyArray(this.collisions, collisions);

      // Bounding sphere collision detection
      function intersect (el) {
        let radius, mesh, distance, extent;

        if (!el.isEntity) { return; }

        mesh = el.getObject3D('mesh');

        if (!mesh) { return; }

        box.setFromObject(mesh).getSize(size);
        extent = Math.max(size.x, size.y, size.z) / 2;
        radius = Math.sqrt(2 * extent * extent);
        box.getCenter(meshPosition);

        // --- Debug: update or create yellow wireframe box and translucent radius sphere for this entity
        if (self._debug) {
          const dbg = self._debug;
          let helper = dbg.helpers.get(el);
          if (!helper) {
            const boxGeom = new THREE.BoxGeometry(1, 1, 1);
            const wireGeom = new THREE.WireframeGeometry(boxGeom);
            const lines = new THREE.LineSegments(wireGeom, dbg.materials.wire);
            const sphereGeom = new THREE.SphereGeometry(1, 12, 10);
            const radiusSphere = new THREE.Mesh(sphereGeom, dbg.materials.yellowTranslucent);
            helper = { lines: lines, boxGeom: boxGeom, wireGeom: wireGeom, sphere: radiusSphere, sphereGeom: sphereGeom };
            dbg.helpers.set(el, helper);
            dbg.group.add(helper.lines);
            dbg.group.add(helper.sphere);
          }
          // Position and scale the wireframe to match the Box3
          helper.lines.position.copy(meshPosition);
          helper.lines.scale.set(size.x, size.y, size.z);
          // Position and scale the translucent sphere to represent computed radius
          helper.sphere.position.copy(meshPosition);
          helper.sphere.scale.setScalar(radius);
        }

        if (!radius) { return; }

        distance = position.distanceTo(meshPosition);
        if (distance < radius + colliderRadius) {
          collisions.push(el);
          distanceMap.set(el, distance);
        }
      }
      // Cleanup debug helpers for removed entities
      if (this._debug) {
        const dbg = this._debug;
        // Remove helpers for elements not currently in this.els
        dbg.helpers.forEach((helper, keyEl) => {
          if (this.els.indexOf(keyEl) === -1) {
            if (helper.lines && helper.lines.parent) { helper.lines.parent.remove(helper.lines); }
            if (helper.sphere && helper.sphere.parent) { helper.sphere.parent.remove(helper.sphere); }
            dbg.helpers.delete(keyEl);
          }
        });
      }
      // use max of scale factors to maintain bounding sphere collision
      function scaleFactor (scaleVec) {
        return Math.max(scaleVec.x, scaleVec.y, scaleVec.z);
      }
    };
  })(),

  handleHit: function (targetEl) {
    targetEl.emit('hit');
    targetEl.addState(this.data.state);
    this.eventDetail.el = targetEl;
    this.el.emit('hit', this.eventDetail);
  },
  handleHitEnd: function (targetEl) {
    targetEl.emit('hitend');
    targetEl.removeState(this.data.state);
    this.eventDetail.el = targetEl;
    this.el.emit('hitend', this.eventDetail);
  }
});

function copyArray (dest, source) {
  dest.length = 0;
  for (let i = 0; i < source.length; i++) { dest[i] = source[i]; }
}
