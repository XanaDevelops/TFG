AFRAME.registerComponent('my-grab', {
    schema: {

    },

    setConstraint: function () {
        this.grabbedEl = this.targetEl;

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
        this.grabbedEl = null;
        this.activeConstraintId = null;
        this.activeTrack = null;

        // Handler para abuttondown: alternar visibilidad de #debugHud
        this.el.addEventListener('abuttondown', () => {
            const hud = document.querySelector('#debugHud');
            if (hud) {
                const isVisible = hud.getAttribute('visible');
                hud.setAttribute('visible', !isVisible);
            }
        });

        this.el.setAttribute('raycaster', { objects: '.grabbable', showLine: true, direction: "0 -1 0" });
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
            if (!this.targetEl && !this.grabbedEl) {
                this.targetEl = hitEl;
                console.log(`[my-grab:${this.el.id}] RAY: targetEl -> `, this.targetEl.id);
            }
        });

        this.el.addEventListener('raycaster-intersection-cleared', (e) => {
            console.log(e.detail)
            //FIXME: e.detail.clearedEls no tiene el cubo, que en teoria deberia estar
            //const hitEl = e.detail.els[0];
            //if (this.targetEl === hitEl) {

            //}
            this.targetEl = null;
            console.log(`[my-grab:${this.el.id}] RAY: targetEl -> NULL`);
        });

        this.el.addEventListener('gripdown', () => {
            if (this.targetEl && !this.grabbedEl) {
                //grab
                this.setConstraint()
            }
            if (!this.targetEl) {
                //track
                /*
                console.log(this.el.components)
                const els = this.el.components.raycaster.intersectedEls;
                for (const el of els) {
                    //en teoria solo es uno
                    console.log(`[my-grab:${this.el.id}] raycast track -> ${el.id}`)
                    this.targetEl = el;
                    this.setConstraint()
                }
                if (!els)
                    console.log(`[my-grab:${this.el.id}] raycast EMPTY`)
                */

            }
        });
        //this.el.addEventListener('triggerdown', onGrab);
        this.el.addEventListener('gripup', () => {
            if(this.activeTrack){  //FIXME: hacer esto hace que el cubo salga despedido, lol
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
        const distance = (maxDim / 2) + 0.0;

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
            this.targetEl = gEl;
            gEl.setAttribute('ammo-body', 'type', 'dynamic');
            this.setConstraint();
            this.activeTrack = null; // Detener el movimiento
        }

        console.log(`[manualAnim] Moviendo target ${gEl.id} progresivamente hacia la mano con offset.`);
    },

    update: function () {
        // Do something when component's data is updated.
    },

    remove: function () {
        // Do something the component or its entity is detached.
    },

    tick: function (time, timeDelta) {
        // Do something on every scene tick or frame.
        if (this.activeTrack != null){
            this.manualAnim(timeDelta);
        }
    }
});


//Just works
AFRAME.registerComponent('grab-fix', {
    schema: {
        
    },

    init: function () {
        
        const el = this.el;
        const ammo_body = el.components['ammo-body'];

        if (ammo_body.type === "static") return

        this.fixed = false;

        // Guardar el color original establecido en el HTML
        //this.originalColor = el.getAttribute('material').color;

        setTimeout(() => {
            el.setAttribute('ammo-body', 'type', 'kinematic');

            console.log("start fix");
        }, 500);

        this.el.addEventListener('body-loaded', (e) => {
            console.log("body loaded " + this.fixed);
            
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
        if (time > 1000 && !this.fixed){
            el.setAttribute('ammo-body', 'type', 'dynamic');
            ammoBody.syncToPhysics()
            this.fixed = true
            console.log(this.fixed);
            
        }
        
    }
});


