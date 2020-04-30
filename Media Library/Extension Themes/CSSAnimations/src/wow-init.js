const WOW = require('./wow');
require('animate.css');

XA.component.wow = (function ($) {
 
    var api = {};
 
    api.init = function () {
        new WOW().init();        
    };
 
    return api;
}(jQuery, document));
 
XA.register("wow", XA.component.wow);

