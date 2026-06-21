AFRAME.registerComponent('projector-controller',{
    schema:{},

    init: function () {
        // ref a elementos
        this.lights = document.getElementById("shadowLights")

        // Get projector mesh reference
        this.projectorMesh = document.getElementById("modeloProyector").object3D
        
        // Array of material copies (index = original position)
        this.materialCopies = []
        
        // Platform rotation flag - toggles when platform is rotated (flips alzada/perfil)
        this.platformFlipped = false
        this.handlePlatformRotation = () => {
            this.platformFlipped = !this.platformFlipped
            console.log("[projector-controller] Platform flipped:", this.platformFlipped)
            this.swapMaterials()
        }

        this.loadFromTemplates = () => {
            // mantener orden!
            this.selectors = ["Perfil", "Planta", "Alzada"].map((x) => {
                return document.getElementById("btnShadow"+x).components['shadow-selector'].currentIndex
            })
        }

        //estado inicial
        this.lights.setAttribute('visible', false)

        this.toggleLight = () =>{
            this.lights.setAttribute('visible', !this.lights.getAttribute('visible'))
            LOGGER.logToggleLights(this.lights.getAttribute('visible'))
        }

        this.validate = () => {
            // por template recargar cada vez...
            this.loadFromTemplates()
            console.log("Current selector indices:", this.selectors)

            // Get meshID from platform's detected element
            const platformEl = document.getElementById("platProyector")
            const platformComponent = platformEl?.components?.['projector-platform']
            const detectedEl = platformComponent?.detectedEl
            
            if (!detectedEl) {
                console.warn("[projector-controller] No element detected by platform")
                this.emitValidation(false)
                return
            }
            
            // Get meshID from figure-id attribute (as is)
            let meshID = detectedEl.getAttribute('figure-id') ||
                        detectedEl.id.replace('e', '').replace('Forat', 'forat')
            
            console.log("[projector-controller] Validating meshID:", meshID, "from element:", detectedEl.id)
            
            fetch(`./backend.php?figura=${encodeURIComponent(meshID)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error("[projector-controller] Error fetching figura:", data.error)
                        this.emitValidation(false)
                        return
                    }

                    // Expected indices from database (alzada, planta, perfil)
                    const expected = {
                        alzada: data.alzada,
                        planta: data.planta,
                        perfil: data.perfil
                    }

                    // Get current selections
                    const current = {
                        alzada: this.selectors[2], // Alzada is at index 2 in selectors array
                        planta: this.selectors[1], // Planta is at index 1
                        perfil: this.selectors[0]  // Perfil is at index 0
                    }

                    // Check if platform is flipped (each rotation swaps alzada and perfil)
                    if (this.platformFlipped) {
                        // Platform flipped: alzada and perfil are swapped
                        alzadaOK = current.alzada === expected.perfil
                        perfilOK = current.perfil === expected.alzada
                    } else {
                        // Normal position
                        alzadaOK = current.alzada === expected.alzada
                        perfilOK = current.perfil === expected.perfil
                    }
                    
                    plantaOK = current.planta === expected.planta

                    console.log(`[projector-controller] Validation - Alzada: ${alzadaOK} (${current.alzada} vs ${expected.alzada}), Planta: ${plantaOK} (${current.planta} vs ${expected.planta}), Perfil: ${perfilOK} (${current.perfil} vs ${expected.perfil})`)
                    
                    this.emitValidation(alzadaOK && plantaOK && perfilOK)
                })
                .catch(error => {
                    console.error("[projector-controller] Error during validation:", error)
                    this.emitValidation(false)
                })
        }

        this.emitValidation = (isValid) => {
            if (isValid) {
                console.log("[projector-controller] Validation passed")
                this.el.emit('validation-ok')
            } else {
                console.log("[projector-controller] Validation failed")
                this.el.emit('validation-fail')
            }
        }

        this.el.addEventListener('toggle-light', this.toggleLight)
        this.el.addEventListener('validate-shadows', this.validate)
        this.el.addEventListener('rotate-platform', this.handlePlatformRotation)
        this.el.addEventListener('reset-detected-figure', () => {
            console.log("[projector-controller] Reset detected figure - resetting projection swap")
            this.platformFlipped = false
            this.swapMaterials()
        })

        // Get projector mesh materials
        this.el.addEventListener('model-loaded', () => {
            this.getProjectorMaterials()
        })
    },

    remove: function() {
        this.el.removeEventListener('rotate-platform', this.handlePlatformRotation)
        this.el.removeEventListener('reset-detected-figure', () => {
            console.log("[projector-controller] Reset detected figure - resetting projection swap")
            this.platformFlipped = false
        })
        this.el.removeEventListener('model-loaded', () => {
            this.getProjectorMaterials()
        })
        this.projectorMesh = null
        this.materialCopies = []
    },

    /**
     * Accesses materials from mesh.children[0].children[0].children[i].material (for i 0..3)
     * Stores copies for projection swapping
     */
    getProjectorMaterials: function() {
        const mesh = this.projectorMesh
        
        if (!mesh) {
            console.warn("[projector-controller] Projector mesh not found")
            return
        }

        // Access materials from mesh.children[0].children[0].children[i].material (for i 0..3)
        console.log("0", mesh);
        console.log("1", mesh.children.length);
        console.log("2", mesh.children[0].children.length);
        console.log("3", mesh.children[0].children[0].children.length);

        
        
        if (mesh.children[0].children[0].children) {
            const targetMesh = mesh.children[0].children[0]
            
            for (let i = 0; i < 4; i++) {
                const childMesh = targetMesh.children[i]
                if (childMesh.isMesh && childMesh.material) {
                    console.log(`[projector-controller] Material ${i}: found ${childMesh.material.name || "unnamed"}`)
                    
                    // Create new material and copy original material info
                    const newMaterial = new THREE.MeshStandardMaterial()
                    newMaterial.copy(childMesh.material)
                    
                    this.materialCopies.push(newMaterial)
                }
            }
        } else{
            console.warn("asdasdas");
            
        }
    },

    /**
     * Swaps materials 1 and 3 when projections are swapped (alzada ↔ perfil)
     * Copies material from array to mesh materials
     */
    swapMaterials: function() {
        if (this.materialCopies.length < 4) {
            console.warn("[projector-controller] Not enough materials to swap")
            return
        }

        const mesh = this.projectorMesh
        if (!mesh || !mesh.children || !mesh.children[0] || !mesh.children[0].children || !mesh.children[0].children[0]) {
            console.warn("[projector-controller] Mesh structure not found")
            return
        }

        const targetMesh = mesh.children[0].children[0]

        if (this.platformFlipped) {
            // Platform flipped: swap material 1 (alzada) with material 3 (perfil)
            console.log("[projector-controller] Swapping materials: alzada ↔ perfil")
            targetMesh.children[1].material.copy(this.materialCopies[3])
            targetMesh.children[3].material.copy(this.materialCopies[1])
        } else {
            // Platform not flipped: restore original materials
            console.log("[projector-controller] Restoring original materials")
            targetMesh.children[1].material.copy(this.materialCopies[1])
            targetMesh.children[3].material.copy(this.materialCopies[3])
        }
    }

})