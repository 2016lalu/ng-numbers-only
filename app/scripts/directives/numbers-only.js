'use strict';

angular.module('keepr.ngNumbersOnly')
.directive('numbersOnly', function() {
  return {
    require: 'ngModel',
    scope: {
      precision: '@'
    },
    link: function(scope, element, attrs, modelCtrl) {
      var currencyDigitPrecision = scope.precision;

      var countDecimalLength = function (number) {
         var str = '' + number;
         var index = str.indexOf('.');
         if (index >= 0) {
           return str.length - index - 1;
         } else {
           return 0;
         }
      };

      var currencyDigitLengthIsInvalid = function(inputValue) {
        if (!inputValue) {
          inputValue = 0;
        }
        return countDecimalLength(inputValue) > currencyDigitPrecision;
      };

      var parseNumber = function(inputValue) {
        if (!inputValue) {
          return null;
        }

        inputValue = inputValue.toString().match(/-?(\d+|\d+.\d+|.\d+)([eE][-+]?\d+)?/g).join('');

        if (inputValue.match(/(e|E|-|\+)/) ) {
          inputValue = parseFloat(parseFloat(inputValue).toFixed(20).replace(/0+$/,'')).toFixed(2);
        }

        if (!!currencyDigitPrecision && currencyDigitLengthIsInvalid(inputValue)) {
          inputValue = parseFloat(inputValue).toFixed(currencyDigitPrecision);
          modelCtrl.$viewValue = inputValue;
        }
        return inputValue;
      };

      var isAnAcceptedEventCharCodeCase = function(charCode) {
        var isANumberEventKeycode = '0123456789'.indexOf(charCode) !== -1;
        var isACommaEventKeycode = charCode === ',';
        var isADotEventKeycode = charCode === '.';
        return isANumberEventKeycode || isACommaEventKeycode || isADotEventKeycode;
      };

      var onKeypressEventHandler = function(evt) {

        var charCode = String.fromCharCode(evt.which || event.keyCode);

        var forceRenderComponent = false;
        forceRenderComponent = currencyDigitLengthIsInvalid(modelCtrl.$viewValue);

        var isAnAcceptedCase = isAnAcceptedEventCharCodeCase(charCode);

        if (!isAnAcceptedCase) {
          evt.preventDefault();
        }

        if (forceRenderComponent) {
          modelCtrl.$render(modelCtrl.$viewValue);
        }

        return isAnAcceptedCase;
      };

      var onBlurEventHandler = function() {
        modelCtrl.$render(modelCtrl.$viewValue);
      };

      element.on('keypress', onKeypressEventHandler);
      element.on('blur', onBlurEventHandler);

      modelCtrl.$render = function(inputValue) {
        return element.val(parseNumber(inputValue));
      };

      modelCtrl.$parsers.push(function(inputValue) {

        if (!inputValue) {
          return inputValue;
        }

        var transformedInput;
        modelCtrl.$setValidity('number', true);
        transformedInput = parseNumber(inputValue);

        if (transformedInput !== inputValue) {

          modelCtrl.$viewValue = transformedInput;
          modelCtrl.$commitViewValue();
          modelCtrl.$render(transformedInput);
        }
        return transformedInput;
      });
    }
  };
});
