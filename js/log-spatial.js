/**
 * log-spatial Component
 * 
 * AFrame component that logs spatial information (position and rotation) of entities.
 * Supports two modes: "timed" (periodic logging) and "delta" (logging on significant movement).
 * 
 * Schema:
 * - mode: string - "timed" or "delta" (default: "timed")
 * - interval: int - Interval in ms for timed mode (default: 2000)
 * - deltaPosThreshold: number - Position change threshold for delta mode (default: 0.01)
 * - deltaRotThreshold: number - Rotation change threshold in radians for delta mode (default: 0.1 degrees converted to radians)
 */

AFRAME.registerComponent('log-spatial', {
  schema: {
    mode: { type: 'string', default: 'timed', enum: ['timed', 'delta'] },
    interval: { type: 'number', default: 2000 },
    deltaPosThreshold: { type: 'number', default: 0.01 },
    deltaRotThreshold: { type: 'number', default: 0.00174533 } // 0.1 degrees in radians
  },

  init: function () {
    this.entityId = this.el.id;
    this.lastPosition = new THREE.Vector3();
    this.lastRotation = new THREE.Quaternion();
    
    // Get initial position and rotation (global)
    this.el.object3D.getWorldPosition(this.lastPosition);
    this.el.object3D.getWorldQuaternion(this.lastRotation);
    
    // Log initial state
    if (LOGGER) {
      LOGGER.logSpatialInfo(this.entityId, this.lastPosition, this.lastRotation);
    }
    
    // Store initial values for delta comparison
    this.lastLoggedPosition = this.lastPosition.clone();
    this.lastLoggedRotation = this.lastRotation.clone();
    
    // Set up interval for timed mode
    if (this.data.mode === 'timed') {
      this.setupTimedMode();
    } else {
      console.warn('[log-spatial] Delta mode not yet implemented');
    }
  },

  setupTimedMode: function () {
    const interval = this.data.interval;
    if (interval <= 0) return;
    
    this.intervalId = setInterval(() => {
      if (!this.el || !this.el.object3D) return;
      
      const currentPosition = new THREE.Vector3();
      const currentRotation = new THREE.Quaternion();
      
      this.el.object3D.getWorldPosition(currentPosition);
      this.el.object3D.getWorldQuaternion(currentRotation);
      
      if (LOGGER) {
        LOGGER.logSpatialInfo(this.entityId, currentPosition, currentRotation);
      }
      
      // Update last logged values
      this.lastLoggedPosition.copy(currentPosition);
      this.lastLoggedRotation.copy(currentRotation);
    }, interval);
  },

  update: function (oldData) {
    // If mode changed from timed to delta or vice versa, reset
    if (oldData.mode !== this.data.mode) {
      this.remove();
      this.init();
    }
    
    // If interval changed in timed mode, update the interval
    if (this.data.mode === 'timed' && oldData.interval !== this.data.interval) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      this.setupTimedMode();
    }
  },

  remove: function () {
    // Log final state before removing
    if (LOGGER) {
      const currentPosition = new THREE.Vector3();
      const currentRotation = new THREE.Quaternion();
      
      this.el.object3D.getWorldPosition(currentPosition);
      this.el.object3D.getWorldQuaternion(currentRotation);
      
      LOGGER.logSpatialInfo(this.entityId, currentPosition, currentRotation);
    }
    
    // Clear interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
});