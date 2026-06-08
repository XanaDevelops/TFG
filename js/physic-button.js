AFRAME.registerComponent('physic-button', {
    schema: {
        enabled: { type: 'boolean', default: true },
        primaryColor: { type: 'color', default: 'blue' },
        pressedColor: { type: 'color', default: 'green' },
        pressDepth: { type: 'number', default: 0.015 },
        event: { type: 'string', default: '' },
        target: { type: 'string', default: '' },
        args: { type: 'string', default: '' },
        allowRay: { type: 'boolean', default: true }
    },

    init: function () {
        this._isPaused = false;
        this._pressedByHand = false;
        this._targetEl = null;
        this._clickTimeout = null;
        this._obbContactTimer = null;
        this._handCooldown = false;

        this._basePosY = this.el.object3D.position.y;
        this._pressDepth = this.data.pressDepth;

        this._applyMaterial();
        this._resolveTarget();

        this.el.setAttribute('interact-glow', '');

        this.onMouseDown = () => {
            if (!this._canInteractRay()) return;
            this._applyPressPosition();
            this.el.setAttribute("material", "color", this.data.pressedColor);
        };

        this.onMouseUp = () => {
            if (!this._canInteractRay()) return;
            if (this._clickTimeout) clearTimeout(this._clickTimeout);
            this._clickTimeout = setTimeout(() => {
                this._restorePosition();
                var baseButton = this.el.components['base-button'];
                var nextColor = (baseButton && baseButton._isHovered) ? baseButton.data.hoverColor : this.data.primaryColor;
                this.el.setAttribute("material", "color", nextColor);
                this._clickTimeout = null;
            }, 120);
        };

        this.onClick = () => {
            if (!this._canInteractRay()) return;
            this._flashPressPosition();
            this._sendEvent();
        };

        this.onObbStart = (e) => {
            if (!this._canInteractHand(e)) return;
            if (this._pressedByHand) return;
            if (this._handCooldown) return;

            this._pressedByHand = true;
            this._applyPressPosition();
            this.el.setAttribute("material", "color", this.data.pressedColor);

            this._obbContactTimer = setTimeout(() => {
                this._obbContactTimer = null;
                this._sendEvent();
                this._handCooldown = true;
                setTimeout(() => { this._handCooldown = false; }, 100);
            }, 50);
        };

        this.onObbEnd = (e) => {
            if (!this._isHandCollider(e)) return;
            if (this._obbContactTimer) {
                clearTimeout(this._obbContactTimer);
                this._obbContactTimer = null;
            }
            this._pressedByHand = false;
            if (this._clickTimeout) clearTimeout(this._clickTimeout);
            this._clickTimeout = setTimeout(() => {
                this._restorePosition();
                var baseButton = this.el.components['base-button'];
                var nextColor = (baseButton && baseButton._isHovered) ? baseButton.data.hoverColor : this.data.primaryColor;
                this.el.setAttribute("material", "color", nextColor);
                this._clickTimeout = null;
            }, 120);
        };

        setTimeout(() => {
            this.el.setAttribute("base-button", {
                enabled: this.data.enabled,
                primaryColor: this.data.primaryColor,
                pressedColor: this.data.pressedColor,
                allowRay: this.data.allowRay,
                text: '',
                clickAction: this.onClick
            });
        }, 0);

        if (!this.el.hasAttribute('obb-collider')) {
            this.el.setAttribute('obb-collider', '');
        }

        this.el.addEventListener('mousedown', this.onMouseDown);
        this.el.addEventListener('mouseup', this.onMouseUp);
        this.el.addEventListener('obbcollisionstarted', this.onObbStart);
        this.el.addEventListener('obbcollisionended', this.onObbEnd);
    },

    update: function (oldData) {
        if (!oldData) return;

        if (oldData.primaryColor !== this.data.primaryColor || oldData.pressedColor !== this.data.pressedColor) {
            this._applyMaterial();
        }

        if (oldData.pressDepth !== this.data.pressDepth) {
            this._pressDepth = this.data.pressDepth;
        }

        if (oldData.target !== this.data.target) {
            this._resolveTarget();
        }
    },

    pause: function () {
        this._isPaused = true;
        if (this._obbContactTimer) {
            clearTimeout(this._obbContactTimer);
            this._obbContactTimer = null;
        }
        if (this._clickTimeout) {
            clearTimeout(this._clickTimeout);
            this._clickTimeout = null;
        }
        this._restorePosition();
        this._applyMaterial();
    },

    play: function () {
        this._isPaused = false;
    },

    remove: function () {
        this.el.removeEventListener('mousedown', this.onMouseDown);
        this.el.removeEventListener('mouseup', this.onMouseUp);
        this.el.removeEventListener('obbcollisionstarted', this.onObbStart);
        this.el.removeEventListener('obbcollisionended', this.onObbEnd);

        if (this._clickTimeout) {
            clearTimeout(this._clickTimeout);
            this._clickTimeout = null;
        }

        if (this._obbContactTimer) {
            clearTimeout(this._obbContactTimer);
            this._obbContactTimer = null;
        }

        if (this._iconEl && this._iconEl.parentNode) {
            this._iconEl.parentNode.removeChild(this._iconEl);
        }

        this.el.removeAttribute('interact-glow');
        this._restorePosition();
        this._applyMaterial();
        this._iconEl = null;
        this._targetEl = null;
    },

    _applyMaterial: function () {
        this.el.setAttribute('material', {
            color: this.data.primaryColor,
            transparent: false
        });
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

    _applyPressPosition: function () {
        this.el.object3D.position.y = this._basePosY - this._pressDepth;
    },

    _restorePosition: function () {
        this.el.object3D.position.y = this._basePosY;
    },

    _flashPressPosition: function () {
        if (!this.data.enabled || this._isPaused) return;
        this._applyPressPosition();
        if (this._clickTimeout) clearTimeout(this._clickTimeout);
        this._clickTimeout = setTimeout(() => {
            this._restorePosition();
            var baseButton = this.el.components['base-button'];
            var nextColor = (baseButton && baseButton._isHovered) ? baseButton.data.hoverColor : this.data.primaryColor;
            this.el.setAttribute("material", "color", nextColor);
            this._clickTimeout = null;
        }, 120);
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