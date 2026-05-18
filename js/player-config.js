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
      this._pendingConfig = null;
      this._onSceneLoaded = null;
    
        // Do something when component first attached.
    },

    pause: function () {
      // Do something when component's data is updated.
    },

    play: function () {
      // Do something the component or its entity is detached.
    },

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
    },

    updatePlayerConfig: function (aMove, aGrab, aRGrab, aRtrack, aHands, spawnPos) {
      if (!this.sceneEl.hasLoaded) {
        this._pendingConfig = { aMove, aGrab, aRGrab, aRtrack, aHands, spawnPos };
        if (!this._onSceneLoaded) {
          this._onSceneLoaded = () => {
            this.player = document.querySelector('#player');
            if (this._pendingConfig) {
              this._applyConfig(this._pendingConfig);
              this._pendingConfig = null;
            }
          };
          this.sceneEl.addEventListener('loaded', this._onSceneLoaded, { once: true });
        }
        return;
      }

      this.player = document.querySelector('#player');
      this._applyConfig({ aMove, aGrab, aRGrab, aRtrack, aHands, spawnPos });
    },

    _applyConfig: function (cfg) {
      this.allowMovement = cfg.aMove;
      this.allowGrab = cfg.aGrab;
      this.allowRayGrab = cfg.aRGrab;
      this.allowRayTrack = cfg.aRtrack;
      this.showAsHands = cfg.aHands;
      this.spawnPos = cfg.spawnPos;

      this.player.setAttribute('movement-controls', 'enabled', cfg.aMove);
      this.player.setAttribute('position', cfg.spawnPos);
    }
})

//Ajusta las capacidades del usuario al entrar en una escena
AFRAME.registerComponent('player-config', {
    schema: {
        allowMovement :{type: "boolean", default: true},
        allowGrab :{type: "boolean", default: true},
        allowRayGrab :{type: "boolean", default: true},
        allowRayTrack :{type: "boolean", default: true},
        showAsHands :{type: "boolean", default: true}, //No implementado (por ahora)
        spawnPos :{type: "vec3", default: {x: 0, y:0, z: 0}},
    },

    init: function () {
      // Do something when component first attached.
      this.update()
    },

    update: function () {
      // Do something when component's data is updated.
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
