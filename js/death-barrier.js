AFRAME.registerComponent('death-barrier', {
    schema: {
        mode: {type: "string", default: "respawn"}
    },

    init: function () {


        console.log("death cube");
        

        const id = this.el.id;

        this._onHit = (e) => {
            const hitEl = e.detail.targetEl;
            console.log(`[death-barrier:${id}]: ${this.data.mode} -> ${hitEl.id}`);
            var player = document.querySelector("#respawnPoint")
            switch (this.data.mode) {
                case "kill":
                    
                    break;
            
                default: //respawn

                    const worldPos = new THREE.Vector3();
                    player.object3D.getWorldPosition(worldPos);
                    // Offset aleatorio
                    const randomOffset = new THREE.Vector3(Math.random()-0.5, 5, Math.random()-0.5);
                    // Sumar posición global y offset
                    randomOffset.add(worldPos);
                    console.log(`[death-barrier${id}]: newPos -> {${randomOffset.x}, ${randomOffset.y}, ${randomOffset.z}}`)

                    //antes eliminar posibles constraints
                    const attributeName = hitEl.getAttributeNames().find((x) => x.includes("ammo-constraint"))
                    if(attributeName) hitEl.getAttribute(attributeName).target.components['my-grab'].delConstraint()

                    hitEl.setAttribute("position", {x: randomOffset.x, y: randomOffset.y, z: randomOffset.z});
                    if(hitEl.components['ammo-body']){
                        // Eliminar velocidad lineal y angular
                        const body = hitEl.components['ammo-body'].body;
                        if (body) {
                            const zeroVec = new Ammo.btVector3(0, 0, 0);
                            body.setLinearVelocity(zeroVec);
                            body.setAngularVelocity(zeroVec);
                            Ammo.destroy(zeroVec);
                        }
                        hitEl.components['ammo-body'].syncToPhysics();
                    }
                    break;
            }
        };

        this.el.addEventListener('hit', this._onHit);
        this.el.addEventListener('collidestart', this._onHit)
    },

    update: function () {
      // Do something when component's data is updated.
    },

    remove: function () {
            if (this._onHit) {
                this.el.removeEventListener('hit', this._onHit);
                this.el.removeEventListener('collidestart', this._onHit);
                this._onHit = null;
            }
    },

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
    }
});
