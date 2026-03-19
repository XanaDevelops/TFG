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

        events.forEach(function (eventName) {
          el.addEventListener(eventName, function (evt) {
            console.log('[hand-elog:' + handID + '] ' + eventName);
          });
        });
      }
    });