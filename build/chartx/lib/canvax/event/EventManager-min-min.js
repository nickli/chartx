define("canvax/event/EventManager",[],function(){var a=function(){this._eventMap={}};return a.prototype={_addEventListener:function(a,b){if("function"!=typeof b)return!1;var c=!0,d=this;return _.each(a.split(" "),function(a){var e=d._eventMap[a];return e?-1==_.indexOf(e,b)?(e.push(b),d._eventEnabled=!0,!0):void(c=!1):(e=d._eventMap[a]=[],e.push(b),d._eventEnabled=!0,!0)}),c},_removeEventListener:function(a,b){if(1==arguments.length)return this.removeEventListenerByType(a);var c=this._eventMap[a];if(!c)return!1;for(var d=0;d<c.length;d++){var e=c[d];if(e===b)return c.splice(d,1),0==c.length&&(delete this._eventMap[a],_.isEmpty(this._eventMap)&&(this._eventEnabled=!1)),!0}return!1},_removeEventListenerByType:function(a){var b=this._eventMap[a];return!b&&(delete this._eventMap[a],_.isEmpty(this._eventMap)&&(this._eventEnabled=!1),!0)},_removeAllEventListeners:function(){this._eventMap={},this._eventEnabled=!1},_dispatchEvent:function(a){var b=this._eventMap[a.type];if(b){a.target||(a.target=this),b=b.slice();for(var c=0;c<b.length;c++){var d=b[c];"function"==typeof d&&d.call(this,a)}}return a._stopPropagation||this.parent&&(a.currentTarget=this.parent,this.parent._dispatchEvent(a)),!0},_hasEventListener:function(a){var b=this._eventMap[a];return null!=b&&b.length>0}},a});