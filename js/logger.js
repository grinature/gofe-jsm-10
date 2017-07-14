/* jshint esversion: 6 */
/* exported oLogger */

'use strict';


// debugger;

// It is like a module pattern
let oLogger = ( function() {
    let isSysLog = true, // TRUE, by default
        sysLogPrefix = 'SysLog ',
        logLevel = 'INFO';  // INFO (* default), SYSTEM, ERROR

    return {

        log : function(message) {
            if(isSysLog) {
                console.log(sysLogPrefix + '{' + logLevel + '} :: ' + message);
                return true;
            }
            return false;
        },

        logOff : function () {
            return ( isSysLog = false );
        },
        logOn : function () {
            return ( isSysLog = true );
        }

    };
}() );
