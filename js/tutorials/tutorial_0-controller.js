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
        this.bActionTextEl = document.querySelector('#bActionText');
        this.sceneEl = this.el.sceneEl;

        this.cameraEl = document.querySelector('#camera');
        this.leftHandEl = document.querySelector('#leftHand');
        this.rightHandEl = document.querySelector('#rightHand');
        this.playerEl = document.querySelector('#player');

        if (!this.el.sceneEl.is('vr-mode')) {
            this.tutorialState = 1; //DEUBG
        }

        this.tutoTick = () => { };

        this.advanceState();
    },

    advanceState: function () {
        console.log("[tutorial]: advanceState - Estado actual:", this.tutorialState);

        if (this.tutorialState >= this.textStates.length) {
            this.tutoTick = () => { };
            return;
        }

        if (this.actionTextEl) {
            this.actionTextEl.setAttribute('value', this.textStates[this.tutorialState]);
        }

        this.tutoTick = () => { };

        switch (this.tutorialState) {
            case 0:
                this.case0()
                break;

            case 1:
                this.case1();
                break;
            case 2:
                this.case2()
                break;
            case 3:
                break;
            case 4:
                break;
            case 5:
                console.log("Tutorial terminado");
                break;
            default:
                break;
        }

        this.tutorialState++;
    },

    tick: function (time, timeDelta) {
        this.tutoTick();
    },

    remove: function () {
        this.sceneEl.removeEventListener('tuto-player-hit', this.onPlatformHit);
        this.sceneEl.removeEventListener('tuto-player-hit', this.onButtonHit);
    },

    case0: function () {
        console.log("[tutorial]: Iniciando case 0: Alça les dues mans");

        this.tutoTick = () => {
            if (!this.cameraEl || !this.leftHandEl || !this.rightHandEl) return;

            const cameraPos = this.cameraEl.getAttribute('position');
            const leftHandPos = this.leftHandEl.getAttribute('position');
            const rightHandPos = this.rightHandEl.getAttribute('position');

            if (leftHandPos.y > cameraPos.y && rightHandPos.y > cameraPos.y) {
                this.advanceState();
            }
        };

    },
    case1: function () {
        console.log("[tutorial]: Iniciando case 1: Moute als requadres");
        this.el.setAttribute('player-config', { allowMovement: true })
        this.platformsRemaining = 2;
        this.bActionTextEl.setAttribute('value', `Queden ${this.platformsRemaining} plataformes`);
        this.spawnPlatformPositions = [];

        this.spawnPlatform = () => {
            const platform = document.createElement('a-box');
            
            let randomX, randomZ;
            let validPosition = false;
            
            while (!validPosition) {
                randomX = (Math.random() - 0.5) * 3; // Random between -1.5 and 1.5
                randomZ = (Math.random() - 0.5) * 3; // Random between -1.5 and 1.5
                
                // Check if position is outside the forbidden 2x2 center area
                if (Math.abs(randomX) > 1 || Math.abs(randomZ) > 1) {
                    // Check distance from other platforms (at least 1 unit away)
                    let tooClose = false;
                    for (let i = 0; i < this.spawnPlatformPositions.length; i++) {
                        const otherPos = this.spawnPlatformPositions[i];
                        const dist = Math.sqrt(Math.pow(randomX - otherPos.x, 2) + Math.pow(randomZ - otherPos.z, 2));
                        if (dist < 1) {
                            tooClose = true;
                            break;
                        }
                    }
                    if (!tooClose) {
                        validPosition = true;
                    }
                }
            }
            
            this.spawnPlatformPositions.push({ x: randomX, z: randomZ });
            
            platform.setAttribute('position', `${randomX.toFixed(4)} 0.05 ${randomZ.toFixed(4)}`);
            platform.setAttribute('width', '0.5');
            platform.setAttribute('height', '0.1');
            platform.setAttribute('depth', '0.5');
            platform.setAttribute('rotation', '0 0 0');
            platform.setAttribute('color', '#FFD700');
            platform.setAttribute('tutorial-platform', '');
            this.sceneEl.appendChild(platform);
        };

        for (let i = 0; i < this.platformsRemaining; i++) {
            this.spawnPlatform()
        }



        this.onPlatformHit = (evt) => {
            this.platformsRemaining--;
            if (this.bActionTextEl) {
                this.bActionTextEl.setAttribute('value', `Queden ${this.platformsRemaining} plataformes`);
            }
            if (this.platformsRemaining <= 0) {
                this.advanceState();
            }
        };

        this.sceneEl.addEventListener('tuto-player-hit', this.onPlatformHit);

        this.tutoTick = () => {

        };
    },
    case2: function () {
        console.log("[tutorial]: Iniciando case 2: Selecciona els objectius");
        this.sceneEl.removeEventListener('tuto-player-hit', this.onPlatformHit);
        
        this.buttonsRemaining = 3;
        this.bActionTextEl.setAttribute('value', `Queden ${this.buttonsRemaining} botons`);
        
        // Centro de la semiesfera
        const center = { x: 0, y: 1.1, z: 0 };
        const radius = 2.5;
        
        this.spawnButton = (index) => {
            // 1. Ángulos aleatorios para la superficie de una semiesfera superior
            const theta = Math.random() * 2 * Math.PI;       // Ángulo azimutal: 0 a 2π
            const phi = Math.acos(Math.random());            // Distribución uniforme en la semiesfera superior (0 a π/2)
            
            // 2. Coordenadas cartesianas RELATIVAS al centro
            const xRel = radius * Math.sin(phi) * Math.cos(theta);
            const yRel = radius * Math.cos(phi); // Al ser phi entre 0 y π/2, cos(phi) siempre es positivo (hacia arriba)
            const zRel = radius * Math.sin(phi) * Math.sin(theta);

            // 3. Posición absoluta sumando el centro de la semiesfera
            const posX = center.x + xRel;
            const posY = center.y + yRel;
            const posZ = center.z + zRel;
            
            // Crear la entidad del botón
            const button = document.createElement('a-entity');
            button.setAttribute('position', `${posX.toFixed(4)} ${posY.toFixed(4)} ${posZ.toFixed(4)}`);
            
            // 4. Calcular rotación para que mire EXACTAMENTE al centro utilizando THREE.js
            const dummy = new THREE.Object3D();
            dummy.position.set(posX, posY, posZ);
            dummy.lookAt(center.x, center.y, center.z);
            
            // Los planos de A-Frame por defecto miran hacia el eje Z negativo. 
            // Para que la "cara" frontal mire al centro, necesitamos rotarlo 180 grados en Y tras el lookAt.
            //dummy.rotateY(Math.PI); 

            const euler = new THREE.Euler().setFromQuaternion(dummy.quaternion, 'YXZ');
            button.setAttribute('rotation', `${THREE.MathUtils.radToDeg(euler.x).toFixed(2)} ${THREE.MathUtils.radToDeg(euler.y).toFixed(2)} ${THREE.MathUtils.radToDeg(euler.z).toFixed(2)}`);
            
            button.setAttribute('ui-button', {
                sendEvent: 'tuto-player-hit',
                size: { x: 0.5, y: 0.5 },
                text: 'Target'
            });
            
            this.sceneEl.appendChild(button);
        };
        
        // Spawn 3 buttons
        for (let i = 0; i < this.buttonsRemaining; i++) {
            this.spawnButton(i);
        }
        
        // Event handler for button clicks
        this.onButtonHit = (evt) => {
            if (evt.detail && evt.detail.el) {
                evt.detail.el.remove();
            } else if (evt.target) {
                evt.target.remove();
            }
            
            this.buttonsRemaining--;
            if (this.bActionTextEl) {
                this.bActionTextEl.setAttribute('value', `Queden ${this.buttonsRemaining} botons`);
            }
            if (this.buttonsRemaining <= 0) {
                this.advanceState();
            }
        };
        
        this.sceneEl.addEventListener('tuto-player-hit', this.onButtonHit);
        
        this.tutoTick = () => {
            
        };
    },
    case3: function () {
        this.sceneEl.removeEventListener('tuto-player-hit', this.onButtonHit);


    },
    case4: function () {

    },
    case5: function () {

    },


});