define("components/coord/polar",["./index","canvax","./ui_polar/index"],function(t,o,e){"use strict";var n,r=this&&this.__extends||(n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,o){t.__proto__=o}||function(t,o){for(var e in o)o.hasOwnProperty(e)&&(t[e]=o[e])},function(t,o){function e(){this.constructor=t}n(t,o),t.prototype=null===o?Object.create(o):(e.prototype=o.prototype,new e)});o.__esModule=!0;var i=t("./index"),s=t("canvax"),a=t("./ui_polar/index"),c=s.default._,f=function(t){function o(o,e,n,r,i){var s=t.call(this,o,e,n,r,i)||this;return s.CoordComponents=a.default,s._coord=null,s}return r(o,t),o.prototype.setDefaultOpts=function(t){if(this.coord={rAxis:{field:[]}},c.isArray(this.coord.rAxis.field)||(this.coord.rAxis.field=[this.coord.rAxis.field]),t.graphs){var o=[];c.each(t.graphs,function(t){if(t.field){var e=t.field;c.isArray(e)||(e=[e]),o=o.concat(e)}})}return this.coord.rAxis.field=this.coord.rAxis.field.concat(o),t},o.prototype.getLegendData=function(){var t=[];return c.each(this._graphs,function(o){c.each(o.getLegendData(),function(o){if(!c.find(t,function(t){return t.name==o.name})){var e=c.extend(!0,{},o);e.color=o.fillStyle||o.color||o.style,t.push(e)}})}),t},o.prototype.setTipsInfo=function(t){if(t.eventInfo=this._coord.getTipsInfoHandler(t),!t.eventInfo.nodes||!t.eventInfo.nodes.length){var o=[],e=t.eventInfo.aAxis.ind;c.each(this._graphs,function(t){o=o.concat(t.getNodesAt(e))}),t.eventInfo.nodes=o}},o}(i.default);o.default=f});