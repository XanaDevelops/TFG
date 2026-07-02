AFRAME.registerComponent('tutorial-platform', {
    schema: {},

    init: function () {
        this.el.className='tutorial-platform';
        this.el.setAttribute('obb-collider', '')     
        
        this.el.addEventListener('obbcollisionstarted', (e) => {
            const colliderEl = e.detail.withEl;
            if (!colliderEl || !colliderEl.classList || colliderEl.id !== 'playerOBB') return;
            this.el.emit('tuto-player-hit', {});
            this.el.parentEl.removeChild(this.el)
        });
    },

    tick: function () {
        
    },

    remove: function () {
    }
});
