AFRAME.registerComponent('button', {
    schema: {
        text: {type: "string", default: "button"},
        size: {type: "vec2", default: {x: 1, y: 0.5}},
        changeScene: {type: "int", default: -1}
    },

    init: function () {
      this.el.classList.add("collidable")

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
        width: 4,
      })

      this.onMouseEnter = () => {
        this.el.setAttribute("material", "color", this.hoverColor)
      }

      this.onMouseLeave = () => {
        this.el.setAttribute("material", "color", this.baseColor)
      }

      this.onClick = () => {
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

    remove: function () {
      this.el.removeEventListener("mouseenter", this.onMouseEnter)
      this.el.removeEventListener("mouseleave", this.onMouseLeave)
      this.el.removeEventListener("click", this.onClick)
    },

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
    }
});
