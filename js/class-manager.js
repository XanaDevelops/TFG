AFRAME.registerComponent('class-manager', {
    init: function () {
        this.classID = this.el.sceneEl.systems['scene-manager'].activeClass;
        this.figures = [];
        this.resultTimeout = null;

        this.txtNivell = document.getElementById('txtNivell');
        this.txtFigura = document.getElementById('txtFigura');
        this.txtResultat = document.getElementById('txtResultat');
        this.btnNext = document.getElementById('btnNext');

        if (this.txtNivell) {
            this.txtNivell.setAttribute('value', `Nivell: ${this.classID}`);
        }

        if (this.btnNext) {
            this.btnNext.setAttribute('visible', false);
            this.btnNext.setAttribute('scale', '0 0 0');
        }

        this.updateRemainingText = () => {
            if (!this.txtResultat) return;
            if (this.figures.length > 0) {
                this.txtResultat.setAttribute('value', `Figures restants: ${this.figures.length}`);
            } else {
                this.txtResultat.setAttribute('value', `Nivell completat!`);
            }
        };

        this.showTemporaryResult = (msg) => {
            if (!this.txtResultat) return;
            this.txtResultat.setAttribute('value', msg);
            if (this.resultTimeout) clearTimeout(this.resultTimeout);
            this.resultTimeout = setTimeout(() => {
                this.updateRemainingText();
            }, 3000);
        };

        fetch(`backend.php?figuresForClasse=${this.classID}`)
            .then(response => response.json())
            .then(figures => {
                this.figures = figures;
                this.updateRemainingText();
                this.el.emit('figures-loaded', { figures: figures, classID: this.classID });
            })
            .catch(error => {
                this.el.emit('figures-error', { error: error.message, classID: this.classID });
            });

        this.validationOkListener = (e) => {
            const meshID = e.detail.meshID;
            this.showTemporaryResult("Correcte!");
            
            const index = this.figures.findIndex(f => f.meshID === meshID || f.id === meshID);
            if (index !== -1) {
                this.figures.splice(index, 1);
            }

            if (this.figures.length === 0 && this.btnNext) {
                this.btnNext.setAttribute('visible', true);
                this.btnNext.setAttribute('scale', '1 1 1');
            }
        };

        this.validationFailListener = () => {
            this.showTemporaryResult("Incorrecte!");
        };

        this.figureDetectedListener = (e) => {
            const meshID = e.detail.meshID;
            if (meshID) {
                const figureData = this.figures.find(f => f.meshID === meshID || f.id === meshID);
                if (this.txtFigura) {
                    if (figureData && figureData.nom) {
                        this.txtFigura.setAttribute('value', `Figura: ${figureData.nom}`);
                    } else {
                        this.txtFigura.setAttribute('value', `Figura detectada`);
                    }
                }
            } else {
                if (this.txtFigura) {
                    this.txtFigura.setAttribute('value', "Posa una figura en \nla plataforma");
                }
            }
        };

        this.onNextClass = () => {
            AFRAME.changeNextClass()
        }

        this.el.sceneEl.addEventListener('validation-ok', this.validationOkListener);
        this.el.sceneEl.addEventListener('validation-fail', this.validationFailListener);
        this.el.sceneEl.addEventListener('figure-detected', this.figureDetectedListener);
        this.el.sceneEl.addEventListener('go-next-class', this.onNextClass)
    },

    remove: function() {
        this.el.sceneEl.removeEventListener('validation-ok', this.validationOkListener);
        this.el.sceneEl.removeEventListener('validation-fail', this.validationFailListener);
        this.el.sceneEl.removeEventListener('figure-detected', this.figureDetectedListener);
        this.el.sceneEl.removeEventListener('go-next-class', this.onNextClass)
    }
}); 