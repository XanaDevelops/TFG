AFRAME.registerComponent('death-barrier', {
    schema: {
        mode: {type: "string", default: "respawn"}
    },

    init: function () {

        const player = document.querySelector("#player")

        console.log("death cube");
        

        const id = this.el.id;

        const listener = (e) => {
            const hitEl = e.detail.targetEl;
            console.log(`[death-barrier:${id}]: ${this.data.mode} -> ${hitEl.id}`);
            
            switch (this.data.mode) {
                case "kill":
                    
                    break;
            
                default: //respawn
                    const playerPos = player.getAttribute("position");
                    console.warn(playerPos);
                    
                    const randomOffset = new THREE.Vector3(Math.random()-0.5, 10,  Math.random()-0.5)
                    console.warn(randomOffset)
                    randomOffset.add(playerPos);
                    console.warn(randomOffset)
                    console.log(`[death-barrier${id}]: newPos -> {${randomOffset.x}, ${randomOffset.y}, ${randomOffset.z}}`)
                    hitEl.setAttribute("position", {x: randomOffset.x, y: randomOffset.y, z: randomOffset.z})
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
