AFRAME.registerComponent('orthographic-shadow-camera', {
  schema: {
    left: { type: 'number', default: -1 },
    right: { type: 'number', default: 1 },
    top: { type: 'number', default: 1 },
    bottom: { type: 'number', default: -1 },
    near: { type: 'number', default: 0.1 },
    far: { type: 'number', default: 5 },
    mapWidth: { type: 'int', default: 1024 },
    mapHeight: { type: 'int', default: 1024 }
  },

  init: function () {
    this.applyShadowCamera = this.applyShadowCamera.bind(this);
    this.onComponentChanged = this.onComponentChanged.bind(this);

    this.el.addEventListener('componentchanged', this.onComponentChanged);
    this.applyShadowCamera();
  },

  update: function () {
    this.applyShadowCamera();
  },

  remove: function () {
    this.el.removeEventListener('componentchanged', this.onComponentChanged);
  },

  onComponentChanged: function (event) {
    if (event.detail && event.detail.name === 'light') {
      this.applyShadowCamera();
    }
  },

  applyShadowCamera: function () {
    var light = this.el.getObject3D('light');
    if (!light || !light.shadow) return;

    var data = this.data;
    var camera = light.shadow.camera;
    var THREE = AFRAME.THREE;

    if (!camera || !camera.isOrthographicCamera) {
      camera = new THREE.OrthographicCamera(
        data.left,
        data.right,
        data.top,
        data.bottom,
        data.near,
        data.far
      );
      light.shadow.camera = camera;
    }

    camera.left = data.left;
    camera.right = data.right;
    camera.top = data.top;
    camera.bottom = data.bottom;
    camera.near = data.near;
    camera.far = data.far;
    camera.updateProjectionMatrix();

    if (light.shadow.mapSize) {
      light.shadow.mapSize.width = data.mapWidth;
      light.shadow.mapSize.height = data.mapHeight;
    }

    light.shadow.needsUpdate = true;
  }
});
