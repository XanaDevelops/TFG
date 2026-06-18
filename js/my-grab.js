AFRAME.registerComponent('my-grab', {
    schema: {

    },

    setConstraint: function () {
        this.grabbedEl = this.targetEl;
        if (this.grabbedEl === null){
            this.grabbedEl = this.targetEl_ray
        }

        // IMPORTANTE: Ammo.js desactiva los constraints si el objeto dinámico entra en reposo (sleeping).
        // Forzamos que no se desactive mientras lo tenemos agarrado.
        if (this.grabbedEl.components['ammo-body']) {
            //console.log(`[manual-grab] Despertando objeto físico ${this.grabbedEl.id} y evitando que duerma`);
            this.grabbedEl.setAttribute('ammo-body', 'activationState', 'disableDeactivation');
        }

        // Crear un ID único para el constraint
        this.activeConstraintId = 'ammo-constraint__' + Math.random().toString(36).substr(2, 9);

        this.grabbedEl.setAttribute(this.activeConstraintId, {
            target: '#' + this.el.id,
            type: 'lock'
        });

        // Add log-spatial component to track the grabbed object's spatial info
        if (!this.grabbedEl.components['log-spatial']) {
          this.grabbedEl.setAttribute('log-spatial', {});
        }

        console.log(`[my-grab:${this.id}] grab -> ${this.grabbedEl.id} ${this.activeConstraintId}`);

    },

    delConstraint: function () {
        if (!this.grabbedEl || !this.activeConstraintId) return;

        this.grabbedEl.removeAttribute(this.activeConstraintId);

        // Remove log-spatial component when object is ungrabbed
        if (this.grabbedEl.components['log-spatial']) {
            this.grabbedEl.removeAttribute('log-spatial');
        }

        // Restaurar el estado de activación normal para que pueda volver a dormir si cae al suelo
        if (this.grabbedEl.components['ammo-body']) {
            //this.grabbedEl.setAttribute('ammo-body', 'activationState', 'active');
        }

        console.log(`[my-grab:${this.el.id}] UNgrab -> ${this.grabbedEl.id} ${this.activeConstraintId}`);


        this.grabbedEl = null;
        this.activeConstraintId = null;
    },

    init: function () {
        this.targetEl = null;
        this.targetEl_ray = null;
        this.grabbedEl = null;
        this.activeConstraintId = null;
        this.activeTrack = null;
        this._cfg = this.el.sceneEl.systems['player-config'];

        
        //por teclado, y el .collidable
        // el orden importa!
        this.el.setAttribute('raycaster', { objects: '.grabbable,.collidable', showLine: true, direction: "0 -1 0" });
        this.el.setAttribute('line', { color: 'white' });
        
        //detectar colisión
        this._onHit = (e) => {
            if (!this._cfg.allowGrab) return;
            const hitEl = e.detail.el;
            if (!this.targetEl && !this.grabbedEl) {
                this.targetEl = hitEl;
                console.log(`[my-grab:${this.el.id}] targetEl -> `, this.targetEl.id);
            }
        };
        this.el.addEventListener('hit', this._onHit);

        this._onHitEnd = (e) => {
            if (!this._cfg.allowGrab) return;
            const hitEl = e.detail.el;
            if (this.targetEl === hitEl) {
                this.targetEl = null;
                console.log(`[my-grab:${this.el.id}] targetEl -> NULL`);
            }
        };
        this.el.addEventListener('hitend', this._onHitEnd);
        
        this._rayHoverEl = null;
        this._onRayIntersection = (e) => {
            const hitEl = e.detail.els[0];
            if (hitEl){
                LOGGER.logStartPoint(hitEl.id, this.el.id)
            }
            if (hitEl && hitEl !== this._rayHoverEl) {
                //necesario?
                if (this._rayHoverEl) this._rayHoverEl.emit('mouseleave', { cursorEl: this.el }, false);
                
                this._rayHoverEl = hitEl;
                this._rayHoverEl.emit('mouseenter', { cursorEl: this.el }, false);
                //LOGGER.logStartPoint(this._rayHoverEl.id, this.el.id)
            }
            if (this._cfg.allowRayGrab && !this.targetEl_ray && !this.grabbedEl) {
                if (!hitEl.classList.contains("grabbable"))
                    return
                this.targetEl_ray = hitEl;

                console.log(`[my-grab:${this.el.id}] RAY: targetEl -> `, this.targetEl_ray.id);
            }

            
        };
        this.el.addEventListener('raycaster-intersection', this._onRayIntersection);

        this._onRayIntersectionCleared = (e) => {
            console.log(e.detail)
            //FIXME: e.detail.clearedEls no tiene el cubo, que en teoria deberia estar
            //const hitEl = e.detail.els[0];
            //if (this.targetEl === hitEl) {

            //}
            if (this._rayHoverEl) {
                this._rayHoverEl.emit('mouseleave', { cursorEl: this.el }, false);
                LOGGER.logEndPoint(this._rayHoverEl.id, this.el.id)
            }
            this._rayHoverEl = null;
            this.targetEl_ray = null;
            console.log(`[my-grab:${this.el.id}] RAY: targetEl -> NULL`);
        };
        this.el.addEventListener('raycaster-intersection-cleared', this._onRayIntersectionCleared);
        

        this._onGripDown = () => {
            if (!this._cfg.allowGrab) return;
            if ((this.targetEl || this.targetEl_ray) && !this.grabbedEl) {
                //grab
                this.setConstraint()

                LOGGER.logGrab(this.grabbedEl.id, this.el.id, 
                    (this.targetEl_ray && !this.targetEl) ? true : false
                )
            }
            if (!this.targetEl) {
                //track
            }
        };
        this.el.addEventListener('gripdown', this._onGripDown);
        //this.el.addEventListener('triggerdown', onGrab);
        this._onGripUp = () => {
            if (this.activeTrack) {  //FIXME: hacer esto hace que el cubo salga despedido, lol
                this.activeTrack.setAttribute('ammo-body', 'type', 'dynamic');
                this.activeTrack = null;
            }
            if (this.grabbedEl && this.activeConstraintId) {
                
                LOGGER.logUngrab(this.grabbedEl.id, this.el.id)
                this.delConstraint()

                
            }
        };
        this.el.addEventListener('gripup', this._onGripUp);
        //this.el.addEventListener('triggerup', onRelease);

        this._onTriggerDown = () => {
            if (this._rayHoverEl) {
                this._rayHoverEl.emit('click', { cursorEl: this.el }, false);
            }
            if (!this._cfg.allowRayTrack) return;
            if (this.grabbedEl) {

                //this.animAnim();
                this.grabbedEl.setAttribute('ammo-body', 'type', 'kinematic');
                this.activeTrack = this.grabbedEl;
                this.delConstraint();

                LOGGER.logPull(this.activeTrack.id, this.el.id)
                console.log(`[my-grab:${this.el.id}]: grabbedEL tracked:`);
            }
        };
        this.el.addEventListener('triggerdown', this._onTriggerDown);


    },

    manualAnim: function (timeDelta) {
        if (!this._cfg.allowRayTrack) return;
        const gEl = this.activeTrack;

        if (!gEl) return; // Si no hay un target, no hacemos nada

        // Obtener el tamaño del objeto para calcular el offset
        const box = new THREE.Box3().setFromObject(gEl.object3D);
        const size = new THREE.Vector3();
        box.getSize(size);

        // Offset basado en el tamaño del objeto
        const maxDim = (size.x + size.y + size.z) / 3.0;
        const distance = (maxDim / 2) + -0.10;

        // Crear la posición objetivo con offset respecto a la mano
        const targetWorldPos = new THREE.Vector3(0, -distance, 0);
        this.el.object3D.localToWorld(targetWorldPos);

        // Si el objeto agarrado está anidado, pasamos la posición mundial a local respecto a su padre
        if (gEl.object3D.parent) {
            gEl.object3D.parent.worldToLocal(targetWorldPos);
        }

        // Obtener la posición actual del target
        const currentPos = gEl.object3D.position;

        // Interpolar entre la posición actual y la posición objetivo
        const lerpFactor = 0.15; // Factor de interpolación (ajustable para controlar la velocidad)
        currentPos.lerp(targetWorldPos, lerpFactor);

        // Actualizar la posición del target
        gEl.object3D.position.copy(currentPos);

        // Sincronizar con las físicas si el objeto tiene ammo-body
        if (gEl.components['ammo-body'] && gEl.components['ammo-body'].body) {
            gEl.components['ammo-body'].syncToPhysics();
        }

        // Verificar si el objeto ha llegado a la posición objetivo
        if (currentPos.distanceTo(targetWorldPos) < 0.1) {
            console.log(`[manualAnim] El target ${gEl.id} ha llegado a la mano.`);
            this.targetEl_ray = gEl;
            gEl.setAttribute('ammo-body', 'type', 'dynamic');
            this.setConstraint();
            this.activeTrack = null; // Detener el movimiento
        }
    },

    update: function () {
        // Do something when component's data is updated.
    },

    remove: function () {
        if (this._fixTimeout) {
            clearTimeout(this._fixTimeout);
            this._fixTimeout = null;
        }
        if (this._onBodyLoaded) {
            this.el.removeEventListener('body-loaded', this._onBodyLoaded);
            this._onBodyLoaded = null;
        }
        if (this.grabbedEl && this.activeConstraintId) {
            this.delConstraint();
        }
        if (this._onHit) this.el.removeEventListener('hit', this._onHit);
        if (this._onHitEnd) this.el.removeEventListener('hitend', this._onHitEnd);
        if (this._onRayIntersection) this.el.removeEventListener('raycaster-intersection', this._onRayIntersection);
        if (this._onRayIntersectionCleared) this.el.removeEventListener('raycaster-intersection-cleared', this._onRayIntersectionCleared);
        if (this._onGripDown) this.el.removeEventListener('gripdown', this._onGripDown);
        if (this._onGripUp) this.el.removeEventListener('gripup', this._onGripUp);
        if (this._onTriggerDown) this.el.removeEventListener('triggerdown', this._onTriggerDown);
        this._onHit = null;
        this._onHitEnd = null;
        this._onRayIntersection = null;
        this._onRayIntersectionCleared = null;
        this._rayHoverEl = null;
        this._onGripDown = null;
        this._onGripUp = null;
        this._onTriggerDown = null;
    },

    tick: function (time, timeDelta) {
        if (!this._cfg.allowRayGrab) this.targetEl_ray = null;
        // Do something on every scene tick or frame.
        if (this.activeTrack != null) {
            this.manualAnim(timeDelta);
        }
    }
});


