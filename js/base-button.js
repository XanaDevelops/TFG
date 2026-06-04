AFRAME.registerComponent('base-button', {
    schema: {
        enabled: { type: 'boolean', default: true },
        primaryColor: { type: 'color', default: 'blue' },
        hoverColor:   { type: 'color', default: 'yellow'},
        pressedColor: { type: 'color', default: 'green' },
        allowRay: { type: 'boolean', default: true }

    },

    init: function () {
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
      }


      this.el.addEventListener("mouseenter", this.onMouseEnter)
      this.el.addEventListener("mouseleave", this.onMouseLeave)
      this.el.addEventListener("click", this.onClick)


      
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
