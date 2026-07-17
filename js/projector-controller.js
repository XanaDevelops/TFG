AFRAME.registerComponent('projector-controller',{
    schema:{},

    init: function () {
        this.materialCopies = []
        this.platformFlipped = false
        this.originalLightColors = []
        this.flashInterval = null

        this.handlePlatformRotation = () => {
            this.platformFlipped = !this.platformFlipped
            this.swapMaterials()
        }

        this.loadFromTemplates = () => {
            this.selectors = [ "Alzada", "Planta","Perfil"].map((x) => {
                console.log(x);
                
                return document.getElementById("btnShadow"+x).components['shadow-selector'].currentIndex
            })
        }

        this.toggleLight = () =>{
            this.lights.setAttribute('visible', !this.lights.getAttribute('visible'))
            LOGGER.logToggleLights(this.lights.getAttribute('visible'))
        }

        this.flashLights = (color, duration) => {
            if (!this.lights) return
            
            clearTimeout(this.flashInterval)
            
            const lights = this.lights.querySelectorAll('a-light')
            
            lights.forEach((light, index) => {
                const lightEl = light.getObject3D('light')
                if (lightEl && lightEl.color) {
                    if (this.originalLightColors[index] === undefined) {
                        this.originalLightColors[index] = lightEl.color.getHex()
                    }
                    lightEl.color.set(color)
                    lightEl.needsUpdate = true
                }
            })

            this.flashInterval = setTimeout(() => {
                lights.forEach((light, index) => {
                    const lightEl = light.getObject3D('light')
                    if (lightEl && lightEl.color && this.originalLightColors[index] !== undefined) {
                        lightEl.color.set(this.originalLightColors[index])
                        lightEl.needsUpdate = true
                    }
                })
                this.originalLightColors = []
                this.flashInterval = null
            }, duration)
        }

        this.validate = () => {
            this.loadFromTemplates()
            
            const platformEl = document.getElementById("platProyector")
            const platformComponent = platformEl?.components?.['projector-platform']
            const detectedEl = platformComponent?.detectedEl
            
            if (!detectedEl) {
                this.emitValidation(false)
                return
            }
            
            let meshID = detectedEl.getAttribute('figure-id') || detectedEl.id.replace('e', '').replace('Forat', 'forat')
            this.currentDetectedEl = detectedEl
            
            fetch(`./backend.php?figura=${encodeURIComponent(meshID)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        this.emitValidation(false, meshID)
                        return
                    }

                    const expected = {
                        alzada: data.alzada,
                        planta: data.planta,
                        perfil: data.perfil
                    }

                    const current = {
                        alzada: this.selectors[0], 
                        planta: this.selectors[1], 
                        perfil: this.selectors[2]  
                    }

                    console.log("E vs C", expected.alzada, current.alzada, expected.planta, current.planta, expected.perfil, current.perfil);
                    

                    let alzadaOK, perfilOK, plantaOK

                    if (this.platformFlipped) {
                        alzadaOK = current.alzada === expected.perfil
                        perfilOK = current.perfil === expected.alzada
                    } else {
                        alzadaOK = current.alzada === expected.alzada
                        perfilOK = current.perfil === expected.perfil
                    }
                    
                    plantaOK = current.planta === expected.planta
                    
                    this.emitValidation(alzadaOK && plantaOK && perfilOK, meshID)
                })
                .catch(error => {
                    this.emitValidation(false, meshID)
                })
        }

        this.emitValidation = (isValid, meshID) => {
            clearTimeout(this.flashInterval)
            
            if (isValid) {
                this.el.emit('validation-ok', { meshID: meshID }, true)
                
                this.flashLights(0x00ff00, 2000)
                
                setTimeout(() => {
                    if (this.currentDetectedEl) {
                        const platformEl = document.getElementById("platProyector")
                        const platformComponent = platformEl?.components?.['projector-platform']

                        if (platformComponent) {
                            platformComponent.delConstraint()
                            if (platformComponent.detectedEl === this.currentDetectedEl) {
                                platformComponent.detectedEl = null
                            }
                        }

                        if (this.currentDetectedEl.parentNode) {
                            this.currentDetectedEl.parentNode.removeChild(this.currentDetectedEl)
                        }

                        if (platformComponent && platformComponent.isInRest) {
                            platformEl.emit('toggle-position')
                        }
                    }
                }, 1000)
            } else {
                this.el.emit('validation-fail', { meshID: meshID }, true)
                
                this.flashLights(0xff0000, 2000)
            }
        }

        this.el.addEventListener('toggle-light', this.toggleLight)
        this.el.addEventListener('validate-shadows', this.validate)
        this.el.addEventListener('rotate-platform', this.handlePlatformRotation)
        this.el.addEventListener('reset-detected-figure', () => {
            this.platformFlipped = false
            this.swapMaterials()
        })

        this.el.addEventListener('model-loaded', () => {
            this.projectorMesh = document.getElementById("modeloProyector").object3D
            this.getProjectorMaterials()
        })

        this.el.addEventListener('templaterendered', () => {
            this.lights = document.getElementById("shadowLights")
            this.lights.setAttribute('visible', false)
        })
    },

    remove: function() {
        if (this.flashInterval) {
            clearTimeout(this.flashInterval)
        }
        this.el.removeEventListener('rotate-platform', this.handlePlatformRotation)
        this.el.removeEventListener('reset-detected-figure', () => {
            this.platformFlipped = false
        })
        this.el.removeEventListener('model-loaded', () => {
            this.getProjectorMaterials()
        })
        this.projectorMesh = null
        this.materialCopies = []
    },

    getProjectorMaterials: function() {
        const mesh = this.projectorMesh
        
        if (!mesh) return

        if (mesh.children[0].children[0].children) {
            const targetMesh = mesh.children[0].children[0]
            
            for (let i = 0; i < 4; i++) {
                const childMesh = targetMesh.children[i]
                if (childMesh.isMesh && childMesh.material) {
                    const newMaterial = new THREE.MeshStandardMaterial()
                    newMaterial.copy(childMesh.material)
                    this.materialCopies.push(newMaterial)
                }
            }
        }
    },

    swapMaterials: function() {
        if (this.materialCopies.length < 4) return

        const mesh = this.projectorMesh
        if (!mesh || !mesh.children || !mesh.children[0] || !mesh.children[0].children || !mesh.children[0].children[0]) return

        const targetMesh = mesh.children[0].children[0]

        if (this.platformFlipped) {
            targetMesh.children[1].material.copy(this.materialCopies[3])
            targetMesh.children[3].material.copy(this.materialCopies[1])
        } else {
            targetMesh.children[1].material.copy(this.materialCopies[1])
            targetMesh.children[3].material.copy(this.materialCopies[3])
        }
    }
})