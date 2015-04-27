var app = angular.module('ovts', []);

app.directive('ovtsSlider', function($document) {
  return {
    scope: {
      model: '='
    },
    replace: true,
    template: ['<div class="slider" ng-mousedown="onSliderMouseDown($event)">',
          '<div class="slider-container">',
            '<div class="slider-bar">',
              '<div class="slider-bar-highlight" ng-style="highlightStyle"></div>',
            '</div>',
            '<div class="slider-bar-stub"></div>',
            '<div class="slider-handle" ng-mousedown="onHandleMousedown($event)" ng-style="handleStyle"></div>',
          '</div>',
        '</div>'].join('\n'),

    link: function(scope, element, attrs) {
      var percentage, sliderHandleWidth;

      var options = scope.$eval(attrs.ovtsSliderOptions) || {};
      scope.step = options.step || 0;
      scope.min = options.min || 0;
      scope.max = options.max || (scope.min + 100);
      scope.range = scope.max - scope.min;

      if (!scope.model){
        // default model value
        scope.model = scope.min;
      } else {
        // make sure model is between the max and min values
        scope.model = Math.min(Math.max(scope.model, scope.min), scope.max);
      }

      percentage = 0;
      sliderHandleWidth = element[0].querySelector('.slider-handle').clientWidth;

      scope.onHandleMousedown = onHandleMousedown;
      scope.onSliderMouseDown = onSliderMouseDown;

      scope.$watch('model', function modelWatch() {
        setPercentage();
        moveHandle();
      });

      // manage placing the handle as well as the highlight correctly
      function moveHandle() {
        scope.$evalAsync(function() {
          scope.highlightStyle = { 'right': (100 - percentage * 100) + '%', opacity: options.highlight ? 1 : 0};
          scope.handleStyle = { 'left': (percentage * 100) + '%' };
        });
      }

      // model => view
      function setPercentage() {
        percentage = (scope.model - scope.min) / scope.range;
      }

      // view => model
      function updateModel(){
        if (options.step){
          scope.model = scope.min + Math.round(scope.range * percentage / scope.step) * scope.step;
        } else {
          scope.model = scope.min + (percentage * scope.range);
        }
      }

      // handle drag
      function onHandleMousedown(event) {
        fixEvent(event);
        var basePercentage, basePosition, mouseMove, mouseUp;
        event.preventDefault();
        basePosition = event.pageX;
        basePercentage = percentage;

        mouseMove = function(event) {
          fixEvent(event);
          percentage = basePercentage + (event.pageX - basePosition) / (element.prop('clientWidth') - sliderHandleWidth);
          // don't allow extending beyond slider size
          percentage < 0 && (percentage = 0);
          percentage > 1 && (percentage = 1);
          moveHandle();
        };

        mouseUp = function() {
          $document.off('mousemove', mouseMove);
          $document.off('mouseup', mouseUp);
          updateModel();
          setPercentage();
          moveHandle();
        };

        $document.on('mousemove', mouseMove);
        $document.on('mouseup', mouseUp);
      }

      // slider click
      function onSliderMouseDown(event){
        fixEvent(event);
        event.preventDefault();
        var sliderWidth = element.prop('clientWidth');
        var sliderPosition = element[0].getBoundingClientRect().left;

        percentage = (event.pageX - sliderPosition) / (sliderWidth - sliderHandleWidth);
        updateModel();
        setPercentage();
        moveHandle();
      }

      // fix IE8 events (missing pageX) - from jquery
      function fixEvent(event){
        var eventDoc, doc, body;
        // Calculate pageX/Y if missing and clientX/Y available
        if ( event.pageX == null && event.clientX != null ) {
          eventDoc = event.target.ownerDocument || document;
          doc = eventDoc.documentElement;
          body = eventDoc.body;

          event.pageX = event.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
          event.pageY = event.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
        }
      }
    }
  };
});
