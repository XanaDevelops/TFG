AFRAME.registerComponent('session-starter', {
    init: function () {
        this.toggleBtnIzq = document.querySelector('#btnIzq')
        this.toggleBtnDer = document.querySelector('#btnDer')
        this.textEl = document.querySelector('#textoTecladoLogin')

        var btnEntrar = document.querySelector('#btnEntrar')
        var originalClickAction = btnEntrar.components['ui-button'].data.clickAction

        this.customClickAction = function() {
            var isLHand = this.toggleBtnIzq.components['toggle-button'].isActive
            var isRHand = this.toggleBtnDer.components['toggle-button'].isActive
            var text = this.textEl.components['text'].data.value

            LOGGER.loginUser(text, isLHand, isRHand)
            LOGGER.startSession()
            LOGGER.enterClass("-1")

            if (originalClickAction) {
                originalClickAction.call(this)
            }
        }

        btnEntrar.components['ui-button'].clickAction = this.customClickAction.bind(this)
    }
})
