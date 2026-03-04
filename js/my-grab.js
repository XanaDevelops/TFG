AFRAME.registerComponent('my-grab', {
    schema: {

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
                console.log(`[my-grab:${this.id}] targetEl -> `, this.targetEl.id);
            }
        });

        this.el.addEventListener('hitend', (e) => {
            const hitEl = e.detail.el;
            if (this.targetEl === hitEl) {
                this.targetEl = null;
                console.log(`[my-grab:${this.id}] targetEl -> NULL`);
            }
        });

        this.el.addEventListener('gripdown', () => {
            if (this.targetEl && !this.grabbedEl) {
                //grab
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
            }
            if (!this.targetEl) {
                //track
                console.log(this.el.components)
                const els = this.el.components.raycaster.intersectedEls;
                for (const el of els) {
                    console.log(`[my-grab:${this.el.id}] raycast track -> ${el.id}`)
                }
                if(!els)
                    console.log(`[my-grab:${this.el.id}] raycast EMPTY`)

            }
        });
        //this.el.addEventListener('triggerdown', onGrab);
        this.el.addEventListener('gripup', () => {
            if (this.grabbedEl && this.activeConstraintId) {
                this.grabbedEl.removeAttribute(this.activeConstraintId);

                // Restaurar el estado de activación normal para que pueda volver a dormir si cae al suelo
                if (this.grabbedEl.components['ammo-body']) {
                    //this.grabbedEl.setAttribute('ammo-body', 'activationState', 'active');
                }

                console.log(`[my-grab:${this.id}] UNgrab -> ${this.grabbedEl.id} ${this.activeConstraintId}`);


                this.grabbedEl = null;
                this.activeConstraintId = null;
            }
        });
        //this.el.addEventListener('triggerup', onRelease);

        this.el.addEventListener('raycaster-intersection', (e) => {
            const els = e.detail.els;
            console.log(els)
            if (!els) return;

            for (const el of els) {
                console.log(`[my-grab:${this.el.id}] raycast -> ${el.id}`)
            }
        })

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
