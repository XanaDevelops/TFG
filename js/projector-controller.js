AFRAME.registerComponent('projector-controller',{
    schema:{},

    init: function () {
        // ref a elementos
        this.lights = document.getElementById("shadowLights")

        // Get projector mesh reference
        this.projectorMesh = document.getElementById("modeloProyector").object3D
        
        // Platform rotation flag - toggles when platform is rotated (flips alzada/perfil)
        this.platformFlipped = false
        this.handlePlatformRotation = () => {
            this.platformFlipped = !this.platformFlipped
            console.log("[projector-controller] Platform flipped:", this.platformFlipped)
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

        // Investigate projector mesh materials
        this.logProjectorMaterials()
    },

    remove: function() {
        this.el.removeEventListener('rotate-platform', this.handlePlatformRotation)
        this.projectorMesh = null
    },

    /**
     * Logs the materials present in the projector mesh and demonstrates
     * how to change materials dynamically.
     * 
     * In Three.js/GLTF models, each mesh can have materials:
     * - Single material: mesh.material
     * - Multiple materials: mesh.materials (array)
     * 
     * To change materials dynamically:
     * ```javascript
     * // Get the mesh
     * const mesh = document.getElementById("modeloProyector").getObject3D('mesh')
     * 
     * // For meshes with materials array
     * if (mesh.materials) {
     *     mesh.materials[0] = newMaterial
     * }
     * // For meshes with single material
     * else if (mesh.material) {
     *     mesh.material = newMaterial
     * }
     * 
     * // For GLTF models, materials are typically accessed via:
     * // mesh.children[0].material (if it's a Group with children)
     * // or mesh.materials[0] for the first material
     */
    logProjectorMaterials: function() {
        const mesh = this.projectorMesh
        
        if (!mesh) {
            console.warn("[projector-controller] Projector mesh not found")
            return
        }

        console.log("[projector-controller] Projector mesh structure:")
        console.log("  Mesh type:", mesh.type)
        console.log("  Mesh name:", mesh.name || "unnamed")

        const materialsFound = []

        // Traverse the mesh hierarchy to find all materials
        mesh.traverse((node) => {
            if (node.isMesh) {
                console.log(`[projector-controller] Found mesh: ${node.name || "unnamed"}`)
                
                // Check for materials array (GLTF format)
                if (node.materials && node.materials.length > 0) {
                    node.materials.forEach((mat, idx) => {
                        console.log(`  Material ${idx}:`, {
                            name: mat.name || "unnamed",
                            color: mat.color ? mat.color.toString() : "no color",
                            type: mat.type,
                            transparent: mat.transparent,
                            opacity: mat.opacity
                        })
                        materialsFound.push({ mesh: node.name, material: mat })
                    })
                }
                // Check for single material property
                else if (node.material) {
                    console.log(`  Material:`, {
                        name: node.material.name || "unnamed",
                        color: node.material.color ? node.material.color.toString() : "no color",
                        type: node.material.type,
                        transparent: node.material.transparent,
                        opacity: node.material.opacity
                    })
                    materialsFound.push({ mesh: node.name, material: node.material })
                }
            }
        })

        console.log(`[projector-controller] Total materials found: ${materialsFound.length}`)
        
        // Demonstrate how to change a material dynamically
        console.log("[projector-controller] To change materials dynamically:")
        console.log("  // Create new material")
        console.log("  const newMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })")
        console.log("  // Apply to mesh (single material)")
        console.log("  mesh.material = newMaterial")
        console.log("  // Or for materials array")
        console.log("  mesh.materials[0] = newMaterial")
    }
})
