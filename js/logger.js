/**
 * LOGGER — Sistema A-Frame para registrar eventos de sesión organizados por clases.
 * Se registra como sistema global de A-Frame y se expone en window.LOGGER.
 * La posición del jugador y rotación de cámara se capturan automáticamente
 * desde los elementos #player y #camera de la escena.
 *
 * Uso en HTML:  <a-scene logger>
 * Uso en JS:    LOGGER.loginUser('alumno01');
 *
 * Estructura del JSON generado:
 * {
 *   username, loginTime, sessionStart,
 *   classes: [
 *     { idClass, enterTime, elapsed_s, events: [ ...entradas ] }
 *   ]
 * }
 */

var LOGGER
AFRAME.registerSystem('logger', {

  // ─── A-Frame lifecycle ─────────────────────────────────────────────────────

  /**
   * Inicializa el sistema, obtiene referencias al jugador y cámara, y
   * expone la instancia globalmente como window.LOGGER.
   */
  init() {
    this._data         = null;   // JSON acumulado de sesión
    this._sessionStart = null;   // Marca de tiempo de inicio de sesión (ms)
    this._currentClass = null;   // Referencia al objeto de clase activo { idClass, events[] }


    // Obtener referencias a los elementos de escena por ID
    const configurePlayer = () => {
        this._playerEl = document.querySelector('#player');
        this._cameraEl = document.querySelector('#camera');

        if (!this._playerEl) console.warn('[LOGGER] No se encontró el elemento #player en la escena.');
        if (!this._cameraEl) console.warn('[LOGGER] No se encontró el elemento #camera en la escena.');

        console.log("[LOGGER] Configured player");
        
    }

    this.el.addEventListener('templaterendered', configurePlayer, {once: true})

    // Exponer la instancia del sistema globalmente para acceso desde cualquier script
    LOGGER = this;
    console.log('[LOGGER] Sistema inicializado y expuesto como LOGGER.');

    //PLACEHOLDER
    this.loginUser()
    this.startSession()
    this.enterClass("-1")
  },


  // ─── Helpers privados ──────────────────────────────────────────────────────

  /** Devuelve la fecha/hora actual en formato ISO 8601. */
  _now() {
    return new Date().toISOString();
  },

  /** Devuelve los segundos transcurridos desde startSession(), con 2 decimales. */
  _elapsed() {
    if (this._sessionStart === null) return 0;
    return parseFloat(((Date.now() - this._sessionStart) / 1000).toFixed(2));
  },

  /** Serializa un THREE.Vector3 a objeto plano {x,y,z} redondeado a 4 decimales. */
  _vec3(v) {
    if (!v) return null;
    return {
      x: parseFloat(v.x.toFixed(4)),
      y: parseFloat(v.y.toFixed(4)),
      z: parseFloat(v.z.toFixed(4)),
    };
  },

  /** Serializa un THREE.Euler a objeto plano {x,y,z} en radianes, 4 decimales. */
  _euler(e) {
    if (!e) return null;
    return {
      x: parseFloat(e.x.toFixed(4)),
      y: parseFloat(e.y.toFixed(4)),
      z: parseFloat(e.z.toFixed(4)),
    };
  },

  /**
   * Lee posición de #player y rotación de #camera en el momento de la llamada.
   * Si los elementos no están disponibles, devuelve null en cada campo.
   * @returns {{ position: Object|null, rotation: Object|null }}
   */
  _playerContext() {
    return {
      position: this._vec3(this._playerEl?.object3D?.position),
      rotation: this._euler(this._cameraEl?.object3D?.rotation),
    };
  },

  /**
   * Construye una entrada de evento estándar con tipo, datos y contexto espacial actual.
   * @param {string} type  — Identificador del tipo de evento (e.g. 'GRAB')
   * @param {Object} data  — Datos específicos del evento
   * @returns {Object}
   */
  _entry(type, data) {
    return {
      type,
      timestamp : this._now(),
      elapsed_s : this._elapsed(),
      data,
      player    : this._playerContext(),
    };
  },

  /**
   * Inserta una entrada en el arreglo events[] de la clase activa.
   * Advierte si no hay sesión o clase activa al momento de llamarse.
   * @param {Object} entry
   */
  _push(entry) {
    if (!this._data) {
      console.warn('[LOGGER] No hay sesión activa. Llama loginUser() primero.');
      return;
    }
    if (!this._currentClass) {
      console.warn('[LOGGER] No hay clase activa. Llama enterClass() primero.');
      return;
    }
    this._currentClass.events.push(entry);
  },


  // ─── API pública ───────────────────────────────────────────────────────────

  /**
   * Crea (o reinicia) el JSON de sesión. Si no se provee username, usa "@XANA".
   * Debe llamarse antes que cualquier otro método.
   * @param {string} [username]
   */
  loginUser(username) {
    const resolved = username || '@XANA';

    if (!username) {
      console.warn('[LOGGER] No se proporcionó nombre de usuario. Usando "@XANA" por defecto.');
    }

    this._sessionStart = null;
    this._currentClass = null;
    this._data = {
      username    : resolved,
      loginTime   : this._now(),
      sessionStart: null,
      classes     : [],
    };
    console.log(`[LOGGER] Usuario '${resolved}' registrado. JSON de sesión creado.`);
  },

  /**
   * Reinicia el timestamp de referencia para los tiempos relativos (elapsed_s).
   * Puede llamarse al comienzo de cada actividad sin perder los datos acumulados.
   */
  startSession() {
    if (!this._data) {
      console.warn('[LOGGER] No hay sesión activa. Llama loginUser() primero.');
      return;
    }
    this._sessionStart      = Date.now();
    this._data.sessionStart = this._now();
    console.log('[LOGGER] Sesión iniciada / timestamp reiniciado.');
  },

  /**
   * Registra la entrada a una nueva clase y la establece como clase activa.
   * Los eventos subsiguientes se acumularán dentro de este objeto de clase.
   * @param {string} idClass — Identificador de la clase a la que se ingresa
   */
  enterClass(idClass) {
    if (!this._data) {
      console.warn('[LOGGER] No hay sesión activa. Llama loginUser() primero.');
      return;
    }
    const classEntry = {
      idClass,
      enterTime : this._now(),
      elapsed_s : this._elapsed(),
      events    : [],
    };
    this._data.classes.push(classEntry);
    this._currentClass = classEntry;       // los _push() futuros irán aquí
    console.log(`[LOGGER] Clase '${idClass}' iniciada (total: ${this._data.classes.length}).`);
  },

  /**
   * Registra que el jugador agarró un elemento con una mano (y si fue mediante rayo).
   * @param {string}  idEl    — ID del elemento agarrado
   * @param {string}  idHand  — Mano usada ('left' | 'right')
   * @param {boolean} [withRay=false] — Si la interacción fue mediante rayo
   */
  logGrab(idEl, idHand, withRay = false) {
    this._push(this._entry('GRAB', { idEl, idHand, withRay }));
  },

  /**
   * Registra que el jugador atrae un elemento del entorno.
   * @param {string} idEl
   * @param {string} idHand
   */
  logPull(idEl, idHand) {
    this._push(this._entry('PULL', { idEl, idHand }));
  },

  /**
   * Registra que el jugador soltó un elemento que tenía agarrado.
   * @param {string} idEl
   * @param {string} idHand
   */
  logUngrab(idEl, idHand) {
    this._push(this._entry('UNGRAB', { idEl, idHand }));
  },

  /**
   * Registra que el jugador marcó un punto de inicio sobre un elemento.
   * @param {string} idEl  — ID del elemento sobre el que se marca el punto
   * @param {string} idHand — Mano usada ('left' | 'right')
   */
  logStartPoint(idEl, idHand) {
    this._push(this._entry('START_POINT', { idEl, idHand }));
  },

  /**
   * Registra que el jugador marcó un punto de fin sobre un elemento.
   * @param {string} idEl  — ID del elemento sobre el que se marca el punto
   * @param {string} idHand — Mano usada ('left' | 'right')
   */
  logEndPoint(idEl, idHand) {
    this._push(this._entry('END_POINT', { idEl, idHand }));
  },

  /**
   * Registra la presión de un botón en la escena (y si se activó mediante rayo).
   * @param {string}  idBtn
   * @param {string}  idHand
   * @param {boolean} [withRay=false]
   */
  logBtnPress(idBtn, idHand, withRay = false) {
    this._push(this._entry('BTN_PRESS', { idBtn, idHand, withRay }));
  },

  /**
   * Registra que el jugador activó o desactivó las luces de la escena.
   * @param {boolean} state - Estado actual
   */
  logToggleLights(state) {
    this._push(this._entry('TOGGLE_LIGHTS', {currentState: state}));
  },

  /**
   * Registra la selección de una sombra específica en un selector de proyecciones.
   * @param {string} idSel    — ID del selector de sombra
   * @param {number} idShadow — Índice numérico de la sombra elegida
   */
  logShadowSel(idSel, idShadow) {
    this._push(this._entry('SHADOW_SEL', { idSel, idShadow }));
  },

  /**
   * Registra el resultado de una validación de vistas ortogonales (alzada, planta, perfil).
   * @param {boolean} alzadaOK — Si la vista de alzada es correcta
   * @param {boolean} plantaOK — Si la vista de planta es correcta
   * @param {boolean} perfilOK — Si la vista de perfil es correcta
   */
  logValidation(alzadaOK, plantaOK, perfilOK) {
    this._push(this._entry('VALIDATION', {
      alzadaOK,
      plantaOK,
      perfilOK,
      allOK: alzadaOK && plantaOK && perfilOK,
    }));
  },

  /**
   * Registra un cambio de escena hacia la escena con el índice numérico indicado.
   * @param {number} idScene — Índice de la escena destino
   */
  logSceneChange(idScene) {
    this._push(this._entry('SCENE_CHANGE', { idScene }));
  },

  /**
   * Descarga el JSON de sesión completo como archivo .json mediante el diálogo del navegador.
   * Además guarda el log en el servidor en la carpeta /logs.
   * El nombre incluye el usuario y la marca de tiempo de descarga.
   */
  downloadJSON() {
    if (!this._data) {
      console.warn('[LOGGER] No hay datos para descargar.');
      return;
    }

    const payload  = JSON.stringify(this._data, null, 2);
    const blob     = new Blob([payload], { type: 'application/json' });
    const url      = URL.createObjectURL(blob);
    const ts       = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `log_${this._data.username}_${ts}.json`;

    const anchor         = document.createElement('a');
    anchor.href          = url;
    anchor.download      = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    // Guardar también en el servidor
    this._saveToServer(filename, payload);

    console.log(`[LOGGER] Archivo descargado: ${filename}`);
  },

  /**
   * Guarda el log en el servidor en la carpeta /logs mediante una llamada POST.
   * @param {string} filename Nombre del archivo
   * @param {string} content Contenido del archivo (JSON)
   */
  _saveToServer(filename, content) {
    fetch('backend.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'saveLog',
        filename: filename,
        content: content
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('[LOGGER] Log guardado en servidor:', data);
    })
    .catch(error => {
      console.error('[LOGGER] Error al guardar log en servidor:', error);
    });
  },

});
