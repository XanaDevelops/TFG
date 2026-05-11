AFRAME.registerComponent('fps-text', {
    schema: {},

    init: function () {
        this.text = this.el.components.text || null;
        this.lastDeltaTime = 0;
        this.samples = [];
        this.maxSamples = 300;
    },

    update: function () {
        if (!this.lastDeltaTime) return;

        if (!this.text) {
            this.text = this.el.components.text || null;
        }

        var fps = 1000 / this.lastDeltaTime;
        if (!isFinite(fps)) return;

        this.samples.push(fps);
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }

        var sorted = this.samples.slice().sort(function (a, b) { return a - b; });
        var p99low = this.getPercentile(sorted, 0.01);
        var p95low = this.getPercentile(sorted, 0.05);
        var med = this.getPercentile(sorted, 0.5);

        var textValue = 'FPS: ' + Math.round(fps) + '  99% low: ' + Math.round(p99low) + ', 95% low: ' + Math.round(p95low) + ' med: ' + Math.round(med);
        this.el.setAttribute('value', textValue);
    },

    tick: function (time, timeDelta) {
        this.lastDeltaTime = timeDelta;
        this.update();
    },

    getPercentile: function (sorted, p) {
        if (!sorted.length) return 0;
        var idx = Math.floor(p * (sorted.length - 1));
        return sorted[idx];
    }
});
