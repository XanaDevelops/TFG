// System that manages player configuration
AFRAME.registerSystem('player-config', {
    schema: {
        
    },

    init: function () {
        this.player = null;

        this.allowMovement = true;
        this.allowGrab = true;
        this.allowRayGrab = true;
        this.allowRayTrack = true;
        this.showAsHands = true;
        this.spawnPos = { x: 0, y: 0, z: 0 };
    },

    registerPlayer: function (el) {
        this.player = el;
        this._apply()
    },

    updatePlayerConfig: function (aMove, aGrab, aRGrab, aRtrack, aHands, spawnPos) {
        this.allowMovement = aMove;
        this.allowGrab = aGrab;
        this.allowRayGrab = aRGrab;
        this.allowRayTrack = aRtrack;
        this.showAsHands = aHands;
        this.spawnPos = spawnPos;
        console.log("[player-config]: updated");

        this._apply()

        
    },

    _apply: function () {
        if (this.player) {
            this.player.setAttribute('movement-controls', 'enabled', this.allowMovement);
            this.player.setAttribute('position', this.spawnPos);

            console.log("[player-config]: applyied");

        }
    }
});

// Component that adjusts user capabilities when entering a scene
AFRAME.registerComponent('player-config', {
    schema: {
        allowMovement: { type: 'boolean', default: true },
        allowGrab: { type: 'boolean', default: true },
        allowRayGrab: { type: 'boolean', default: true },
        allowRayTrack: { type: 'boolean', default: true },
        showAsHands: { type: 'boolean', default: true },
        spawnPos: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
        
        registerMode: { type: 'boolean', default: false }
    },

    init: function () {
        if (this.data.registerMode) {
            this.system.registerPlayer(this.el);
            console.log("[player-config]: registered");

        }
        this.update();
    },

    update: function () {
        this.system.updatePlayerConfig(
            this.data.allowMovement,
            this.data.allowGrab,
            this.data.allowRayGrab,
            this.data.allowRayTrack,
            this.data.showAsHands,
            this.data.spawnPos
        );
    },

    remove: function () {
        // Do something the component or its entity is detached.
    },

    tick: function (time, timeDelta) {
        // Do something on every scene tick or frame.
    }
});