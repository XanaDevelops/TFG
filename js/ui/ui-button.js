AFRAME.registerComponent('ui-button', {
    schema: {
        text: {type: "string", default: "ui-button"},
        icon: { type: 'string', default: '' },
        size: {type: "vec2", default: {x: 1, y: 0.5}},
        changeScene: {type: "int", default: -1},
        changeClass: {type: "int", default: -1},
        sendEvent: {type: "string", default: ''},
        textSize: {type: "int", default: 4}
    },

    init: function () {
        this._isPaused = false
        this._isHovered = false
        this._isPressed = false
        this._pressTimeout = null
        this.clickAction = null

        this.el.setAttribute("geometry", {
            primitive: "plane",
            width: this.data.size.x,
            height: this.data.size.y
        })

        this.baseColor = "#db1212"
        this.hoverColor = "#eb9797"
        this.pressedColor = this.hoverColor

        this.el.setAttribute("material", {
            color: this.baseColor,
            opacity: 0.6,
            transparent: true
        })

        this.el.classList.add("collidable")

        this.onClick = () => {
            if (this.data.changeClass != -1){
                AFRAME.changeClass(this.data.changeClass)
            }
            else if (this.data.changeScene != -1){
                AFRAME.changeScene(this.data.changeScene)
            }
            
            if (this.data.sendEvent !== '') {
                this.el.emit(this.data.sendEvent, {el: this.el})
            }
        }

        this.onMouseEnter = () => {
            this._isHovered = true
            var isPressed = this._isPressed || (this.el.components['physic-button'] && (this.el.components['physic-button']._pressedByHand || this.el.components['physic-button']._clickTimeout))
            if (!isPressed) {
                this.el.setAttribute("material", "color", this.hoverColor)
            }
        }

        this.onMouseLeave = () => {
            this._isHovered = false
            var isPressed = this._isPressed || (this.el.components['physic-button'] && (this.el.components['physic-button']._pressedByHand || this.el.components['physic-button']._clickTimeout))
            if (!isPressed) {
                this.el.setAttribute("material", "color", this.baseColor)
            }
        }

        this.el.addEventListener("mouseenter", this.onMouseEnter)
        this.el.addEventListener("mouseleave", this.onMouseLeave)
        this.el.addEventListener("click", this.onClick)

        if (this.data.text && this.data.text.length > 0) {
            var textEl = document.createElement('a-entity')
            textEl.setAttribute("text", {
                value: this.data.text,
                anchor: "center",
                align: "center",
                baseline: "center",
                font: "fonts/roboto/Roboto-VariableFont_wdth,wght-msdf.json",
                shader: "msdf",
                negate: false,
                width: this.data.textSize,
            })
            this.el.appendChild(textEl)
        }

        if (this.data.icon) {
            var iconEl = document.createElement('a-plane')
            iconEl.setAttribute('position', '0 0.55 0')
            iconEl.setAttribute('height', 1.0)
            iconEl.setAttribute('width', 1.0)
            iconEl.setAttribute('material', {
                src: this.data.icon,
                transparent: true
            })
            this.el.appendChild(iconEl)
        }
    },

    update: function () {
    },

    pause: function () {
        this._isPaused = true
        if (this._pressTimeout) {
            clearTimeout(this._pressTimeout)
            this._pressTimeout = null
            this._isPressed = false
        }
    },

    play: function () {
        this._isPaused = false
    },

    remove: function () {
        this.el.removeEventListener("mouseenter", this.onMouseEnter)
        this.el.removeEventListener("mouseleave", this.onMouseLeave)
        this.el.removeEventListener("click", this.onClick)
        if (this._pressTimeout) {
            clearTimeout(this._pressTimeout)
            this._pressTimeout = null
        }
    },

    tick: function (time, timeDelta) {
    }
});