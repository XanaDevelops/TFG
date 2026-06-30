AFRAME.registerComponent('class-spawner', {
    schema: {
        spawnOffset: { type: 'vec3', default: { x: 1, y: 0, z: 0 } }
    },

    init: function () {
        this.figures = [];
        
        const classManager = this.el.sceneEl.components['class-manager'];
        
        //this.el.setAttribute('figure-spawner', '');
        
        this.el.sceneEl.addEventListener('figures-loaded', (e) => {
            this.figures = e.detail.figures;
            this.spawnFigures();
        }, {once: true});
        
    },

    spawnFigures: function () {
        
        this.figureSpawner = this.el;

        const spawnOffset = this.data.spawnOffset;

        const basePos = new THREE.Vector3();
        this.figureSpawner.object3D.getWorldPosition(basePos);

        this.figures.forEach((figure, index) => {
            const globalPos = new THREE.Vector3(
                basePos.x + spawnOffset.x * index,
                basePos.y + spawnOffset.y * index,
                basePos.z + spawnOffset.z * index
            );

            this.figureSpawner.setAttribute('figure-spawner', 'figureId', figure.meshID);
            this.figureSpawner.setAttribute('figure-spawner', 'spawnPos', `${globalPos.x} ${globalPos.y} ${globalPos.z}`);
            
            //this.figureSpawner.components['figure-spawner'].spawn();
            this.el.emit("request-spawn")
            console.log("[class-spawner]: spawn");
            
        });
    }
});