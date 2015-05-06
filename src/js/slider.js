(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        var app = angular.module('pi', []);
        app.directive('piSlider', factory(root.angular));
    }
}(this, function () {
  var SLIDER_CHANGE_EVENT = 'slider:change';

  sliderDirective.$inject = ["$document", "$sce"];
  function sliderDirective($document) {
    return {
      scope: {
        options: '=piSliderOptions'
      },
      replace: true,
      require: 'ngModel',
      template: ['<div class="slider" ng-mousedown="onSliderMouseDown($event)">',
            '<div class="slider-label-left">{{options.leftLabel}}</div>',
            '<div class="slider-label-right">{{options.rightLabel}}</div>',
            '<div class="slider-container">',
              '<div class="slider-bar">',
                '<div class="slider-bar-highlight" ng-style="highlightStyle"></div>',
              '</div>',
              '<div class="slider-bar-stub"></div>',
              '<div class="slider-handle" ng-mousedown="onHandleMousedown($event)" ng-style="handleStyle"></div>',
            '</div>',
            '<ul class="slider-pips">',
                '<li ng-repeat="i in getNumber(steps) track by $index" ng-style="{width: pipWidth + \'%\'}"></li>',
            '</ul>',
            '<ul class="slider-labels">',
                '<li ng-repeat="label in labels track by $index" ng-style="{width: labelsWidth + \'%\'}">{{label}}</li>',
            '</ul>',
          '</div>'].join('\n'),

      link: function(scope, element, attr, ngModel) {
        var sliderHandleWidth;
        var options = scope.options || {};

        sliderHandleWidth = element[0].querySelector('.slider-handle').clientWidth;

        scope.ngModel = ngModel;

        scope.steps = options.steps || 0;
        scope.min = options.min || 0;
        scope.max = options.max || (scope.min + 100);
        scope.range = scope.max - scope.min;
        scope.pipWidth = options.steps && 100/options.steps;
        scope.labels = options.labels;
        scope.labelsWidth = options.labels && 100 / options.labels.length;

        ngModel.$isEmpty = isEmpty;
        ngModel.$render = renderView;
        ngModel.$formatters.push(toPercentage);
        ngModel.$parsers.push(fromPercentage);

        scope.onHandleMousedown = onHandleMousedown;
        scope.onSliderMouseDown = onSliderMouseDown;

        // helper for ngRepeat
        // http://stackoverflow.com/questions/16824853/way-to-ng-repeat-defined-number-of-times-instead-of-repeating-over-array
        scope.getNumber = function getNumber(num){return new Array(num);};

        function setValue(percentage){
          ngModel.$setViewValue(percentage);
          ngModel.$render();
        }

        // limit percenatge by step size
        function steppedPercentage(percentage){
          if (!scope.steps || ngModel.$isEmpty(percentage)){
            return percentage;
          }

          return Math.round(percentage * scope.steps) / scope.steps;
        }

        // manage placing the handle as well as the highlight correctly
        function renderView() {
          var percentage = steppedPercentage(ngModel.$viewValue);
          var showHandle = !isNaN(percentage);
          var showHighlight = showHandle && options.highlight;
          scope.highlightStyle = { right: (100 - percentage * 100) + '%', opacity: +showHighlight};
          scope.handleStyle = { left: (percentage * 100) + '%', opacity: +showHandle};
        }

        // formater model => view
        function toPercentage(modelValue){
          // if this isn't a number we can't compute percentage...
          if (ngModel.$isEmpty(modelValue)){
            return NaN;
          }

          // limit model size
          modelValue = Math.min(Math.max(modelValue, scope.min), scope.max);
          return (modelValue - scope.min) / scope.range;
        }

        // parser view => model
        function fromPercentage(percentage){
          return +(scope.min + (steppedPercentage(percentage) * scope.range)).toFixed(4);
        }

        // handle drag
        function onHandleMousedown(event) {
          fixEvent(event);
          var basePercentage, basePosition;
          event.preventDefault();
          event.stopPropagation(); // prevent propogation to slider so that change is fired for the beginin of a drag interaction
          basePosition = event.pageX;
          basePercentage = ngModel.$viewValue;

          $document.on('mousemove', mouseMove);
          $document.on('mouseup', mouseUp);

          // drag
          function mouseMove(event) {
            fixEvent(event);
            var percentage = basePercentage + (event.pageX - basePosition) / (element.prop('clientWidth') - sliderHandleWidth);
            // don't allow extending beyond slider size
            percentage = Math.min(percentage, 1);
            percentage = Math.max(percentage, 0);

            scope.$apply(function(){
              setValue(percentage);
            });
          }

          // drop
          function mouseUp() {
            $document.off('mousemove', mouseMove);
            $document.off('mouseup', mouseUp);
            scope.$emit(SLIDER_CHANGE_EVENT, ngModel.$viewValue); // emit only on mouse drop
          }
        }

        // slider click
        function onSliderMouseDown(event){
          fixEvent(event);
          event.preventDefault();
          var sliderWidth = element.prop('clientWidth');
          var sliderPosition = element[0].getBoundingClientRect().left;
          var percentage = (event.pageX - sliderPosition) / (sliderWidth - sliderHandleWidth);
          // auto "$apply" by ng-mousedown
          setValue(percentage);
          scope.$emit(SLIDER_CHANGE_EVENT, ngModel.$viewValue);
        }


      }
    };
  }

  return sliderDirective;

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

  function isEmpty(n){
    return isNaN(parseFloat(n)) || !isFinite(n);
  }
}));


