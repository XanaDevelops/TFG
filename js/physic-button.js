AFRAME.registerComponent('physic-button', {
    schema: {
        enabled: { type: 'boolean', default: true },
        primaryColor: { type: 'color', default: 'blue' },
        pressedColor: { type: 'color', default: 'green' },
        event: { type: 'string', default: '' },
        target: { type: 'string', default: '' },
        args: { type: 'string', default: '' },
        text: { type: 'string', default: '' },
        icon: { type: 'string', default: '' },
        allowRay: { type: 'boolean', default: true }
    },

    init: function () {
        this._isPaused = false;
        this._pressedByHand = false;
        this._targetEl = null;
        this._baseScaleY = this.el.object3D.scale.y;
        this._clickScaleY = this._baseScaleY * 0.65;

        this.el.classList.add('collidable');
        this._applyMaterial();
        this._applyTextOrIcon();
        this._resolveTarget();

        this.el.setAttribute('interact-glow', '');

        this.onMouseDown = () => {
            if (!this._canInteractRay()) return;
            this._setPressed(true);
            this._applyClickScale();
        };

        this.onMouseUp = () => {
            if (!this._canInteractRay()) return;
            this._setPressed(false);
            this._restoreScale();
        };

        this.onClick = () => {
            if (!this._canInteractRay()) return;
            this._sendEvent();
        };

        this.onObbStart = (e) => {
            if (!this._canInteractHand(e)) return;
            if (this._pressedByHand) return;
            this._pressedByHand = true;
            this._setPressed(true);
            this._applyClickScale();
            this._sendEvent();
        };

        this.onObbEnd = (e) => {
            if (!this._isHandCollider(e)) return;
            this._pressedByHand = false;
            this._setPressed(false);
            this._restoreScale();
        };

        this.el.addEventListener('mousedown', this.onMouseDown);
        this.el.addEventListener('mouseup', this.onMouseUp);
        this.el.addEventListener('click', this.onClick);
        this.el.addEventListener('obbcollisionstarted', this.onObbStart);
        this.el.addEventListener('obbcollisionended', this.onObbEnd);
    },

    update: function (oldData) {
        if (!oldData) return;

        if (oldData.primaryColor !== this.data.primaryColor || oldData.pressedColor !== this.data.pressedColor) {
            this._applyMaterial();
        }

        if (oldData.text !== this.data.text || oldData.icon !== this.data.icon) {
            this._applyTextOrIcon(true);
        }

        if (oldData.target !== this.data.target) {
            this._resolveTarget();
        }
    },

    pause: function () {
        this._isPaused = true;
        this._setPressed(false);
        this._restoreScale();
    },

    play: function () {
        this._isPaused = false;
    },

    remove: function () {
        this.el.removeEventListener('mousedown', this.onMouseDown);
        this.el.removeEventListener('mouseup', this.onMouseUp);
        this.el.removeEventListener('click', this.onClick);
        this.el.removeEventListener('obbcollisionstarted', this.onObbStart);
        this.el.removeEventListener('obbcollisionended', this.onObbEnd);

        if (this._iconEl && this._iconEl.parentNode) {
            this._iconEl.parentNode.removeChild(this._iconEl);
        }

        this.el.removeAttribute('interact-glow');
        this._restoreScale();
        this._iconEl = null;
        this._targetEl = null;
    },

    _applyMaterial: function () {
        this.el.setAttribute('material', {
            color: this.data.primaryColor,
            transparent: false
        });

        if (!this.data.text && this.data.icon) {
            this.el.setAttribute('material', {
                color: this.data.primaryColor,
                src: this.data.icon,
                transparent: true
            });
        }
    },

    _applyTextOrIcon: function (reset) {
        if (reset && this._iconEl && this._iconEl.parentNode) {
            this._iconEl.parentNode.removeChild(this._iconEl);
            this._iconEl = null;
        }

        if (this.data.text) {
            this.el.setAttribute('text', {
                value: this.data.text,
                anchor: 'center',
                align: 'center',
                baseline: 'center',
                font: 'fonts/roboto/Roboto-VariableFont_wdth,wght-msdf.json',
                shader: 'msdf',
                negate: false,
                width: 4
            });
            return;
        }

        if (this.data.icon) {
            this._iconEl = document.createElement('a-plane');
            this._iconEl.setAttribute('position', '0 0 0.001');
            this._iconEl.setAttribute('material', {
                src: this.data.icon,
                transparent: true
            });
            this.el.appendChild(this._iconEl);
        }
    },

    _resolveTarget: function () {
        if (!this.data.target) {
            this._targetEl = null;
            return;
        }

        if (this.data.target[0] === '#') {
            this._targetEl = document.querySelector(this.data.target);
            return;
        }

        this._targetEl = document.getElementById(this.data.target);
    },

    _sendEvent: function () {
        if (!this.data.event) return;

        var detail = null;
        if (this.data.args) {
            try {
                detail = JSON.parse(this.data.args);
            } catch (e) {
                detail = this.data.args;
            }
        }

        var evt = new CustomEvent(this.data.event, {
            detail: detail,
            bubbles: true
        });

        var target = this._targetEl || document;
        target.dispatchEvent(evt);
    },

    _setPressed: function (pressed) {
        if (!this.data.enabled || this._isPaused) return;
        var color = pressed ? this.data.pressedColor : this.data.primaryColor;
        this.el.setAttribute('material', 'color', color);
    },

    _applyClickScale: function () {
        if (this._clickScaleY === undefined || this._clickScaleY === null) return;
        this.el.object3D.scale.y = this._clickScaleY;
    },

    _restoreScale: function () {
        if (this._baseScaleY === undefined || this._baseScaleY === null) return;
        this.el.object3D.scale.y = this._baseScaleY;
    },

    _canInteractRay: function () {
        if (!this.data.allowRay) return false;
        if (!this.data.enabled || this._isPaused) return false;
        return true;
    },

    _canInteractHand: function (e) {
        if (!this.data.enabled || this._isPaused) return false;
        return this._isHandCollider(e);
    },

    _isHandCollider: function (e) {
        var colliderEl = e && e.detail && e.detail.withEl ? e.detail.withEl : null;
        if (!colliderEl || !colliderEl.classList) return false;
        return colliderEl.classList.contains('hand-collider');
    }
});
