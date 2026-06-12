// Variante dinámica: el rigid body es `dynamic`, pero lo “pilotamos” por velocidad.
// - Sin gravedad (body.setGravity(0,0,0)).
// - Restringido al plano XZ (setLinearFactor(1,0,1)) para que los contactos no lo hundan.
// - Velocidad objetivo basada en la órbita + un pequeño término corrector hacia la trayectoria.
AFRAME.registerComponent('pid-move', {
  schema: {
    // Ganancia del “seguidor de trayectoria” (m/s por metro de error).
    followStrength: { type: 'number', default: 3 },
    // Clamp de velocidad total.
    maxLinearSpeed: { type: 'number', default: 8 },
    
    // Ganancia del seguidor de rotación (rad/s por radián de error).
    followRotationStrength: { type: 'number', default: 3 },
    // Clamp de velocidad angular total.
    maxAngularSpeed: { type: 'number', default: 6 },

    // Vectores para limitar los ejes de movimiento y rotación (por defecto permiten todos)
    linearFactor: { type: 'vec3', default: { x: 1, y: 1, z: 1 } },
    angularFactor: { type: 'vec3', default: { x: 1, y: 1, z: 1 } },
    surfaceFriction: { type: 'number', default: 0.75 },
    // Max acceleration (m/s²) applied to linear velocity each tick.
    maxAcceleration: { type: 'number', default: 20 }
  },

  init: function () {
    // Propiedades públicas modificables externamente
    this.targetPosition = new THREE.Vector3();
    this.targetSpeed = 0; // Velocidad por defecto cuando está libre de obstáculos (definida externamente)
    this.targetRotation = new THREE.Quaternion();
    this.targetAngularVelocity = new THREE.Vector3();

    this._pos = new THREE.Vector3();
    this._err = new THREE.Vector3();
    this._vel = new THREE.Vector3();
    this._prevVel = new THREE.Vector3();
    this._dv = new THREE.Vector3();

    // Historial para calcular de forma autónoma la velocidad sin obstáculos
    this._lastTargetPosition = new THREE.Vector3();
    this._hasLastTarget = false;

    this._posEndFired = false;
    this._rotEndFired = false;

    // Vectores y cuaterniones auxiliares para la rotación
    this._angVel = new THREE.Vector3();
    this._qDiff = new THREE.Quaternion();
    this._qInv = new THREE.Quaternion();
    this._axis = new THREE.Vector3();

    // btVector3 reutilizables
    this._btVel = null;
    this._btAngVel = null;
    this._btZero = null;
    this._btLinFactor = null;
    this._btAngFactor = null;

    this._initializedTargets = false;
    this._isBodyConfigured = false; // Flag para evitar doble configuración simultánea

    this._setInitialTargetsIfNeeded = () => {
      if (this._initializedTargets || !this.el.object3D) return;
      this.targetPosition.copy(this.el.object3D.position);
      this.targetRotation.copy(this.el.object3D.quaternion);
      this._lastTargetPosition.copy(this.targetPosition);
      this._initializedTargets = true;
    };

    this._configureBody = () => {
      if (this._isBodyConfigured) return; // Si ya se configuró, salimos inmediatamente

      const ammoBody = this.el.components && this.el.components['ammo-body'];
      const body = ammoBody && ammoBody.body;
      if (!body) return;

      if (typeof Ammo !== 'undefined') {
        try {
          if (!this._btVel) this._btVel = new Ammo.btVector3(0, 0, 0);
          if (!this._btAngVel) this._btAngVel = new Ammo.btVector3(0, 0, 0);
          if (!this._btZero) this._btZero = new Ammo.btVector3(0, 0, 0);
          if (!this._btLinFactor) this._btLinFactor = new Ammo.btVector3(this.data.linearFactor.x, this.data.linearFactor.y, this.data.linearFactor.z);
          if (!this._btAngFactor) this._btAngFactor = new Ammo.btVector3(this.data.angularFactor.x, this.data.angularFactor.y, this.data.angularFactor.z);
        } catch (e) {
          // Si falla la creación, degradamos: no aplicaremos estas optimizaciones.
          return;
        }
      }

      try {
        // Sin gravedad en este body.
        if (this._btZero && typeof body.setGravity === 'function') body.setGravity(this._btZero);
        // Restringir movimiento vertical.
        if (this._btLinFactor && typeof body.setLinearFactor === 'function') body.setLinearFactor(this._btLinFactor);
        // Evitar rotaciones por impactos.
        if (this._btAngFactor && typeof body.setAngularFactor === 'function') body.setAngularFactor(this._btAngFactor);
        if (this._btZero && typeof body.setAngularVelocity === 'function') body.setAngularVelocity(this._btZero);
        if (typeof body.setFriction === 'function') body.setFriction(this.data.surfaceFriction);
        if (typeof body.setRestitution === 'function') body.setRestitution(0);
        if (typeof body.activate === 'function') body.activate(true);
        
        this._isBodyConfigured = true; // Marcamos como configurado exitosamente
      } catch (e) {
        // Silencioso
      }
    };

    this._onBodyLoaded = () => {
      this._setInitialTargetsIfNeeded();
      this._configureBody();
    };

    this.el.addEventListener('body-loaded', this._onBodyLoaded);
    this._setInitialTargetsIfNeeded();

    // Si el componente 'ammo-body' ya existe y su objeto físico interno está listo,
    // intentamos configurarlo directamente protegiéndonos con la guarda interna.
    const ammoBody = this.el.components && this.el.components['ammo-body'];
    if (ammoBody && ammoBody.body) {
      this._onBodyLoaded();
    }
  },

  update: function (oldData) {
    const ammoBody = this.el.components && this.el.components['ammo-body'];
    const body = ammoBody && ammoBody.body;
    if (!body || !this._isBodyConfigured) return;

    try {
      if (this._btLinFactor && typeof body.setLinearFactor === 'function') {
        this._btLinFactor.setValue(this.data.linearFactor.x, this.data.linearFactor.y, this.data.linearFactor.z);
        body.setLinearFactor(this._btLinFactor);
      }
      if (this._btAngFactor && typeof body.setAngularFactor === 'function') {
        this._btAngFactor.setValue(this.data.angularFactor.x, this.data.angularFactor.y, this.data.angularFactor.z);
        body.setAngularFactor(this._btAngFactor);
      }
      if (typeof body.setFriction === 'function') body.setFriction(this.data.surfaceFriction);
      if (typeof body.setRestitution === 'function') body.setRestitution(0);
    } catch (e) {
      // Silencioso
    }
  },

  remove: function () {
    this.el.removeEventListener('body-loaded', this._onBodyLoaded);
    if (typeof Ammo !== 'undefined') {
      if (this._btVel) Ammo.destroy(this._btVel);
      if (this._btAngVel) Ammo.destroy(this._btAngVel);
      if (this._btZero) Ammo.destroy(this._btZero);
      if (this._btLinFactor) Ammo.destroy(this._btLinFactor);
      if (this._btAngFactor) Ammo.destroy(this._btAngFactor);
    }
    this._btVel = null;
    this._btAngVel = null;
    this._btZero = null;
    this._btLinFactor = null;
    this._btAngFactor = null;
    this._isBodyConfigured = false;

    if(!this.el.components['no-grav']){
      const ammoBody = this.el.components['ammo-body'];
      const body = ammoBody && ammoBody.body;
      if (!body) return

      const physicsSystem = this.el.sceneEl.systems.physics;
      const worldGravity = physicsSystem.driver.physicsWorld.getGravity();
      body.setGravity(worldGravity);
    }
  },

  tick: function (time, timeDelta) {
    this._setInitialTargetsIfNeeded();
    if (!this._initializedTargets || !this._isBodyConfigured) return;
    const data = this.data;
    if (!data) return;
    const ammoBody = this.el.components && this.el.components['ammo-body'];
    const body = ammoBody && ammoBody.body;
    if (!body) return;

    const dt = Math.max(0.000001, timeDelta / 1000);

    // Posición actual (para dinámicos, A-Frame suele sincronizar desde Ammo a object3D).
    this._pos.copy(this.el.object3D.position);

    // Calcular de manera autónoma la dirección del movimiento libre (feed-forward) diferenciando la posición objetivo
    this._vel.set(0, 0, 0);
    if (this._hasLastTarget) {
      this._vel.copy(this.targetPosition).sub(this._lastTargetPosition).divideScalar(dt);
      
      // Si se especificó una velocidad/rapidez por defecto, adaptamos la magnitud manteniendo la dirección limpia
      if (this.targetSpeed > 0) {
        const len = this._vel.length();
        if (len > 0) {
          this._vel.multiplyScalar(this.targetSpeed / len);
        }
      }
    }
    this._lastTargetPosition.copy(this.targetPosition);
    this._hasLastTarget = true;

    // Corrección hacia la trayectoria (control P en velocidad).
    this._err.copy(this.targetPosition).sub(this._pos);

    if (this._err.length() < 0.05) {
      if (!this._posEndFired) {
        this._posEndFired = true;
        this.el.emit('pid-move-end');
      }
    } else {
      this._posEndFired = false;
    }

    this._vel.addScaledVector(this._err, data.followStrength);

    // Clamp total
    const maxV = data.maxLinearSpeed;
    if (maxV > 0) {
      const len = this._vel.length();
      if (len > maxV) this._vel.multiplyScalar(maxV / len);
    }

    const maxAcc = data.maxAcceleration;
    if (maxAcc > 0) {
      // Límite de frenada: impide superar la velocidad desde la que podemos detenernos en la distancia restante (√2·a·d).
      // Evita rebotes cuando la aceleración máxima es baja.
      const brakingSpeed = Math.sqrt(2 * maxAcc * this._err.length());
      const speed = this._vel.length();
      if (speed > brakingSpeed) this._vel.multiplyScalar(brakingSpeed / speed);

      // Clamp de aceleración: limita el cambio de velocidad por frame para arranques suaves.
      const maxDelta = maxAcc * dt;
      this._dv.subVectors(this._vel, this._prevVel);
      if (this._dv.length() > maxDelta) this._vel.copy(this._prevVel).addScaledVector(this._dv.normalize(), maxDelta);
    }
    this._prevVel.copy(this._vel);

    // --- CÁLCULO DE VELOCIDAD ANGULAR ---
    this._qInv.copy(this.el.object3D.quaternion).invert();
    this._qDiff.copy(this.targetRotation).multiply(this._qInv);
    
    // Asegurar el camino más corto en la rotación esférica
    let qw = this._qDiff.w, qx = this._qDiff.x, qy = this._qDiff.y, qz = this._qDiff.z;
    if (qw < 0) {
      qw = -qw; qx = -qx; qy = -qy; qz = -qz;
    }
    
    const angle = 2 * Math.acos(Math.min(1, Math.max(-1, qw)));
    const sinAngle = Math.sin(angle / 2);
    if (sinAngle > 0.0001) {
      this._axis.set(qx / sinAngle, qy / sinAngle, qz / sinAngle);
    } else {
      this._axis.set(0, 0, 0);
    }

    if (angle < 0.02) {
      if (!this._rotEndFired) {
        this._rotEndFired = true;
        this.el.emit('pid-rotate-end');
      }
    } else {
      this._rotEndFired = false;
    }

    // Corrección hacia la rotación objetivo (control P en velocidad angular) + feed-forward
    this._angVel.copy(this.targetAngularVelocity);
    this._angVel.addScaledVector(this._axis, angle * data.followRotationStrength);

    // Clamp total de velocidad angular
    const maxAngV = data.maxAngularSpeed;
    if (maxAngV > 0) {
      const lenAng = this._angVel.length();
      if (lenAng > maxAngV) this._angVel.multiplyScalar(maxAngV / lenAng);
    }

    if (typeof body.setLinearVelocity !== 'function' || typeof body.setAngularVelocity !== 'function') return;

    // Aplicar velocidad al body.
    try {
      if (this._btVel && typeof this._btVel.setValue === 'function') {
        this._btVel.setValue(this._vel.x, this._vel.y, this._vel.z);
        body.setLinearVelocity(this._btVel);
      }
      if (this._btAngVel && typeof this._btAngVel.setValue === 'function') {
        this._btAngVel.setValue(this._angVel.x, this._angVel.y, this._angVel.z);
        body.setAngularVelocity(this._btAngVel);
      }
      if (typeof body.activate === 'function') body.activate(true);
    } catch (e) {
      // Silencioso
    }
  }
});