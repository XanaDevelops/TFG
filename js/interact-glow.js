AFRAME.registerComponent('interact-glow', {
    schema: {
        color: { type: 'color', default: '#ffffff' },
        maxOpacity: { type: 'number', default: 0.85 },
        scale: { type: 'number', default: 1.02 },
        duration: { type: 'number', default: 180 },
        thresholdAngle: { type: 'number', default: 9 },
        lineWidth: { type: 'number', default: 2 }
    },

    init: function () {
        this._glowT = 0;
        this._glowTarget = 0;
        this._outlines = [];
        this._outlineMat = null;
        this._baseScale = null;
        this._meshObj = null;
        this._cfg = this.el.sceneEl.systems['player-config'];

        this.activationMask = 0; // 0bRH Ray Hand

        this._buildOutline = () => {
            if (this._outlines && this._outlines.length) return;
            const meshObj = this.el.getObject3D('mesh');
            if (!meshObj) return;

            // Buscar un Mesh con geometría (en glTF suele haber un Group con children)
            let mesh = null;
            if (meshObj.isMesh) {
                mesh = meshObj;
            } else if (meshObj.traverse) {
                meshObj.traverse((o) => {
                    if (!mesh && o && o.isMesh && o.geometry) mesh = o;
                });
            }
            if (!mesh || !mesh.geometry) return;

            this._meshObj = meshObj;
            this._baseScale = meshObj.scale.clone();

            const edges = new THREE.EdgesGeometry(mesh.geometry, this.data.thresholdAngle);
            this._outlineMat = new THREE.LineBasicMaterial({
                color: new THREE.Color(this.data.color),
                transparent: true,
                opacity: 0,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            const steps = Math.max(1, Math.round(this.data.lineWidth));
            const thicknessStep = Math.max(0.002, 0.0025 * this.data.lineWidth);
            for (let i = 0; i < steps; i++) {
                const outline = new THREE.LineSegments(edges, this._outlineMat);
                outline.renderOrder = 999;
                outline.visible = false;
                const s = 1 + thicknessStep * (i + 1);
                outline.scale.set(s, s, s);
                this._outlines.push(outline);
                mesh.add(outline);
            }
        };

        // Intento inmediato (primitivas) + listeners (gltf/model)
        this._buildOutline();
        this._onObject3DSet = (e) => {
            if (e && e.detail && e.detail.type === 'mesh') this._buildOutline();
        };
        this._onModelLoaded = () => this._buildOutline();
        this.el.addEventListener('object3dset', this._onObject3DSet);
        this.el.addEventListener('model-loaded', this._onModelLoaded);

        const enableGlow = (e) => {
            if (!this.activationMask) return
            this._glowTarget = 1;
            this._buildOutline();
        }
        const disableGlow = (e) => {
            if (this.activationMask) return
            this._glowTarget = 0;
        }

        this.el.addEventListener('mouseenter', (e) => {
            if (!this._cfg.allowRayGrab) return;
            this.activationMask |= 0b10
            enableGlow(e)
        });
        this.el.addEventListener('obbcollisionstarted', (e) => {
            if (!this._cfg.allowGrab) return;
            const colliderEl = e.detail.withEl;
            if (!colliderEl || !colliderEl.classList || !colliderEl.classList.contains('hand-collider')) return;
            this.activationMask |= 0b01
            enableGlow(e)
        });

        this.el.addEventListener('mouseleave', (e) => {
            if (!this._cfg.allowRayGrab) return;
            this.activationMask &= 0b01
            disableGlow(e)
        });
        this.el.addEventListener('obbcollisionended', (e) => {
            if (!this._cfg.allowGrab) return;
            const colliderEl = e.detail.withEl;
            if (!colliderEl || !colliderEl.classList || !colliderEl.classList.contains('hand-collider')) return;
            this.activationMask &= 0b10
            disableGlow(e)
        });
    },

    tick: function (time, timeDelta) {
        if (!this._cfg.allowGrab) this.activationMask &= 0b10;
        if (!this._cfg.allowRayGrab) this.activationMask &= 0b01;
        if (!this.activationMask) this._glowTarget = 0;
        if (!this._outlines || this._outlines.length === 0 || !this._outlineMat || !this._meshObj) return;

        const duration = Math.max(1, this.data.duration);
        const a = Math.min(1, timeDelta / duration);
        this._glowT += (this._glowTarget - this._glowT) * a;

        const t = Math.max(0, Math.min(1, this._glowT));
        const visible = t > 0.01;
        this._outlines.forEach((outline) => {
            outline.visible = visible;
        });

        // Opacidad suave
        this._outlineMat.opacity = this.data.maxOpacity * t;

        // Ligero “inflado” para evitar z-fighting y reforzar el borde
        if (this._baseScale) {
            const s = 1 + (this.data.scale - 1) * t;
            this._meshObj.scale.set(this._baseScale.x * s, this._baseScale.y * s, this._baseScale.z * s);
        }
    },

    remove: function () {
        this.el.removeEventListener('object3dset', this._onObject3DSet);
        this.el.removeEventListener('model-loaded', this._onModelLoaded);

        if (this._meshObj && this._outlines) {
            this._outlines.forEach((outline) => {
                try { this._meshObj.remove(outline); } catch (e) { }
                if (outline.geometry) outline.geometry.dispose();
            });
        }
        if (this._outlineMat) this._outlineMat.dispose();

        if (this._meshObj && this._baseScale) {
            this._meshObj.scale.copy(this._baseScale);
        }

        this._outlines = null;
        this._outlineMat = null;
        this._meshObj = null;
        this._baseScale = null;
    },

    pause: function () {
        this._glowTarget = 0;
    }
});
