AFRAME.registerComponent('session-starter', {
    init: function () {
        //this.el.addEventListener('loaded', () => {

        
        // Store references to toggle buttons and text component
        this.toggleBtnIzq = document.querySelector('#btnIzq')
        this.toggleBtnDer = document.querySelector('#btnDer')
        this.textEl = document.querySelector('#textoTecladoLogin')

        // Store original clickAction
        const originalClickAction = this.el.components['ui-button'].data.clickAction
        
        // Define our custom click handler
        this.customClickAction = function() {         
            // Read toggle button states and text
            const isLHand = this.toggleBtnIzq.components['toggle-button'].isActive
            const isRHand = this.toggleBtnDer.components['toggle-button'].isActive
            const text = this.textEl.components['text'].data.value

            // Register new user with LOGGER
            LOGGER.loginUser(text, isLHand, isRHand)
            LOGGER.startSession()
            LOGGER.enterClass("-1")

            if (originalClickAction) {
                originalClickAction.call(this)
            }
        }

        // Set the custom clickAction
        this.el.components['base-button'].data.clickAction = this.customClickAction.bind(this)
        //})
    }
})