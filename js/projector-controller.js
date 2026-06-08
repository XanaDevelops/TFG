AFRAME.registerComponent('projector-controller',{
    schema:{},

    init: function () {
        // ref a elementos
        this.lights = document.getElementById("shadowLights")


        this.loadFromTemplates = () => {
            // mantener orden!
            this.selectors = ["Perfil", "Planta", "Alzada"].map((x) => {
                return document.getElementById("btnShadow"+x).components['shadow-selector'].currentIndex})
        }
        
        //estado inicial
        this.lights.setAttribute('visible', false)

        this.toggleLight = () =>{
            this.lights.setAttribute('visible', !this.lights.getAttribute('visible'))
        }

        this.validate = () => {
            // por template recargar cada vez...
            this.loadFromTemplates()
            console.log(this.selectors);

            
        }

        this.el.addEventListener('toggle-light', this.toggleLight)
        this.el.addEventListener('validate-shadows', this.validate)
    },

    // TODO: :D
    validate : function(obj, alz, pla, per) {
        return true
    }
})