// Desbloquea audio tras el primer gesto y reproduce solo los sonidos con autoplay.
AFRAME.registerComponent('audio-fix', {
  schema: {
    autoStartOnUnlock: { default: true },
    rescanIntervalMs: { type: 'int', default: 750 },
    debug: { default: false }
  },

  init: function () {
    this._managed = new Set();
    this._unlocked = false;
    this._intervalId = null;

    this._onGesture = () => {
      this._unlockAudio();
    };

    this._onSceneLoaded = () => {
      this._applyFixes();
      this._autostartIfAlreadyUnlocked();
    };

    // Bloqueo típico de navegadores: hay que reanudar el AudioContext tras un gesto.
    this._installGestureListeners();

    if (this.el.hasLoaded) {
      this._applyFixes();
      this._autostartIfAlreadyUnlocked();
    } else {
      this.el.addEventListener('loaded', this._onSceneLoaded);
    }

    this._startRescan();
  },

  remove: function () {
    this._removeGestureListeners();
    this.el.removeEventListener('loaded', this._onSceneLoaded);

    if (this._intervalId != null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    this._managed.clear();
  },

  _log: function () {
    if (!this.data.debug) return;
    // eslint-disable-next-line no-console
    console.log('[audio-fix]', ...arguments);
  },

  _installGestureListeners: function () {
    // Captura para ganar a otros handlers y asegurar el desbloqueo cuanto antes.
    this._gestureTargets = [window, document];
    this._gestureEvents = ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'click'];

    this._gestureTargets.forEach((t) => {
      this._gestureEvents.forEach((ev) => {
        t.addEventListener(ev, this._onGesture, { capture: true, passive: true });
      });
    });
  },

  _removeGestureListeners: function () {
    if (!this._gestureTargets || !this._gestureEvents) return;
    this._gestureTargets.forEach((t) => {
      this._gestureEvents.forEach((ev) => {
        t.removeEventListener(ev, this._onGesture, { capture: true });
      });
    });
    this._gestureTargets = null;
    this._gestureEvents = null;
  },

  _getAudioContext: function () {
    if (typeof AFRAME !== 'undefined' && AFRAME.audioContext) return AFRAME.audioContext;
    if (typeof THREE !== 'undefined' && THREE.AudioContext && typeof THREE.AudioContext.getContext === 'function') {
      return THREE.AudioContext.getContext();
    }
    return null;
  },

  _unlockAudio: async function () {
    if (this._unlocked) return;

    const ctx = this._getAudioContext();
    if (ctx && ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      try {
        await ctx.resume();
        this._log('AudioContext resumido');
      } catch (e) {
        this._log('No se pudo reanudar AudioContext', e);
      }
    }

    // Aunque no exista ctx (o no esté suspended), desde el primer gesto
    // ya podemos intentar reproducir.
    this._unlocked = true;
    this._removeGestureListeners();

    if (this.data.autoStartOnUnlock) {
      this._applyFixes();
      this._startAll();
    }
  },

  _autostartIfAlreadyUnlocked: function () {
    const ctx = this._getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') return;

    this._unlocked = true;
    this._removeGestureListeners();
    if (this.data.autoStartOnUnlock) this._startAll();
  },

  _startRescan: function () {
    const ms = this.data.rescanIntervalMs | 0;
    if (ms <= 0) return;

    this._intervalId = setInterval(() => {
      this._applyFixes();
      if (this._unlocked && this.data.autoStartOnUnlock) this._startAll();
    }, ms);
  },

  _applyFixes: function () {
    const root = this.el; // Se asume que el componente está puesto en la escena principal.
    if (!root) return;

    const nextManaged = new Set();
    const soundEls = root.querySelectorAll('[sound], a-sound');
    for (let i = 0; i < soundEls.length; i++) {
      const el = soundEls[i];
      if (this._isAutoplay(el)) nextManaged.add(el);
    }

    this._managed = nextManaged;
  },

  _isAutoplay: function (el) {
    const sound = el && el.components && el.components.sound;
    if (sound && sound.data) return !!sound.data.autoplay;

    const data = el && el.getAttribute && el.getAttribute('sound');
    if (!data) return false;
    if (typeof data === 'object' && data.autoplay != null) return !!data.autoplay;
    if (typeof data === 'string') return /autoplay\s*:\s*true/i.test(data);
    return false;
  },

  _startAll: function () {
    // Recorremos solo los gestionados para no iterar el DOM entero aquí.
    this._managed.forEach((el) => this._tryPlay(el));
  },

  _tryPlay: function (el) {
    if (!this._isAutoplay(el)) return;

    const sound = el && el.components && el.components.sound;
    if (!sound || typeof sound.playSound !== 'function') return;

    // Evitar reinicios si ya está sonando.
    if (sound.isPlaying) return;

    try {
      sound.playSound();
    } catch (e) {
      // Silencioso
    }

    // Si el audio aún no estaba cargado, intentamos otra vez cuando lo esté.
    const playOnceLoaded = () => {
      el.removeEventListener('sound-loaded', playOnceLoaded);
      try {
        if (!sound.isPlaying) sound.playSound();
      } catch (e) {
        // Silencioso
      }
    };

    el.addEventListener('sound-loaded', playOnceLoaded, { once: true });
  }
});
