AFRAME.registerComponent('projector-controller',{
    schema:{},

    init: function () {
        // ref a elementos
        this.lights = document.getElementById("shadowLights")


        //estado inicial
        this.lights.setAttribute('visible', false)

        this.toggleLight = () =>{
            this.lights.setAttribute('visible', !this.lights.getAttribute('visible'))
        }

        this.el.addEventListener('toggle-light', this.toggleLight)
    }
})