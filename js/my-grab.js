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

        console.log(`[my-grab:${this.id}] grab -> ${this.grabbedEl.id} ${this.activeConstraintId}`);

    },

    delConstraint: function () {
        if (!this.grabbedEl || !this.activeConstraintId) return;

        this.grabbedEl.removeAttribute(this.activeConstraintId);

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

        
        //por teclado, y el .collidable
        // el orden importa!
        this.el.setAttribute('cursor', {rayOrigin: 'entity'})
        this.el.setAttribute('raycaster', { objects: '.grabbable,.collidable', showLine: true, direction: "0 -1 0" });
        this.el.setAttribute('line', { color: 'white' });
        
        //detectar colisión
        this.el.addEventListener('hit', (e) => {
            const hitEl = e.detail.el;
            if (!this.targetEl && !this.grabbedEl) {
                this.targetEl = hitEl;
                console.log(`[my-grab:${this.el.id}] targetEl -> `, this.targetEl.id);
            }
        });

        this.el.addEventListener('hitend', (e) => {
            const hitEl = e.detail.el;
            if (this.targetEl === hitEl) {
                this.targetEl = null;
                console.log(`[my-grab:${this.el.id}] targetEl -> NULL`);
            }
        });
        
        this.el.addEventListener('raycaster-intersection', (e) => {
            const hitEl = e.detail.els[0];
            if (!this.targetEl_ray && !this.grabbedEl) {
                if (!hitEl.classList.contains("grabbable"))
                    return
                this.targetEl_ray = hitEl;
                console.log(`[my-grab:${this.el.id}] RAY: targetEl -> `, this.targetEl_ray.id);
            }
        });

        this.el.addEventListener('raycaster-intersection-cleared', (e) => {
            console.log(e.detail)
            //FIXME: e.detail.clearedEls no tiene el cubo, que en teoria deberia estar
            //const hitEl = e.detail.els[0];
            //if (this.targetEl === hitEl) {

            //}
            this.targetEl_ray = null;
            console.log(`[my-grab:${this.el.id}] RAY: targetEl -> NULL`);
        });
        

        this.el.addEventListener('gripdown', () => {
            if ((this.targetEl || this.targetEl_ray) && !this.grabbedEl) {
                //grab
                this.setConstraint()
            }
            if (!this.targetEl) {
                //track
            }
        });
        //this.el.addEventListener('triggerdown', onGrab);
        this.el.addEventListener('gripup', () => {
            if (this.activeTrack) {  //FIXME: hacer esto hace que el cubo salga despedido, lol
                this.activeTrack.setAttribute('ammo-body', 'type', 'dynamic');
                this.activeTrack = null;
            }
            if (this.grabbedEl && this.activeConstraintId) {
                this.delConstraint()
            }
        });
        //this.el.addEventListener('triggerup', onRelease);

        this.el.addEventListener('triggerdown', () => {
            if (this.grabbedEl) {

                //this.animAnim();
                this.grabbedEl.setAttribute('ammo-body', 'type', 'kinematic');
                this.activeTrack = this.grabbedEl;
                this.delConstraint();

                console.log(`[my-grab:${this.el.id}]: grabbedEL tracked:`);
            }
        });


    },

    manualAnim: function (timeDelta) {
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
        // Do something the component or its entity is detached.
    },

    tick: function (time, timeDelta) {
        // Do something on every scene tick or frame.
        if (this.activeTrack != null) {
            this.manualAnim(timeDelta);
        }
    }
});