//Just works
// investigar  // Wait for model to load.
//this.el.addEventListener('model-loaded', ...)
AFRAME.registerComponent('grab-fix', {
    schema: {
        kinematicDelay: { type: 'number', default: 300 },
        dynamicDelay: { type: 'number', default: 700 },
        dynamicRetryDelay: { type: 'number', default: 150 },
        maxDynamicRetries: { type: 'number', default: 20 }
    },

    init: function () {
        const el = this.el;
        const ammoBody = el.components && el.components['ammo-body'];

        if (!ammoBody || (ammoBody.data && ammoBody.data.type === 'static')) return;

        this.fixed = false;
        this.ccdAvailable = false;
        this._fixStarted = false;
        this._bodyReady = !!ammoBody.body;
        this._dynamicRetries = 0;
        this._kinematicTimeout = null;
        this._dynamicTimeout = null;

        const checkCCD = () => {
            const comp = el.components && el.components['ammo-body'];
            if (!comp || !comp.body) return false;
            const body = comp.body;
            let avail = false;
            try {
                if (typeof body.setCcdMotionThreshold === 'function' || typeof body.setCcdSweptSphereRadius === 'function' || typeof body.getCcdSweptSphereRadius === 'function') {
                    avail = true;
                }
            } catch (e) {
                avail = false;
            }
            this.ccdAvailable = avail;
            console.log(`[grab-fix:${el.id}] CCD disponible: ${this.ccdAvailable}`);
            return avail;
        };

        this._needsMesh = () => {
            const shape = el.components && el.components['ammo-shape'];
            if (!shape || !shape.data) return false;
            const type = String(shape.data.type || '').toLowerCase();
            const fit = String(shape.data.fit || '').toLowerCase();
            return fit === 'all' || fit === 'mesh' || type === 'mesh' || type === 'hull' || type === 'hacd';
        };

        this._hasMesh = () => {
            return !!(el.getObject3D('mesh') || (el.object3DMap && el.object3DMap.mesh));
        };

        this._setBodyType = (type) => {
            const comp = el.components && el.components['ammo-body'];
            if (!comp) return false;
            const data = el.getAttribute('ammo-body');
            const current = data && data.type;
            if (current === type) return true;
            el.setAttribute('ammo-body', 'type', type);
            if (comp.body && typeof comp.syncToPhysics === 'function') comp.syncToPhysics();
            return true;
        };

        this._ensureDynamic = () => {
            if (this.fixed) return;
            const comp = el.components && el.components['ammo-body'];
            const ok = this._setBodyType('dynamic');
            const ready = comp && comp.body;
            if (ok && ready) {
                if (this.el.components['no-grav']) this.el.components['no-grav'].configureNoGrav();
                this.fixed = true;
                el.emit('body-fixed');
                return;
            }
            this._dynamicRetries += 1;
            if (this._dynamicRetries <= this.data.maxDynamicRetries) {
                this._dynamicTimeout = setTimeout(this._ensureDynamic, this.data.dynamicRetryDelay);
            }
        };

        this._startFix = () => {
            if (this._fixStarted) return;
            this._fixStarted = true;
            this._kinematicTimeout = setTimeout(() => {
                this._setBodyType('kinematic');
            }, this.data.kinematicDelay);
            this._dynamicTimeout = setTimeout(this._ensureDynamic, this.data.dynamicDelay);
        };

        this._maybeStartFix = () => {
            if (this._fixStarted) return;
            const needsMesh = this._needsMesh();
            if (needsMesh && !this._hasMesh()) return;
            if (!this._bodyReady) return;
            this._startFix();
        };

        checkCCD();
        this._maybeStartFix();

        this._onBodyLoaded = () => {
            this._bodyReady = true;
            checkCCD();
            this._maybeStartFix();
        };
        this._onObject3DSet = (e) => {
            if (e && e.detail && e.detail.type === 'mesh') this._maybeStartFix();
        };
        this._onModelLoaded = () => {
            this._maybeStartFix();
        };

        this.el.addEventListener('body-loaded', this._onBodyLoaded);
        this.el.addEventListener('object3dset', this._onObject3DSet);
        this.el.addEventListener('model-loaded', this._onModelLoaded);
    },

    remove: function () {
        if (this._kinematicTimeout) clearTimeout(this._kinematicTimeout);
        if (this._dynamicTimeout) clearTimeout(this._dynamicTimeout);
        if (this._onBodyLoaded) this.el.removeEventListener('body-loaded', this._onBodyLoaded);
        if (this._onObject3DSet) this.el.removeEventListener('object3dset', this._onObject3DSet);
        if (this._onModelLoaded) this.el.removeEventListener('model-loaded', this._onModelLoaded);
        this._onBodyLoaded = null;
        this._onObject3DSet = null;
        this._onModelLoaded = null;
    }
});


