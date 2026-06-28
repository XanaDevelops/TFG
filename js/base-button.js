AFRAME.registerComponent('base-button', {
  schema: {
    enabled: { type: 'boolean', default: true },
    primaryColor: { type: 'color', default: 'blue' },
    hoverColor: { type: 'color', default: 'yellow' },
    pressedColor: { type: 'color', default: 'green' },
    allowRay: { type: 'boolean', default: true },
    text: { type: "string", default: "base-button" },
    icon: { type: 'string', default: '' },
    clickAction: {} //uso interno
  },

  init: function () {
    this.el.classList.add("collidable")
    this._isPaused = false
    this._isHovered = false
    this._isPressed = false
    this._pressTimeout = null

    this.onMouseEnter = () => {
      this._isHovered = true
      var isPressed = this._isPressed || (this.el.components['physic-button'] && (this.el.components['physic-button']._pressedByHand || this.el.components['physic-button']._clickTimeout));
      if (!isPressed) {
        this.el.setAttribute("material", "color", this.data.hoverColor)
      }
    }

    this.onMouseLeave = () => {
      this._isHovered = false
      var isPressed = this._isPressed || (this.el.components['physic-button'] && (this.el.components['physic-button']._pressedByHand || this.el.components['physic-button']._clickTimeout));
      if (!isPressed) {
        this.el.setAttribute("material", "color", this.data.primaryColor)
      }
    }

    this.onClick = (e) => {      
      if (this._isPaused) {
        console.warn("ui-button click ignored: scene is paused")
        return
      }
      LOGGER.logBtnPress(this.el.id, e.detail.cursorEl.id || "mouse", true) //TODO: ray

      this._isPressed = true
      this.el.setAttribute("material", "color", this.data.pressedColor)
      this.data.clickAction()
      if (this._pressTimeout) clearTimeout(this._pressTimeout)
      this._pressTimeout = setTimeout(() => {
        this._isPressed = false
        this._pressTimeout = null
        var isPressed = this.el.components['physic-button'] && (this.el.components['physic-button']._pressedByHand || this.el.components['physic-button']._clickTimeout);
        if (!isPressed) {
          this.el.setAttribute("material", "color", this._isHovered ? this.data.hoverColor : this.data.primaryColor)
        }
      }, 120)
    }
    
    if (this.data.text && this.data.text.length > 0) {
      var textEl = document.createElement('a-entity');
      textEl.setAttribute("text", {
        value: this.data.text,
        anchor: "center",
        align: "center",
        baseline: "center",
        font: "fonts/roboto/Roboto-VariableFont_wdth,wght-msdf.json",
        shader: "msdf",
        negate: false,
        width: 4,
      });
      this.el.appendChild(textEl);
    }

    if (this.data.icon) {
      console.log("created icon");
      var iconEl = document.createElement('a-plane');
      iconEl.setAttribute('position', '0 0.55 0');
      iconEl.setAttribute('height', 1.0)
      iconEl.setAttribute('width', 1.0)
      iconEl.setAttribute('material', {
        src: this.data.icon,
        transparent: true
      });
      this.el.appendChild(iconEl);
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
});