AFRAME.registerComponent('grab-glow', {
    schema: {
        color: { type: 'color', default: '#ffffff' },
        maxOpacity: { type: 'number', default: 0.85 },
        scale: { type: 'number', default: 1.02 },
        duration: { type: 'number', default: 180 },
        thresholdAngle: { type: 'number', default: 9 },
        lineWidth: { type: 'number', default: 2 }
    },

    init: function () {
        this._glowT = 0;
        this._glowTarget = 0;
        this._outlines = [];
        this._outlineMat = null;
        this._baseScale = null;
        this._meshObj = null;

        this.activationMask = 0; // 0bRH Ray Hand

        this._buildOutline = () => {
            if (this._outlines && this._outlines.length) return;
            const meshObj = this.el.getObject3D('mesh');
            if (!meshObj) return;

            // Buscar un Mesh con geometría (en glTF suele haber un Group con children)
            let mesh = null;
            if (meshObj.isMesh) {
                mesh = meshObj;
            } else if (meshObj.traverse) {
                meshObj.traverse((o) => {
                    if (!mesh && o && o.isMesh && o.geometry) mesh = o;
                });
            }
            if (!mesh || !mesh.geometry) return;

            this._meshObj = meshObj;
            this._baseScale = meshObj.scale.clone();

            const edges = new THREE.EdgesGeometry(mesh.geometry, this.data.thresholdAngle);
            this._outlineMat = new THREE.LineBasicMaterial({
                color: new THREE.Color(this.data.color),
                transparent: true,
                opacity: 0,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            const steps = Math.max(1, Math.round(this.data.lineWidth));
            const thicknessStep = Math.max(0.002, 0.0025 * this.data.lineWidth);
            for (let i = 0; i < steps; i++) {
                const outline = new THREE.LineSegments(edges, this._outlineMat);
                outline.renderOrder = 999;
                outline.visible = false;
                const s = 1 + thicknessStep * (i + 1);
                outline.scale.set(s, s, s);
                this._outlines.push(outline);
                mesh.add(outline);
            }
        };

        // Intento inmediato (primitivas) + listeners (gltf/model)
        this._buildOutline();
        this._onObject3DSet = (e) => {
            if (e && e.detail && e.detail.type === 'mesh') this._buildOutline();
        };
        this._onModelLoaded = () => this._buildOutline();
        this.el.addEventListener('object3dset', this._onObject3DSet);
        this.el.addEventListener('model-loaded', this._onModelLoaded);

        const enableGlow = (e) => {
            if (!this.activationMask) return
            this._glowTarget = 1;
            this._buildOutline();
        }
        const disableGlow = (e) => {
            if (this.activationMask) return
            this._glowTarget = 0;
        }

        this.el.addEventListener('mouseenter', (e) => {
            this.activationMask |= 0b10
            enableGlow(e)
        });
        this.el.addEventListener('obbcollisionstarted', (e) => {
            const colliderEl = e.detail.withEl;
            if (!colliderEl || !colliderEl.classList || !colliderEl.classList.contains('hand-collider')) return;
            this.activationMask |= 0b01
            enableGlow(e)
        });

        this.el.addEventListener('mouseleave', (e) => {
            this.activationMask &= 0b01
            disableGlow(e)
        });
        this.el.addEventListener('obbcollisionended', (e) => {
            const colliderEl = e.detail.withEl;
            if (!colliderEl || !colliderEl.classList || !colliderEl.classList.contains('hand-collider')) return;
            this.activationMask &= 0b10
            disableGlow(e)
        });
    },

    tick: function (time, timeDelta) {
        if (!this._outlines || this._outlines.length === 0 || !this._outlineMat || !this._meshObj) return;

        const duration = Math.max(1, this.data.duration);
        const a = Math.min(1, timeDelta / duration);
        this._glowT += (this._glowTarget - this._glowT) * a;

        const t = Math.max(0, Math.min(1, this._glowT));
        const visible = t > 0.01;
        this._outlines.forEach((outline) => {
            outline.visible = visible;
        });

        // Opacidad suave
        this._outlineMat.opacity = this.data.maxOpacity * t;

        // Ligero “inflado” para evitar z-fighting y reforzar el borde
        if (this._baseScale) {
            const s = 1 + (this.data.scale - 1) * t;
            this._meshObj.scale.set(this._baseScale.x * s, this._baseScale.y * s, this._baseScale.z * s);
        }
    },

    remove: function () {
        this.el.removeEventListener('object3dset', this._onObject3DSet);
        this.el.removeEventListener('model-loaded', this._onModelLoaded);

        if (this._meshObj && this._outlines) {
            this._outlines.forEach((outline) => {
                try { this._meshObj.remove(outline); } catch (e) { }
                if (outline.geometry) outline.geometry.dispose();
            });
        }
        if (this._outlineMat) this._outlineMat.dispose();

        if (this._meshObj && this._baseScale) {
            this._meshObj.scale.copy(this._baseScale);
        }

        this._outlines = null;
        this._outlineMat = null;
        this._meshObj = null;
        this._baseScale = null;
    },


})

//Just works
// investigar  // Wait for model to load.
//this.el.addEventListener('model-loaded', ...)
AFRAME.registerComponent('grab-fix', {
    schema: {

    },

    init: function () {

        const el = this.el;
        const ammo_body = el.components['ammo-body'];

        if (ammo_body.type === "static") return

        this.fixed = false;

        // Flag para indicar si el body soporta CCD (solo comprobación, no lo activamos)
        this.ccdAvailable = false;

        const checkCCD = () => {
            const comp = el.components && el.components['ammo-body'];
            if (!comp || !comp.body) return false;
            const body = comp.body;
            let avail = false;
            try {
                // Comprobaciones típicas de API de Ammo para CCD
                if (typeof body.setCcdMotionThreshold === 'function' || typeof body.setCcdSweptSphereRadius === 'function' || typeof body.getCcdSweptSphereRadius === 'function') {
                    avail = true;
                }
            } catch (e) {
                // Si la introspección falla, asumimos no disponible
                avail = false;
            }
            this.ccdAvailable = avail;
            console.log(`[grab-fix:${el.id}] CCD disponible: ${this.ccdAvailable}`);
            return avail;
        };

        // Intento inicial de comprobación (si el body ya está cargado)
        checkCCD();

        // Guardar el color original establecido en el HTML
        //this.originalColor = el.getAttribute('material').color;

        setTimeout(() => {
            el.setAttribute('ammo-body', 'type', 'kinematic');

            console.log("start fix");
        }, 500);

        this.el.addEventListener('body-loaded', (e) => {
            console.log("body loaded " + this.fixed);
            // Volver a comprobar CCD cuando el body se haya cargado completamente
            checkCCD();

        })


        

    },

    tick: function (time, timeDelta) {

        const el = this.el;
        const ammoBody = el.components['ammo-body'];

        if (!ammoBody) return; // Si no hay ammo-body, no hacemos nada

        // Verificar el tipo de cuerpo y cambiar el color
        const bodyType = el.getAttribute('ammo-body').type;
        /*if (bodyType === 'dynamic') {
            el.setAttribute('material', 'color', this.originalColor); // Restaurar el color original
        } else if (bodyType === 'kinematic') {
            el.setAttribute('material', 'color', 'yellow'); // Cambiar a amarillo
        }
        */
        if (time > 1000 && !this.fixed) {
            el.setAttribute('ammo-body', 'type', 'dynamic');
            ammoBody.syncToPhysics()
            if (this.el.components['no-grav'])
                this.el.components['no-grav'].configureNoGrav()
            this.fixed = true
            console.log(this.fixed);
            el.emit("body-fixed")

        }

    }
});


// Componente para detectar objetos cercanos usando un collider esférico
AFRAME.registerComponent('close-detect', {
    schema: {
        objects: { type: 'string', default: '.grabbable' },
        far: { type: 'number', default: 0.5 }
    },


    init: function () {
        // close-detect ahora escucha los eventos del componente `obb-collider`
        // y reenvía la información a la entidad padre como `hit` / `hitend`.
        const onObbStart = (e) => {
            const hitEl = e && e.detail && e.detail.withEl;
            const parent = this.el.parentEl || this.el.parentNode;
            if (hitEl && parent) parent.emit('hit', { el: hitEl });
        };
        const onObbEnd = (e) => {
            const hitEl = e && e.detail && e.detail.withEl;
            const parent = this.el.parentEl || this.el.parentNode;
            if (hitEl && parent) parent.emit('hitend', { el: hitEl });
        };

        this.el.addEventListener('obbcollisionstarted', onObbStart);
        this.el.addEventListener('obbcollisionended', onObbEnd);

        // También escuchar eventos OBB en el padre (el mixin `hand-mixin` aplica obb-collider al mano)
        const parentEl = this.el.parentEl || this.el.parentNode;
        if (parentEl) {
            parentEl.addEventListener('obbcollisionstarted', onObbStart);
            parentEl.addEventListener('obbcollisionended', onObbEnd);
        }
    }


});


