AFRAME.registerSystem('scene-manager', {
    schema: {

    },

    init: function () {
        // Do something when component first attached.
        this.scenes = [
            "scenes/mainMenu.html",
            "scenes/mainScene.html",
            "scenes/mainClasse.html",
            "scenes/mainLoading.html",
        ]
        this.currentScene = 0
        this.activeClass = -1

        this.sceneContainer = document.querySelector("#sceneContainer")
        this.loadScene(this.currentScene)

        AFRAME.changeScene = this.loadScene.bind(this)
        AFRAME.changeClass = this.loadClass.bind(this)
    },

    loadScene: function (index) {
        this.currentScene = index
        this.sceneContainer.setAttribute("template", { "src": this.scenes[this.currentScene] })
        LOGGER.logSceneChange(index)

        // TODO: ESTO ES DE PRUEBA!!
        if (index == 2) {
            LOGGER.enterClass(index)
        }
    },

    loadClass: function (index) {
        this.activeClass = index
        if (this.currentScene == 2){
            this.loadScene(3)
        }

        this.loadScene(2)
    },  

    loadNextClass: function (index) {
        this.loadClass(this.activeClass+1)
    },

    update: function () {
        // Do something when component's data is updated.
    },

    remove: function () {
        // Do something the component or its entity is detached.
    },

    
});