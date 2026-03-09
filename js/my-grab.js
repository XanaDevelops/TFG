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
            if (this.grabbedEl && this.activeConstraintId) {
                this.delConstraint()
            }
        });
        //this.el.addEventListener('triggerup', onRelease);

        this.el.addEventListener('triggerdown', () => {
            if (this.grabbedEl){
                const gEl = this.grabbedEl;
                this.delConstraint();
                
                // Forzar que targetEl sea gEl por si el raycast lo ha perdido (targetEl = null)
                this.targetEl = gEl;
                
                // Obtener el tamaño del objeto para colocarlo justo delante sin solaparse
                const box = new THREE.Box3().setFromObject(gEl.object3D);
                const size = new THREE.Vector3();
                box.getSize(size);
                
                // Offset
                const maxDim = Math.max(size.x, size.y, size.z);
                const distance = (maxDim / 2) + 0.0; 

                // Creamos el vector de posición en el espacio LOCAL de la mano apuntando hacia "adelante"
                const targetWorldPos = new THREE.Vector3(0, -distance, 0); 
                
                // Lo convertimos a coordenadas GLOBALES (resolviendo la posición + orientación de la mano)
                this.el.object3D.localToWorld(targetWorldPos);

                // Si el objeto agarrado está anidado (lo normal en A-Frame es que el root sea la scene), 
                // pasamos la posición mundial a local respecto a su padre.
                if (gEl.object3D.parent) {
                    gEl.object3D.parent.worldToLocal(targetWorldPos);
                }
                
                gEl.setAttribute('position', {x: targetWorldPos.x, y: targetWorldPos.y, z: targetWorldPos.z});
                
                // Y si es ammo-body, forzamos un teletransporte (a veces necesario en A-Frame Ammo)
                if (gEl.components['ammo-body']) {
                    gEl.components['ammo-body'].syncToPhysics();
                }

                this.setConstraint();
                console.log(`[my-grab:${this.el.id}]: grabbedEL tracked:`);
                console.log(this.el.getAttribute('position'));
                console.log(gEl.getAttribute('position'));
            }
        });


    },

    update: function () {
        // Do something when component's data is updated.
    },

    remove: function () {
        // Do something the component or its entity is detached.
    },

    tick: function (time, timeDelta) {
        // Do something on every scene tick or frame.
    }
});
