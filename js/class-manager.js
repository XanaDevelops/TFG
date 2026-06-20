AFRAME.registerComponent('class-manager', {
    init: function () {
        // Listen for template loaded events
        this.el.addEventListener('template-loaded', (e) => {
            console.log("loaded template", e.detail);
        });
    }
});