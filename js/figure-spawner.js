AFRAME.registerComponent('figure-spawner', {
    schema: {
        figureId: { type: 'string' },
        spawnPos: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
        spawnRot: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
        maxEnt: { type: 'number', default: 50 }
    },

    init: function () {
        this.spawnedEntities = [];
        this.eventHandler = this.handleRequestSpawn.bind(this);

        this.el.addEventListener('request-spawn', this.eventHandler);

        if (this.data.maxEnt === 0) {
            console.warn('figure-spawner: maxEnt is 0, no entities will be spawned');
        }
    },

    update: function (oldData) {
        if (oldData.maxEnt === 0 && this.data.maxEnt !== 0) {
            console.warn('figure-spawner: maxEnt changed from 0');
        }
    },

    handleRequestSpawn: function () {
        return this.spawn();
    },

spawn: function () {
        // Cláusula de guarda si el spawner ya no es válido en el DOM
        if (!this.el.parentNode || !this.el.sceneEl) return null;

        if (this.data.maxEnt !== -1 && this.spawnedEntities.length >= this.data.maxEnt) {
            if (this.data.maxEnt === 0) return null;
            this.deleteFirst();
        }

        const meshID = this.data.figureId;
        const randomNum = Math.floor(Math.random() * 100000);
        const entityID = `e${meshID.replace('#', '')}-${randomNum}`;

        const entity = document.createElement('a-entity');
        entity.id = entityID;
        entity.setAttribute('gltf-model', meshID);
        entity.setAttribute('figure-id', meshID);
        entity.setAttribute('mixin', 'grabbable-mixin');
        entity.className = "grabbable"

        
        let localPos = new THREE.Vector3(this.data.spawnPos.x, this.data.spawnPos.y, this.data.spawnPos.z);
        /*if (this.el.object3D && this.el.object3D.parent) {
            this.el.object3D.updateMatrixWorld(true);
            this.el.object3D.worldToLocal(localPos);
        }*/

        entity.setAttribute('position', {
            x: localPos.x,
            y: localPos.y,
            z: localPos.z
        });

        entity.setAttribute('rotation', {
            x: this.data.spawnRot.x,
            y: this.data.spawnRot.y,
            z: this.data.spawnRot.z
        });

        this.el.appendChild(entity);
        this.spawnedEntities.push(entity);

        return entity;
    },

    deleteFirst: function () {
        if (this.spawnedEntities.length > 0) {
            const firstEntity = this.spawnedEntities.shift();
            if (firstEntity && firstEntity.parentNode) {
                firstEntity.parentNode.removeChild(firstEntity);
            }
        }
    },

    deleteAll: function () {
        while (this.spawnedEntities.length > 0) {
            const entity = this.spawnedEntities.shift();
            if (entity && entity.parentNode) {
                entity.parentNode.removeChild(entity);
            }
        }
    },

    remove: function () {
        this.deleteAll();
        this.el.removeEventListener('request-spawn', this.eventHandler);
    }
});