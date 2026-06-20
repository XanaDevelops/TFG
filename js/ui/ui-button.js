AFRAME.registerComponent('ui-button', {
    schema: {
        text: {type: "string", default: "ui-button"},
        icon: { type: 'string', default: '' },
        size: {type: "vec2", default: {x: 1, y: 0.5}},
        changeScene: {type: "int", default: -1},
        changeClass: {type: "int", default: -1}
    },

    init: function () {
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

     


      this.onClick = () => {
        if (this.data.changeClass != -1){
            AFRAME.changeClass(this.data.changeClass)
        }
        else if (this.data.changeScene != -1){
            AFRAME.changeScene(this.data.changeScene)
        }
      }

      this.el.setAttribute("base-button", {
        enabled: this.data.enabled,
        primaryColor: this.baseColor,
        hoverColor: this.hoverColor,
        pressedColor: this.hoverColor,
        text: this.data.text,
        clickAction: this.onClick
      })
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
      
    },

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
    }
});
