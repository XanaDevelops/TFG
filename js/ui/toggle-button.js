AFRAME.registerComponent('toggle-button', {
    schema: {
        text: {type: "string", default: "toggle-button"},
        icon: { type: 'string', default: '' },
        size: {type: "vec2", default: {x: 1, y: 0.5}},
    },

    init: function () {
      this._isPaused = false
      this.isActive = false
      this._isHovered = false
      this._isPressed = false

      this.el.classList.add("collidable")

      this.el.setAttribute("geometry", {
        primitive: "plane",
        width: this.data.size.x,
        height: this.data.size.y
      })

      this.baseColor = "#db1212"
      this.hoverColor = "#eb9797"
      this.activeColor = "#4CAF50"
      this.activeHoverColor = "#66BB6A"

      this.el.setAttribute("material", {
        color: this.baseColor,
        opacity: 0.6,
        transparent: true
      })

      this.onMouseEnter = () => {
        this._isHovered = true
        if (!this.isActive) {
          this.el.setAttribute("material", "color", this.hoverColor)
        }
      }

      this.onMouseLeave = () => {
        this._isHovered = false
        if (!this.isActive) {
          this.el.setAttribute("material", "color", this.baseColor)
        }
      }

      this.onClick = (e) => {
        if (this._isPaused) {
          console.warn("toggle-button click ignored: scene is paused")
          return
        }

        LOGGER.logBtnPress(this.el.id, e.detail.cursorEl.id || "mouse", true)

        this.isActive = !this.isActive
        this._isPressed = true
        
        if (this.isActive) {
          this.el.setAttribute("material", "color", this.activeColor)
        } else {
          this.el.setAttribute("material", "color", this.baseColor)
        }
        
        // Reset _isPressed after a short delay without changing color
        if (this._pressTimeout) clearTimeout(this._pressTimeout)
        this._pressTimeout = setTimeout(() => {
          this._isPressed = false
          this._pressTimeout = null
        }, 120)
      }

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
          width: 4,
        })
        this.el.appendChild(textEl)
      }

      if (this.data.icon) {
        console.log("created icon")
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

      this.el.addEventListener("mouseenter", this.onMouseEnter)
      this.el.addEventListener("mouseleave", this.onMouseLeave)
      this.el.addEventListener("click", this.onClick)
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
      // Do something on every scene tick or frame.
    }
});
