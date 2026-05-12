AFRAME.registerComponent('keyboard-text', {
    schema: {

    },

    init: function () {
        var input = this.el.getAttribute("text").value

        // Do something when component first attached.
        this._onKeyboardUpdate = (e) => {
            var code = parseInt(e.detail.code)
            console.log(code);
            
            switch (code) {
                case 8:
                    //remove
                    input = input.slice(0, -1)
                    break
                case 6:
                    // submit
                    return
                default:
                    input = input + e.detail.value
                    break
            }

            this.el.setAttribute("text", {value: input})
        };
        document.addEventListener('a-keyboard-update', this._onKeyboardUpdate)
    },

    update: function () {
        // Do something when component's data is updated.
    },

    remove: function () {
        if (this._onKeyboardUpdate) {
            document.removeEventListener('a-keyboard-update', this._onKeyboardUpdate)
            this._onKeyboardUpdate = null;
        }
    },

    tick: function (time, timeDelta) {
        // Do something on every scene tick or frame.
    }
});
