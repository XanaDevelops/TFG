AFRAME.registerComponent('shadow-selector', {
    schema: {
        id: { type: "int" }
    },

    init: function () {

        // por id
        this.colors = [
            "#E76B82", //alzada
            "#E7CF6F", //perfil
            "#5DE761" //planta
        ]

        this.currentIndex = 0

        this.shadows = [
            "",
            "./img/icons/PLACEHOLDER_circle.png",
            "./img/icons/PLACEHOLDER_square.png",
            "./img/icons/PLACEHOLDER_triangle.png"
        ]

        //configurar display 
        this.display = document.createElement('a-plane')
        this.el.appendChild(this.display)
        this.display.setAttribute('height', 0.65)
        this.display.setAttribute('width', 1.0)
        this.display.setAttribute('position', '0 0 0.0001');
        this.display.setAttribute('rotation', "0 0 -90")

        this.updateMaterial()

        this.moveDisplay = (e) => {
            //esto puede cambiar si llega de .emit() y no CustomEvent
            var delta = e.detail
            this.currentIndex += delta
            if (this.currentIndex < 0) this.currentIndex += this.shadows.length
            if (this.currentIndex >= this.shadows.length) this.currentIndex = 0
            this.updateMaterial()
            console.log(this.currentIndex);

        }

        this.el.addEventListener('move-shadow', this.moveDisplay)


        
    },

    updateMaterial: function () {
        this.el.setAttribute('material', {
            color: this.colors[this.data.id],
        })
        this.display.setAttribute('material', {
            color: this.colors[this.data.id],
            src: this.shadows[this.currentIndex],
            transparent: true
        })
    },

    update: function () {
        // Do something when component's data is updated.
    },

    remove: function () {
        // Do something the component or its entity is detached.
        this.el.removeEventListener('move-shadow', this.moveDisplay)
    },

    tick: function (time, timeDelta) {
        // Do something on every scene tick or frame.
    }
});
