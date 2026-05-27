AFRAME.registerComponent('scene-manager', {
    schema: {

    },

    init: function () {
        // Do something when component first attached.
        this.scenes = [
            "scenes/mainMenu.html",
            "scenes/mainScene.html",
            "scenes/mainClasse.html",
        ]
        this.currentScene = 0

        this.loadScene(this.currentScene)
    },

    loadScene: function (index) {
        this.currentScene = index
        this.el.setAttribute("template", { "src": this.scenes[this.currentScene] })
    },

    update: function () {
        // Do something when component's data is updated.
    },

    remove: function () {
        // Do something the component or its entity is detached.
    },

    tick: function (time, timeDelta) {
        // Do something on every scene tick or frame.
    }
});


AFRAME.registerComponent("borrar", {
    init: function () {
        setTimeout(() => {
            document.getElementById("sceneContainer").components["scene-manager"].loadScene(1)
        }, 0);
    }
})