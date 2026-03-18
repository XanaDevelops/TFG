AFRAME.registerComponent('death-barrier', {
    schema: {
        mode: {type: "string", default: "respawn"}
    },

    init: function () {

        const player = document.querySelector("#player")

        console.log("death cube");
        

        const id = this.el.id;

        const listener = (e) => {
            console.warn(e.detail);
            console.warn(e.detail.targetEl)
            const hitEl = e.detail.targetEl;
            console.log(`[death-barrier:${id}]: ${this.data.mode} -> ${hitEl.id}`);
            
            switch (this.data.mode) {
                case "kill":
                    
                    break;
            
                default: //respawn
                    const playerPos = player.getAttribute("position");
                    const randomOffset = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, 4)
                    const newPos = playerPos + randomOffset;
                    hitEl.setAttribute("position", {x: newPos.x, y: newPos.y, z: newPos.z})
                    if(hitEl.components['ammo-body']){
                        hitEl.components['ammo-body'].syncToPhysics();
                    }
                    break;
            }
        };

        this.el.addEventListener('hit', listener);
        this.el.addEventListener('collidestart', listener)
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
