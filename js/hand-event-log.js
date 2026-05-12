AFRAME.registerComponent('hand-event-log', {
      init: function () {
        var el = this.el;
        var handID = el.getAttribute('id') || 'unknown';

        var events = [
          'gripdown', 'gripup',
          'pointup', 'pointdown',
          'thumbup', 'thumbdown',
          'pointingstart', 'pointingend',
          'pistolstart', 'pistolend',
          // meta-touch-controls non-button events
          'triggerdown', 'triggerup', 'triggertouchstart', 'triggertouchend', 'triggerchanged',
          'thumbstickdown', 'thumbstickup', 'thumbsticktouchstart', 'thumbsticktouchend', 'thumbstickchanged', 'thumbstickmoved',
          'griptouchstart', 'griptouchend', 'gripchanged',
          'surfacedown', 'surfaceup', 'surfacetouchstart', 'surfacetouchend', 'surfacechanged'
        ];

        this._handlers = [];
        events.forEach((eventName) => {
          const handler = function () {
            console.log('[hand-elog:' + handID + '] ' + eventName);
          };
          this._handlers.push({ eventName: eventName, handler: handler });
          el.addEventListener(eventName, handler);
        });
      },

      remove: function () {
        if (!this._handlers) return;
        this._handlers.forEach((entry) => {
          this.el.removeEventListener(entry.eventName, entry.handler);
        });
        this._handlers = null;
      }
    });