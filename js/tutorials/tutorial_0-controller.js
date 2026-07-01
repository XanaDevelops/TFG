AFRAME.registerComponent('tutorial-0', {
    schema: {},

    init: function () {
        this.textStates = [
            "Alça les dues mans",
            "Moute als requadres",
            "Selecciona els objectius",
            "Agafa i mou el cub",
            "El projector",
            "Has acabat el tutorial"
        ];

        this.tutorialState = 0;

        this.actionTextEl = document.querySelector('#actionText');

        if (!AFRAME.utils.isVR()) {
            this.tutorialState = 5;
        }

        this.advanceState();
    },

    advanceState: function () {
        this.actionTextEl.setAttribute('value', this.textStates[this.tutorialState]);
        switch (this.tutorialState) {
            case 0:
                
                break;
            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
                break;
            case 5:
                break;
            default:
                break;
        }
        this.tutorialState++;
    }
});