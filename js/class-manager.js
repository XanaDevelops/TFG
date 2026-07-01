AFRAME.registerComponent('class-manager', {
    init: function () {
        // Listen for template loaded events
        this.el.addEventListener('template-loaded', (e) => {
            console.log("loaded template", e.detail);
        });

        const classID = this.el.sceneEl.systems['scene-manager'].activeClass;
        console.log("class ID: ", classID);
        
        // Fetch figures for current class from backend
        fetch(`backend.php?figuresForClasse=${classID}`)
            .then(response => response.json())
            .then(figures => {
                console.log(`Figures for class ${classID}:`, figures);
                
                // Store figures data for use by other components
                this.figures = figures;
                
                // Trigger a custom event when figures are loaded
                this.el.emit('figures-loaded', { figures: figures, classID: classID });
            })
            .catch(error => {
                console.error(`Error fetching figures for class ${classID}:`, error);
                this.el.emit('figures-error', { error: error.message, classID: classID });
            });

        this.validationListener = (e) => {
            const meshID = e.detail.meshID;
            console.log(`[class-manager] Validation OK for meshID: ${meshID}`);

            // Remove figure with matching meshID from figures array
            const index = this.figures.findIndex(f => f.id === meshID);
            if (index !== -1) {
                this.figures.splice(index, 1);
                console.log(`[class-manager] Removed figure ${meshID}, remaining: ${this.figures.length}`);
            }

            // Log when figures array becomes empty
            if (this.figures.length === 0) {
                console.log("[class-manager] All figures validated - figures array is empty");
            }
        }

        // Listen for validation-ok event to remove validated figures
        this.el.sceneEl.addEventListener('validation-ok', this.validationListener);
    },

    remove: function() {
        this.el.sceneEl.removeEventListener('validation-ok', this.validationListener)
    }


});
