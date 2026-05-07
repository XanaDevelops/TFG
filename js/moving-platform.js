// Variante dinámica: el rigid body es `dynamic`, pero lo “pilotamos” por velocidad.
// - Sin gravedad (body.setGravity(0,0,0)).
// - Restringido al plano XZ (setLinearFactor(1,0,1)) para que los contactos no lo hundan.
// - Velocidad objetivo basada en la órbita + un pequeño término corrector hacia la trayectoria.
AFRAME.registerComponent('moving-platform-dynamic-velocity', {
  schema: {
    radius: { type: 'number', default: 1 },
    speed: { type: 'number', default: 1 },
    // Ganancia del “seguidor de trayectoria” (m/s por metro de error).
    followStrength: { type: 'number', default: 3 },
    // Clamp de velocidad total.
    maxLinearSpeed: { type: 'number', default: 10 }
  },

  init: function () {
    this._angle = 0;
    this._center = null;

    this._desired = new THREE.Vector3();
    this._pos = new THREE.Vector3();
    this._err = new THREE.Vector3();
    this._vel = new THREE.Vector3();

    // btVector3 reutilizables
    this._btVel = null;
    this._btZero = null;
    this._btLinFactor = null;

    this._setCenterIfNeeded = () => {
      if (this._center) return;
      this._center = this.el.object3D.position.clone();
    };

    this._configureBody = () => {
      const ammoBody = this.el.components && this.el.components['ammo-body'];
      const body = ammoBody && ammoBody.body;
      if (!body) return;

      if (typeof Ammo !== 'undefined') {
        try {
          if (!this._btVel) this._btVel = new Ammo.btVector3(0, 0, 0);
          if (!this._btZero) this._btZero = new Ammo.btVector3(0, 0, 0);
          if (!this._btLinFactor) this._btLinFactor = new Ammo.btVector3(1, 0, 1);
        } catch (e) {
          // Si falla la creación, degradamos: no aplicaremos estas optimizaciones.
        }
      }

      try {
        // Sin gravedad en este body.
        if (this._btZero && typeof body.setGravity === 'function') body.setGravity(this._btZero);
        // Restringir movimiento vertical.
        if (this._btLinFactor && typeof body.setLinearFactor === 'function') body.setLinearFactor(this._btLinFactor);
        // Evitar rotaciones por impactos.
        if (this._btZero && typeof body.setAngularFactor === 'function') body.setAngularFactor(this._btZero);
        if (this._btZero && typeof body.setAngularVelocity === 'function') body.setAngularVelocity(this._btZero);
        if (typeof body.activate === 'function') body.activate(true);
      } catch (e) {
        // Silencioso
      }
    };

    this._onBodyLoaded = () => {
      this._setCenterIfNeeded();
      this._configureBody();
    };

    this.el.addEventListener('body-loaded', this._onBodyLoaded);
    this._setCenterIfNeeded();
  },

  remove: function () {
    this.el.removeEventListener('body-loaded', this._onBodyLoaded);
    if (typeof Ammo !== 'undefined') {
      if (this._btVel) Ammo.destroy(this._btVel);
      if (this._btZero) Ammo.destroy(this._btZero);
      if (this._btLinFactor) Ammo.destroy(this._btLinFactor);
    }
    this._btVel = null;
    this._btZero = null;
    this._btLinFactor = null;
  },

  tick: function (time, timeDelta) {
    if (!this._center) return;

    const dt = Math.max(0.000001, timeDelta / 1000);

    const omega = this.data.speed;
    this._angle += omega * dt;

    // Punto objetivo en la órbita (mismo Y que el centro).
    const cosA = Math.cos(this._angle);
    const sinA = Math.sin(this._angle);
    this._desired.set(
      this._center.x + cosA * this.data.radius,
      this._center.y,
      this._center.z + sinA * this.data.radius
    );

    // Posición actual (para dinámicos, A-Frame suele sincronizar desde Ammo a object3D).
    this._pos.copy(this.el.object3D.position);

    // Velocidad tangencial ideal: v = r * ω, dirección tangente.
    // Derivada de (cos, sin): (-sin, cos)
    const vTanX = -sinA * this.data.radius * omega;
    const vTanZ =  cosA * this.data.radius * omega;

    // Corrección hacia la trayectoria (control P en velocidad).
    this._err.copy(this._desired).sub(this._pos);
    this._vel.set(vTanX, 0, vTanZ);
    this._vel.addScaledVector(this._err, this.data.followStrength);

    // Clamp total
    const maxV = this.data.maxLinearSpeed;
    if (maxV > 0) {
      const len = this._vel.length();
      if (len > maxV) this._vel.multiplyScalar(maxV / len);
    }

    const ammoBody = this.el.components && this.el.components['ammo-body'];
    const body = ammoBody && ammoBody.body;
    if (!body || typeof body.setLinearVelocity !== 'function') return;

    // Aplicar velocidad al body.
    try {
      if (this._btVel && typeof this._btVel.setValue === 'function') {
        this._btVel.setValue(this._vel.x, this._vel.y, this._vel.z);
        body.setLinearVelocity(this._btVel);
        if (typeof body.activate === 'function') body.activate(true);
      }
    } catch (e) {
      // Silencioso
    }
  }
});
