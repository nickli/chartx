define("canvax/event/EventDispatcher",["canvax/core/Base","canvax/event/EventManager"],function(a,b){var c=function(){arguments.callee.superclass.constructor.call(this,name)};return a.creatClass(c,b,{on:function(a,b){return this._addEventListener(a,b),this},addEventListener:function(a,b){return this._addEventListener(a,b),this},un:function(a,b){return this._removeEventListener(a,b),this},removeEventListener:function(a,b){return this._removeEventListener(a,b),this},removeEventListenerByType:function(a){return this._removeEventListenerByType(a),this},removeAllEventListeners:function(){return this._removeAllEventListeners(),this},fire:function(a,b){var c=b||{},d=this;_.isObject(a)&&a.type&&(c=_.extend(c,a),a=a.type);var e=c?c.currentTarget:null;return _.each(a.split(" "),function(a){var b=null;c?(b=c.type,c.type=a):c={type:a},c.currentTarget=d,d.dispatchEvent(c),b&&(c.type=b)}),c.currentTarget=e,this},dispatchEvent:function(a){if(this instanceof DisplayObjectContainer&&a.point){var b=this.getObjectsUnderPoint(a.point,1)[0];return void(b&&b.dispatchEvent(a))}{if(!this.context||"mouseover"!=a.type){if(this._dispatchEvent(a),this.context&&"mouseout"==a.type&&this._hoverClass){var c=this.getStage().parent;this._hoverClass=!1,c._hoverStage.removeChildById(this.id),this._globalAlpha&&(this.context.globalAlpha=this._globalAlpha,delete this._globalAlpha)}return this}var d=this._heartBeatNum,e=this.context.globalAlpha;if(this._dispatchEvent(a),d!=this._heartBeatNum&&(this._hoverClass=!0,this.hoverClone)){var c=this.getStage().parent,f=this.clone(!0);f._transform=this.getConcatenatedMatrix(),c._hoverStage.addChildAt(f,0),this._globalAlpha=e,this.context.globalAlpha=0}}},hasEvent:function(a){return this._hasEventListener(a)},hasEventListener:function(a){return this._hasEventListener(a)},hover:function(a,b){return this.on("mouseover",a),this.on("mouseout",b),this},once:function(a,b){return this.on(a,function(){b.apply(this,arguments),this.un(a,arguments.callee)}),this}}),c});