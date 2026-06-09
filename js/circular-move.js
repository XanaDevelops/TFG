AFRAME.registerComponent('circular-move', {
  schema: {
    radius: { type: 'number', default: 1 },
    speed: { type: 'number', default: 0.6 }
  },

  init: function () {
    // Inyectar automáticamente el componente pid-move si no está presente
    if (!this.el.components['pid-move']) {
      this.el.setAttribute('pid-move', {});
    }

    // Adaptar pid-move para mantener la lógica original (plano XZ y rotaciones bloqueadas) si conserva los valores por defecto (permitir todo)
    const pidComponent = this.el.components['pid-move'];
    if (pidComponent.data.linearFactor.x === 1 && pidComponent.data.linearFactor.y === 1 && pidComponent.data.linearFactor.z === 1) {
      this.el.setAttribute('pid-move', 'linearFactor', { x: 1, y: 0, z: 1 });
    }
    if (pidComponent.data.angularFactor.x === 1 && pidComponent.data.angularFactor.y === 1 && pidComponent.data.angularFactor.z === 1) {
      this.el.setAttribute('pid-move', 'angularFactor', { x: 0, y: 0, z: 0 });
    }

    this._angle = 0;
    this._center = null;
    this._desired = new THREE.Vector3();
    this._speedDefined = false;

    this._setCenterIfNeeded = () => {
      if (this._center) return;
      this._center = this.el.object3D.position.clone();
    };

    this._setCenterIfNeeded();
  },

  tick: function (time, timeDelta) {
    this._setCenterIfNeeded();
    if (!this._center) return;

    const pidMove = this.el.components['pid-move'];
    if (!pidMove) return;

    // Definir la velocidad lineal libre (v = r * ω) una sola vez en el controlador
    if (!this._speedDefined) {
      pidMove.targetSpeed = this.data.radius * this.data.speed;
      this._speedDefined = true;
    }

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

    // Únicamente especificamos la localización objetivo en cada frame
    pidMove.targetPosition.copy(this._desired);
  }
});