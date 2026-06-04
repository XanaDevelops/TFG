AFRAME.registerComponent('ui-button', {
    schema: {
        text: {type: "string", default: "ui-button"},
        size: {type: "vec2", default: {x: 1, y: 0.5}},
        changeScene: {type: "int", default: -1}
    },

    init: function () {
      this.el.classList.add("collidable")
      this._isPaused = false

      this.el.setAttribute("geometry", {
        primitive: "plane",
        width: this.data.size.x,
        height: this.data.size.y
      })

      this.baseColor = "#db1212"
      this.hoverColor = "#eb9797"

      this.el.setAttribute("material", {
        color: this.baseColor,
        opacity: 0.6,
        transparent: true
      })

      this.el.setAttribute("text", {
        value: this.data.text,
        anchor: "center",
        align: "center",
        baseline: "center",
        font: "fonts/roboto/Roboto-VariableFont_wdth,wght-msdf.json",
        shader: "msdf",
        negate: false,
        width: 4,
      })

      this.onMouseEnter = () => {
        this.el.setAttribute("material", "color", this.hoverColor)
      }

      this.onMouseLeave = () => {
        this.el.setAttribute("material", "color", this.baseColor)
      }

      this.onClick = () => {
        if (this._isPaused) {
          console.warn("ui-button click ignored: scene is paused")
          return
        }

        if (this.data.changeScene != -1){
            AFRAME.changeScene(this.data.changeScene)
        }
      }

      this.el.addEventListener("mouseenter", this.onMouseEnter)
      this.el.addEventListener("mouseleave", this.onMouseLeave)
      this.el.addEventListener("click", this.onClick)
    },

    update: function () {
      // Do something when component's data is updated.
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

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
    }
});
