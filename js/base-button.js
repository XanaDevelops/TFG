AFRAME.registerComponent('base-button', {
  schema: {
    enabled: { type: 'boolean', default: true },
    primaryColor: { type: 'color', default: 'blue' },
    hoverColor: { type: 'color', default: 'yellow' },
    pressedColor: { type: 'color', default: 'green' },
    allowRay: { type: 'boolean', default: true },
    text: { type: "string", default: "base-button" },
    icon: { type: 'string', default: '' },
    clickAction: {}
  },

  init: function () {
    console.log("bones");

    this.el.classList.add("collidable")
    this._isPaused = false

    this.onMouseEnter = () => {
      this.el.setAttribute("material", "color", this.data.hoverColor)
    }

    this.onMouseLeave = () => {
      this.el.setAttribute("material", "color", this.data.primaryColor)
    }

    this.onClick = () => {
      if (this._isPaused) {
        console.warn("ui-button click ignored: scene is paused")
        return
      }
      this.el.setAttribute("material", "color", this.data.pressedColor)
      this.data.clickAction()
    }

    console.log(this.data.text);
    console.log(this.data.text.length)
    
    if (this.data.text && this.data.text.length > 0) {
      console.log("texto")
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

      var iconEl = document.createElement('a-plane'); //TODO: valorar insertar imagen en el material de la geometria principal
      iconEl.setAttribute('position', '0 0.55 0'); //TODO: revisar con ui-button
      iconEl.setAttribute('height', 1.0)
      iconEl.setAttribute('width', 1.0)
      iconEl.setAttribute('material', {
        src: this.data.icon,
        transparent: true
      });
      this.el.appendChild(iconEl);
    }

    //TODO: mousedown, mouseup
    this.el.addEventListener("mouseenter", this.onMouseEnter)
    this.el.addEventListener("mouseleave", this.onMouseLeave)
    this.el.addEventListener("click", this.onClick)

    console.log("dew");


  },

  pause: function () {
    this._isPaused = true
  },

  play: function () {
    this._isPaused = false
  },

  remove: function () {
    this.el.removeEventListener("mouseenter", this.onMouseEnter)
    this.el.removeEventListener("mouseleave", this.onMouseLeave)
    this.el.removeEventListener("click", this.onClick)
  },
});