// Componente para detectar objetos cercanos usando un collider esférico
AFRAME.registerComponent('close-detect', {
    schema: {
        objects: { type: 'string', default: '.grabbable' },
        size: { type: 'number', default: 0.04 },
        rows: { type: 'number', default: 1 },
        cols: { type: 'number', default: 3 },
        spacing: { type: 'number', default: 0.01 },
        offsetY: { type: 'number', default: 0.0 }
    },


    init: function () {
        this._hitCounts = new Map();
        this._colliders = [];

        // close-detect crea varios `obb-collider` y reenvia eventos agregados al padre.
        this._onObbStart = (e) => {
            const hitEl = e && e.detail && e.detail.withEl;
            const parent = this.el.parentEl || this.el.parentNode;
            if (!hitEl || !parent) return;
            const count = (this._hitCounts.get(hitEl) || 0) + 1;
            this._hitCounts.set(hitEl, count);
            if (count === 1) parent.emit('hit', { el: hitEl });
        };
        this._onObbEnd = (e) => {
            const hitEl = e && e.detail && e.detail.withEl;
            const parent = this.el.parentEl || this.el.parentNode;
            if (!hitEl || !parent) return;
            const count = (this._hitCounts.get(hitEl) || 0) - 1;
            if (count <= 0) {
                this._hitCounts.delete(hitEl);
                parent.emit('hitend', { el: hitEl });
            } else {
                this._hitCounts.set(hitEl, count);
            }
        };

        const rows = Math.max(1, Math.floor(this.data.rows));
        const cols = Math.max(1, Math.floor(this.data.cols));
        const spacing = Math.max(0, this.data.spacing);
        const cubeSize = Math.max(0.001, this.data.size);
        const step = cubeSize + spacing;
        const height = cols * cubeSize + (cols - 1) * spacing;
        const depth = rows * cubeSize + (rows - 1) * spacing;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = 0;
                const y = -height / 2 + cubeSize / 2 + c * step + this.data.offsetY;
                const z = -depth / 2 + cubeSize / 2 + r * step;
                const colliderEl = document.createElement('a-entity');
                colliderEl.classList.add('hand-collider');
                colliderEl.setAttribute('position', `${x} ${y} ${z}`);
                colliderEl.setAttribute('obb-collider', `size: ${cubeSize}`);
                colliderEl.addEventListener('obbcollisionstarted', this._onObbStart);
                colliderEl.addEventListener('obbcollisionended', this._onObbEnd);
                this.el.appendChild(colliderEl);
                this._colliders.push(colliderEl);
            }
        }
    },

    remove: function () {
        if (this._colliders) {
            this._colliders.forEach((colliderEl) => {
                colliderEl.removeEventListener('obbcollisionstarted', this._onObbStart);
                colliderEl.removeEventListener('obbcollisionended', this._onObbEnd);
                if (colliderEl.parentNode) colliderEl.parentNode.removeChild(colliderEl);
            });
        }
        this._colliders = null;
        this._hitCounts = null;
        this._onObbStart = null;
        this._onObbEnd = null;
    }


});


