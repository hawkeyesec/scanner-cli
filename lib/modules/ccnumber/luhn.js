'use strict';

module.exports = (function(){
    function validate(cardNumber){
        var trimmed = String(cardNumber).replace(/[\s]/g, "")
            , length = trimmed.length
            , odd = false
            , total = 0
            , calc
            , calc2;

            if (length === 0){
                return true;
            }

            if (!/^[0-9]+$/.test(trimmed)) {
                return false;
            }

            for (var i = length; i > 0; i--) {
                calc = parseInt(trimmed.charAt(i - 1));
                if (!odd) {
                    total += calc;
                } else {
                    calc2 = calc * 2;

                    switch (calc2) {
                    case 10: calc2 = 1; break;
                    case 12: calc2 = 3; break;
                    case 14: calc2 = 5; break;
                    case 16: calc2 = 7; break;
                    case 18: calc2 = 9; break;
                    default: calc2 = calc2;
                    }
                    total += calc2;
                }
                odd = !odd;
            }

            return ((total % 10) === 0);
        }

        return {
            validate: validate
        };
} ());
