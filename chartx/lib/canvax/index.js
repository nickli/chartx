define(
    "canvax/animation/AnimationFrame", [
        "canvax/animation/Tween",
        "canvax/core/Base"
    ],
    function(Tween, Base) {
        window.Tween = Tween;
        /**
         * 设置 AnimationFrame begin
         */
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        };
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        };
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        };

        //管理所有图表的渲染任务
        var _taskList = []; //[{ id : task: }...]
        var _requestAid = null;

        function enabledAnimationFrame(){
        	if (!_requestAid) {
                _requestAid = requestAnimationFrame(function() {
                    //console.log("frame__" + _taskList.length);
                    //if ( Tween.getAll().length ) {
                    Tween.update(); //tween自己会做length判断
                    //};
                    var currTaskList = _taskList;
                    _taskList = [];
                    _requestAid = null;
                    while (currTaskList.length > 0) {
                        currTaskList.shift().task();
                    };
                });
            };
            return _requestAid;
        }; 

        /*
         * @param task 要加入到渲染帧队列中的任务
         * @result frameid
         */
        function registFrame( $frame ) {
            if (!$frame) {
                return;
            };
            _taskList.push($frame);
            return enabledAnimationFrame();
        };

        /*
         *  @param task 要从渲染帧队列中删除的任务
         */
        function destroyFrame( $frame ) {
            var d_result = false;
            for (var i = 0, l = _taskList.length; i < l; i++) {
                if (_taskList[i].id === $frame.id) {
                    d_result = true;
                    _taskList.splice(i, 1);
                    i--;
                    l--;
                };
            };
            if (_taskList.length == 0) {
                cancelAnimationFrame(_requestAid);
                _requestAid = null;
            };
            return d_result;
        };


        /* 
         * @param opt {from , to , onUpdate , onComplete , ......}
         * @result tween
         */
        function registTween(options) {
            var opt = _.extend({
                from: null,
                to: null,
                duration: 500,
                onStart: function(){},
                onUpdate: function() {},
                onComplete: function() {},
                onStop: function(){},
                repeat: 0,
                delay: 0,
                easing: 'Linear.None',
                desc: '' //动画描述，方便查找bug
            }, options);

            var tween = {};
            var tid = "tween_" + Base.getUID();
            opt.id && ( tid = tid+"_"+opt.id );

            if (opt.from && opt.to) {
                tween = new Tween.Tween( opt.from )
                .to( opt.to, opt.duration )
                .onStart(function(){
                    opt.onStart.apply( this )
                })
                .onUpdate( function(){
                	opt.onUpdate.apply( this );
                } )
                .onComplete( function() {
                    destroyFrame({
                        id: tid
                    });
                    tween._isCompleteed = true;
                    opt.onComplete.apply( this , [this] ); //执行用户的conComplete
                } )
                .onStop( function(){
                    destroyFrame({
                        id: tid
                    });
                    tween._isStoped = true;
                    opt.onStop.apply( this , [this] );
                } )
                .repeat( opt.repeat )
                .delay( opt.delay )
                .easing( Tween.Easing[opt.easing.split(".")[0]][opt.easing.split(".")[1]] )
                
                tween.id = tid;
                tween.start();

                function animate() {

                    if ( tween._isCompleteed || tween._isStoped ) {
                    	tween = null;
                        return;
                    };
                    registFrame({
                        id: tid,
                        task: animate,
                        desc: opt.desc,
                        tween: tween
                    });
                };
                animate();

            };
            return tween;
        };
        /*
         * @param tween
         * @result void(0)
         */
        function destroyTween(tween , msg) {
            tween.stop();
        };

        return {
            registFrame: registFrame,
            destroyFrame: destroyFrame,
            registTween: registTween,
            destroyTween: destroyTween
        };
    }
);
define("canvax/animation/Tween", [], function() {

	/**
	 * Tween.js - Licensed under the MIT license
	 * https://github.com/tweenjs/tween.js
	 * ----------------------------------------------
	 *
	 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
	 * Thank you all, you're awesome!
	 */

	 var TWEEN = TWEEN || (function () {

	 	var _tweens = [];

	 	return {

	 		getAll: function () {

	 			return _tweens;

	 		},

	 		removeAll: function () {

	 			_tweens = [];

	 		},

	 		add: function (tween) {

	 			_tweens.push(tween);

	 		},

	 		remove: function (tween) {

				var i = _.indexOf( _tweens , tween );//_tweens.indexOf(tween);

				if (i !== -1) {
					_tweens.splice(i, 1);
				}

			},

			update: function (time, preserve) {

				if (_tweens.length === 0) {
					return false;
				}

				var i = 0;

				time = time !== undefined ? time : TWEEN.now();

				while (i < _tweens.length) {

	                /* old 
					if (_tweens[i].update(time) || preserve) {
						i++;
					} else {
						_tweens.splice(i, 1);
					}
					*/

	                //new code
	                //in real world, tween.update has chance to remove itself, so we have to handle this situation.
	                //in certain cases, onUpdateCallback will remove instances in _tweens, which make _tweens.splice(i, 1) fail
	                //@litao.lt@alibaba-inc.com
	                var _t = _tweens[i];
	                var _updateRes = _t.update(time);

	                if( !_tweens[i] ){
	                	break;
	                };
	                if ( _t === _tweens[i] ) {
	                	if ( _updateRes || preserve ) {
	                		i++;
	                	} else {
	                		_tweens.splice(i, 1);
	                	}
	                }

	            }

	            return true;

	        }
	    };

	})();


	// Include a performance.now polyfill.
	// In node.js, use process.hrtime.
	if (typeof (window) === 'undefined' && typeof (process) !== 'undefined') {
		TWEEN.now = function () {
			var time = process.hrtime();

			// Convert [seconds, nanoseconds] to milliseconds.
			return time[0] * 1000 + time[1] / 1000000;
		};
	}
	// In a browser, use window.performance.now if it is available.
	else if (typeof (window) !== 'undefined' &&
		window.performance !== undefined &&
		window.performance.now !== undefined) {
		// This must be bound, because directly assigning this function
		// leads to an invocation exception in Chrome.
		TWEEN.now = window.performance.now.bind(window.performance);
	}
	// Use Date.now if it is available.
	else if (Date.now !== undefined) {
		TWEEN.now = Date.now;
	}
	// Otherwise, use 'new Date().getTime()'.
	else {
		TWEEN.now = function () {
			return new Date().getTime();
		};
	}


	TWEEN.Tween = function (object) {

		var _object = object;
		var _valuesStart = {};
		var _valuesEnd = {};
		var _valuesStartRepeat = {};
		var _duration = 1000;
		var _repeat = 0;
		var _repeatDelayTime;
		var _yoyo = false;
		var _isPlaying = false;
		var _reversed = false;
		var _delayTime = 0;
		var _startTime = null;
		var _easingFunction = TWEEN.Easing.Linear.None;
		var _interpolationFunction = TWEEN.Interpolation.Linear;
		var _chainedTweens = [];
		var _onStartCallback = null;
		var _onStartCallbackFired = false;
		var _onUpdateCallback = null;
		var _onCompleteCallback = null;
		var _onStopCallback = null;

		this.to = function (properties, duration) {

			_valuesEnd = properties;

			if (duration !== undefined) {
				_duration = duration;
			}

			return this;

		};

		this.start = function (time) {

			TWEEN.add(this);

			_isPlaying = true;

			_onStartCallbackFired = false;

			_startTime = time !== undefined ? time : TWEEN.now();
			_startTime += _delayTime;

			for (var property in _valuesEnd) {

				// Check if an Array was provided as property value
				if (_valuesEnd[property] instanceof Array) {

					if (_valuesEnd[property].length === 0) {
						continue;
					}

					// Create a local copy of the Array with the start value at the front
					_valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);

				}

				// If `to()` specifies a property that doesn't exist in the source object,
				// we should not set that property in the object
				if (_object[property] === undefined) {
					continue;
				}

				// Save the starting value.
				_valuesStart[property] = _object[property];

				if ((_valuesStart[property] instanceof Array) === false) {
					_valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
				}

				_valuesStartRepeat[property] = _valuesStart[property] || 0;

			}

			return this;

		};

		this.stop = function () {

			if (!_isPlaying) {
				return this;
			}

			TWEEN.remove(this);
			_isPlaying = false;

			if (_onStopCallback !== null) {
				_onStopCallback.call(_object, _object);
			}

			this.stopChainedTweens();
			return this;

		};

		this.end = function () {

			this.update(_startTime + _duration);
			return this;

		};

		this.stopChainedTweens = function () {

			for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
				_chainedTweens[i].stop();
			}

		};

		this.delay = function (amount) {

			_delayTime = amount;
			return this;

		};

		this.repeat = function (times) {

			_repeat = times;
			return this;

		};

		this.repeatDelay = function (amount) {

			_repeatDelayTime = amount;
			return this;

		};

		this.yoyo = function (yoyo) {

			_yoyo = yoyo;
			return this;

		};


		this.easing = function (easing) {

			_easingFunction = easing;
			return this;

		};

		this.interpolation = function (interpolation) {

			_interpolationFunction = interpolation;
			return this;

		};

		this.chain = function () {

			_chainedTweens = arguments;
			return this;

		};

		this.onStart = function (callback) {

			_onStartCallback = callback;
			return this;

		};

		this.onUpdate = function (callback) {

			_onUpdateCallback = callback;
			return this;

		};

		this.onComplete = function (callback) {

			_onCompleteCallback = callback;
			return this;

		};

		this.onStop = function (callback) {

			_onStopCallback = callback;
			return this;

		};

		this.update = function (time) {

			var property;
			var elapsed;
			var value;

			if (time < _startTime) {
				return true;
			}

			if (_onStartCallbackFired === false) {

				if (_onStartCallback !== null) {
					_onStartCallback.call(_object, _object);
				}

				_onStartCallbackFired = true;
			}

			elapsed = (time - _startTime) / _duration;
			elapsed = elapsed > 1 ? 1 : elapsed;

			value = _easingFunction(elapsed);

			for (property in _valuesEnd) {

				// Don't update properties that do not exist in the source object
				if (_valuesStart[property] === undefined) {
					continue;
				}

				var start = _valuesStart[property] || 0;
				var end = _valuesEnd[property];

				if (end instanceof Array) {

					_object[property] = _interpolationFunction(end, value);

				} else {

					// Parses relative end values with start as base (e.g.: +10, -3)
					if (typeof (end) === 'string') {

						if (end.charAt(0) === '+' || end.charAt(0) === '-') {
							end = start + parseFloat(end);
						} else {
							end = parseFloat(end);
						}
					}

					// Protect against non numeric properties.
					if (typeof (end) === 'number') {
						_object[property] = start + (end - start) * value;
					}

				}

			}

			if (_onUpdateCallback !== null) {
				_onUpdateCallback.call(_object, value);
			}

			if (elapsed === 1) {

				if (_repeat > 0) {

					if (isFinite(_repeat)) {
						_repeat--;
					}

					// Reassign starting values, restart by making startTime = now
					for (property in _valuesStartRepeat) {

						if (typeof (_valuesEnd[property]) === 'string') {
							_valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property]);
						}

						if (_yoyo) {
							var tmp = _valuesStartRepeat[property];

							_valuesStartRepeat[property] = _valuesEnd[property];
							_valuesEnd[property] = tmp;
						}

						_valuesStart[property] = _valuesStartRepeat[property];

					}

					if (_yoyo) {
						_reversed = !_reversed;
					}

					if (_repeatDelayTime !== undefined) {
						_startTime = time + _repeatDelayTime;
					} else {
						_startTime = time + _delayTime;
					}

					return true;

				} else {

					if (_onCompleteCallback !== null) {

						_onCompleteCallback.call(_object, _object);
					}

					for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
						// Make the chained tweens start exactly at the time they should,
						// even if the `update()` method was called way past the duration of the tween
						_chainedTweens[i].start(_startTime + _duration);
					}

					return false;

				}

			}

			return true;

		};

	};


	TWEEN.Easing = {

		Linear: {

			None: function (k) {

				return k;

			}

		},

		Quadratic: {

			In: function (k) {

				return k * k;

			},

			Out: function (k) {

				return k * (2 - k);

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return 0.5 * k * k;
				}

				return - 0.5 * (--k * (k - 2) - 1);

			}

		},

		Cubic: {

			In: function (k) {

				return k * k * k;

			},

			Out: function (k) {

				return --k * k * k + 1;

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return 0.5 * k * k * k;
				}

				return 0.5 * ((k -= 2) * k * k + 2);

			}

		},

		Quartic: {

			In: function (k) {

				return k * k * k * k;

			},

			Out: function (k) {

				return 1 - (--k * k * k * k);

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return 0.5 * k * k * k * k;
				}

				return - 0.5 * ((k -= 2) * k * k * k - 2);

			}

		},

		Quintic: {

			In: function (k) {

				return k * k * k * k * k;

			},

			Out: function (k) {

				return --k * k * k * k * k + 1;

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return 0.5 * k * k * k * k * k;
				}

				return 0.5 * ((k -= 2) * k * k * k * k + 2);

			}

		},

		Sinusoidal: {

			In: function (k) {

				return 1 - Math.cos(k * Math.PI / 2);

			},

			Out: function (k) {

				return Math.sin(k * Math.PI / 2);

			},

			InOut: function (k) {

				return 0.5 * (1 - Math.cos(Math.PI * k));

			}

		},

		Exponential: {

			In: function (k) {

				return k === 0 ? 0 : Math.pow(1024, k - 1);

			},

			Out: function (k) {

				return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

			},

			InOut: function (k) {

				if (k === 0) {
					return 0;
				}

				if (k === 1) {
					return 1;
				}

				if ((k *= 2) < 1) {
					return 0.5 * Math.pow(1024, k - 1);
				}

				return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

			}

		},

		Circular: {

			In: function (k) {

				return 1 - Math.sqrt(1 - k * k);

			},

			Out: function (k) {

				return Math.sqrt(1 - (--k * k));

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return - 0.5 * (Math.sqrt(1 - k * k) - 1);
				}

				return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

			}

		},

		Elastic: {

			In: function (k) {

				if (k === 0) {
					return 0;
				}

				if (k === 1) {
					return 1;
				}

				return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);

			},

			Out: function (k) {

				if (k === 0) {
					return 0;
				}

				if (k === 1) {
					return 1;
				}

				return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;

			},

			InOut: function (k) {

				if (k === 0) {
					return 0;
				}

				if (k === 1) {
					return 1;
				}

				k *= 2;

				if (k < 1) {
					return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
				}

				return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;

			}

		},

		Back: {

			In: function (k) {

				var s = 1.70158;

				return k * k * ((s + 1) * k - s);

			},

			Out: function (k) {

				var s = 1.70158;

				return --k * k * ((s + 1) * k + s) + 1;

			},

			InOut: function (k) {

				var s = 1.70158 * 1.525;

				if ((k *= 2) < 1) {
					return 0.5 * (k * k * ((s + 1) * k - s));
				}

				return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

			}

		},

		Bounce: {

			In: function (k) {

				return 1 - TWEEN.Easing.Bounce.Out(1 - k);

			},

			Out: function (k) {

				if (k < (1 / 2.75)) {
					return 7.5625 * k * k;
				} else if (k < (2 / 2.75)) {
					return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
				} else if (k < (2.5 / 2.75)) {
					return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
				} else {
					return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
				}

			},

			InOut: function (k) {

				if (k < 0.5) {
					return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
				}

				return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

			}

		}

	};

	TWEEN.Interpolation = {

		Linear: function (v, k) {

			var m = v.length - 1;
			var f = m * k;
			var i = Math.floor(f);
			var fn = TWEEN.Interpolation.Utils.Linear;

			if (k < 0) {
				return fn(v[0], v[1], f);
			}

			if (k > 1) {
				return fn(v[m], v[m - 1], m - f);
			}

			return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

		},

		Bezier: function (v, k) {

			var b = 0;
			var n = v.length - 1;
			var pw = Math.pow;
			var bn = TWEEN.Interpolation.Utils.Bernstein;

			for (var i = 0; i <= n; i++) {
				b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
			}

			return b;

		},

		CatmullRom: function (v, k) {

			var m = v.length - 1;
			var f = m * k;
			var i = Math.floor(f);
			var fn = TWEEN.Interpolation.Utils.CatmullRom;

			if (v[0] === v[m]) {

				if (k < 0) {
					i = Math.floor(f = m * (1 + k));
				}

				return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

			} else {

				if (k < 0) {
					return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
				}

				if (k > 1) {
					return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
				}

				return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

			}

		},

		Utils: {

			Linear: function (p0, p1, t) {

				return (p1 - p0) * t + p0;

			},

			Bernstein: function (n, i) {

				var fc = TWEEN.Interpolation.Utils.Factorial;

				return fc(n) / fc(i) / fc(n - i);

			},

			Factorial: (function () {

				var a = [1];

				return function (n) {

					var s = 1;

					if (a[n]) {
						return a[n];
					}

					for (var i = n; i > 1; i--) {
						s *= i;
					}

					a[n] = s;
					return s;

				};

			})(),

			CatmullRom: function (p0, p1, p2, p3, t) {

				var v0 = (p2 - p0) * 0.5;
				var v1 = (p3 - p1) * 0.5;
				var t2 = t * t;
				var t3 = t * t2;

				return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

			}

		}

	};

	return TWEEN;

});



/* 
window.FlashCanvasOptions = {
    swfPath: "http://g.alicdn.com//thx/canvax/1.0.0/canvax/library/flashCanvas/"
};
*/
define(
    "canvax/core/Base",
    [
        "canvax/library/underscore",
        !document.createElement('canvas').getContext ? "canvax/library/flashCanvas/flashcanvas" : "" 
    ],
    function( _ , FlashCanvas ){
        
        _ = ( _ || window._ );
        var addOrRmoveEventHand = function( domHand , ieHand ){
            if( document[ domHand ] ){
                return function( el , type , fn ){
                    if( el.length ){
                        for(var i=0 ; i < el.length ; i++){
                            arguments.callee( el[i] , type , fn );
                        }
                    } else {
                        el[ domHand ]( type , fn , false );
                    }
                };
            } else {
                return function( el , type , fn ){
                    if( el.length ){
                        for(var i=0 ; i < el.length ; i++){
                            arguments.callee( el[i],type,fn );
                        }
                    } else {
                        el[ ieHand ]( "on"+type , function(){
                            return fn.call( el , window.event );
                        });
                    }
                };
            }
        };
        
        var Base = {
            mainFrameRate   : 60,//默认主帧率
            now : 0,
            // dom操作相关代码
            getEl : function(el){
                if(_.isString(el)){
                   return document.getElementById(el)
                }
                if(el.nodeType == 1){
                   //则为一个element本身
                   return el
                }
                if(el.length){
                   return el[0]
                }
                return null;
            },
            getOffset : function(el){
                var box = el.getBoundingClientRect(), 
                doc = el.ownerDocument, 
                body = doc.body, 
                docElem = doc.documentElement, 
    
                // for ie  
                clientTop = docElem.clientTop || body.clientTop || 0, 
                clientLeft = docElem.clientLeft || body.clientLeft || 0, 
    
                // In Internet Explorer 7 getBoundingClientRect property is treated as physical, 
                // while others are logical. Make all logical, like in IE8. 
                zoom = 1; 
                if (body.getBoundingClientRect) { 
                    var bound = body.getBoundingClientRect(); 
                    zoom = (bound.right - bound.left)/body.clientWidth; 
                } 
                if (zoom > 1){ 
                    clientTop = 0; 
                    clientLeft = 0; 
                } 
                var top = box.top/zoom + (window.pageYOffset || docElem && docElem.scrollTop/zoom || body.scrollTop/zoom) - clientTop, 
                    left = box.left/zoom + (window.pageXOffset|| docElem && docElem.scrollLeft/zoom || body.scrollLeft/zoom) - clientLeft; 
    
                return { 
                    top: top, 
                    left: left 
                }; 
            },
            addEvent : addOrRmoveEventHand( "addEventListener" , "attachEvent" ),
            removeEvent : addOrRmoveEventHand( "removeEventListener" , "detachEvent" ),
            //dom相关代码结束
            
            /*像素检测专用*/
            _pixelCtx   : null,
            __emptyFunc : function(){},
            //retina 屏幕优化
            _devicePixelRatio : window.devicePixelRatio || 1,
            /**
             * 创建dom
             * @param {string} id dom id 待用
             * @param {string} type : dom type， such as canvas, div etc.
             */
            _createCanvas : function(id, _width , _height) {
                var newDom = document.createElement("canvas");
    
                newDom.style.position = 'absolute';
                newDom.style.width  = _width + 'px';
                newDom.style.height = _height + 'px';
                newDom.style.left   = 0;
                newDom.style.top    = 0;
                //newDom.setAttribute('width', _width );
                //newDom.setAttribute('height', _height );
                newDom.setAttribute('width', _width * this._devicePixelRatio);
                newDom.setAttribute('height', _height * this._devicePixelRatio);
                newDom.setAttribute('id', id);
                return newDom;
            },
            canvasSupport : function() {
                return !!document.createElement('canvas').getContext;
            },
            createObject : function( proto , constructor ) {
                var newProto;
                var ObjectCreate = Object.create;
                if (ObjectCreate) {
                    newProto = ObjectCreate(proto);
                } else {
                    Base.__emptyFunc.prototype = proto;
                    newProto = new Base.__emptyFunc();
                }
                newProto.constructor = constructor;
                return newProto;
            },
            setContextStyle : function( ctx , style ){
                // 简单判断不做严格类型检测
                for(p in style){
                    if( p != "textBaseline" && ( p in ctx ) ){
                        if ( style[p] || _.isNumber( style[p] ) ) {
                            if( p == "globalAlpha" ){
                                //透明度要从父节点继承
                                ctx[p] *= style[p];
                            } else {
                                ctx[p] = style[p];
                            }
                        }
                    }
                };
                return;
            },
            creatClass : function(r, s, px){
                if (!s || !r) {
                    return r;
                }
                var sp = s.prototype, rp;
                // add prototype chain
                rp = Base.createObject(sp, r);
                r.prototype = _.extend(rp, r.prototype);
                r.superclass = Base.createObject(sp, s);
                // add prototype overrides
                if (px) {
                    _.extend(rp, px);
                }
                return r;
            },
            initElement : function( canvas ){
                if( FlashCanvas && FlashCanvas.initElement){
                    FlashCanvas.initElement( canvas );
                }
            },
            //做一次简单的opt参数校验，保证在用户不传opt的时候 或者传了opt但是里面没有context的时候报错
            checkOpt    : function(opt){
                if( !opt ){
                  return {
                    context : {
                    
                    }
                  }   
                } else if( opt && !opt.context ) {
                  opt.context = {}
                  return opt;
                } else {
                  return opt;
                }
            },
            _UID  : 0, //该值为向上的自增长整数值
            getUID:function(){
                return this._UID++;
            },
            createId : function(name) {
                //if end with a digit, then append an undersBase before appending
                var charCode = name.charCodeAt(name.length - 1);
                if (charCode >= 48 && charCode <= 57) name += "_";
                return name + Base.getUID();
            },
            /**
             * 简单的浅复制对象。
             * @param strict  当为true时只覆盖已有属性
             */
            copy: function(target, source, strict){ 
                if ( _.isEmpty(source) ){
                    return target;
                }
                for(var key in source){
                    if(!strict || target.hasOwnProperty(key) || target[key] !== undefined){
                        target[key] = source[key];
                    }
                }
                return target;
            },
            /**
             * 按照css的顺序，返回一个[上,右,下,左]
             */
            getCssOrderArr : function( r ){
                var r1; 
                var r2; 
                var r3; 
                var r4;
    
                if(typeof r === 'number') {
                    r1 = r2 = r3 = r4 = r;
                }
                else if(r instanceof Array) {
                    if (r.length === 1) {
                        r1 = r2 = r3 = r4 = r[0];
                    }
                    else if(r.length === 2) {
                        r1 = r3 = r[0];
                        r2 = r4 = r[1];
                    }
                    else if(r.length === 3) {
                        r1 = r[0];
                        r2 = r4 = r[1];
                        r3 = r[2];
                    } else {
                        r1 = r[0];
                        r2 = r[1];
                        r3 = r[2];
                        r4 = r[3];
                    }
                } else {
                    r1 = r2 = r3 = r4 = 0;
                }
                return [r1,r2,r3,r4];
            },
            setDeepExtend : function(){
                /*这里先给underscore 添加一个插件 deep-extend BEGIN*/
                //依赖underscore
                (function() {
                    var arrays, basicObjects, deepClone, deepExtend, deepExtendCouple, isBasicObject, __slice = [].slice;

                    deepClone = function(obj) {
                        var func, isArr;
                        if (!_.isObject(obj) || _.isFunction(obj)) {
                            return obj;
                        }
                        if (_.isDate(obj)) {
                            return new Date(obj.getTime());
                        }
                        if (_.isRegExp(obj)) {
                            return new RegExp(obj.source, obj.toString().replace(/.*\//, ""));
                        }
                        isArr = _.isArray(obj || _.isArguments(obj));
                        func = function(memo, value, key) {
                            if (isArr) {
                                memo.push(deepClone(value));
                            } else {
                                memo[key] = deepClone(value);
                            }
                            return memo;
                        };
                        return _.reduce(obj, func, isArr ? [] : {});
                    };

                    isBasicObject = function(object) {
                        return ( object==null || object==undefined || object.prototype === {}.prototype || object.prototype === Object.prototype) && _.isObject(object) && !_.isArray(object) && !_.isFunction(object) && !_.isDate(object) && !_.isRegExp(object) && !_.isArguments(object);
                    };

                    basicObjects = function(object) {
                        return _.filter(_.keys(object), function(key) {
                            return isBasicObject(object[key]);
                        });
                    };

                    arrays = function(object) {
                        return _.filter(_.keys(object), function(key) {
                            return _.isArray(object[key]);
                        });
                    };

                    deepExtendCouple = function(destination, source, maxDepth) {
                        if( !source ) {
                            return destination
                        }
                        var combine, recurse, sharedArrayKey, sharedArrayKeys, sharedObjectKey, sharedObjectKeys, _i, _j, _len, _len1;
                        if (maxDepth == null) {
                            maxDepth = 20;
                        }
                        if (maxDepth <= 0) {
                            console.warn('_.deepExtend(): Maximum depth of recursion hit.');
                            return _.extend(destination, source);
                        }
                        sharedObjectKeys = _.intersection(basicObjects(destination), basicObjects(source));
                        recurse = function(key) {
                            return source[key] = deepExtendCouple(destination[key], source[key], maxDepth - 1);
                        };
                        for (_i = 0, _len = sharedObjectKeys.length; _i < _len; _i++) {
                            sharedObjectKey = sharedObjectKeys[_i];
                            recurse(sharedObjectKey);
                        }
                        sharedArrayKeys = _.intersection(arrays(destination), arrays(source));
                        combine = function(key) {
                            //TODO:这里做点修改，array的话就不需要做并集了。直接整个array覆盖。因为
                            //在大部分的场景里，array的话，应该要看成是一个basicObject
                            return source[key];

                            //return source[key] = _.union(destination[key], source[key]);
                        };
                        for (_j = 0, _len1 = sharedArrayKeys.length; _j < _len1; _j++) {
                            sharedArrayKey = sharedArrayKeys[_j];
                            combine(sharedArrayKey);
                        }
                        return _.extend(destination, source);
                    };

                    deepExtend = function() {
                        var finalObj, maxDepth, objects, _i;
                        objects = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), maxDepth = arguments[_i++];
                        if (!_.isNumber(maxDepth)) {
                            objects.push(maxDepth);
                            maxDepth = 20;
                        }
                        if (objects.length <= 1) {
                            return objects[0];
                        }
                        if (maxDepth <= 0) {
                            return _.extend.apply(this, objects);
                        }
                        finalObj = objects.shift();
                        while (objects.length > 0) {
                            finalObj = deepExtendCouple(finalObj, deepClone(objects.shift()), maxDepth);
                        }
                        return finalObj;
                    };

                    _.mixin({
                        deepClone: deepClone,
                        isBasicObject: isBasicObject,
                        basicObjects: basicObjects,
                        arrays: arrays,
                        deepExtend: deepExtend
                    });

                }).call( window );

                /*deep-extend END*/
            }
        };
        Base.setDeepExtend();
        return Base
    }
);


;define(
    "canvax/core/PropertyFactory",
    [
    ],
    function(){
    //定义封装好的兼容大部分浏览器的defineProperties 的 属性工厂
        var unwatchOne = {
            "$skipArray" : 0,
            "$watch"     : 1,
            "$fire"      : 2,//主要是get set 显性设置的 触发
            "$model"     : 3,
            "$accessor"  : 4,
            "$owner"     : 5,
            //"path"       : 6, //这个应该是唯一一个不用watch的不带$的成员了吧，因为地图等的path是在太大
            "$parent"    : 7  //用于建立数据的关系链
        }
    
        function PropertyFactory(scope, model, watchMore) {
    
            var stopRepeatAssign=true;
    
            var skipArray = scope.$skipArray, //要忽略监控的属性名列表
                pmodel = {}, //要返回的对象
                accessores = {}, //内部用于转换的对象
                VBPublics = _.keys( unwatchOne ); //用于IE6-8
    
                model = model || {};//这是pmodel上的$model属性
                watchMore = watchMore || {};//以$开头但要强制监听的属性
                skipArray = _.isArray(skipArray) ? skipArray.concat(VBPublics) : VBPublics;
    
            function loop(name, val) {
                if ( !unwatchOne[name] || (unwatchOne[name] && name.charAt(0) !== "$") ) {
                    model[name] = val
                };
                var valueType = typeof val;
                if (valueType === "function") {
                    if(!unwatchOne[name]){
                      VBPublics.push(name) //函数无需要转换
                    }
                } else {
                    if (_.indexOf(skipArray,name) !== -1 || (name.charAt(0) === "$" && !watchMore[name])) {
                        return VBPublics.push(name)
                    }
                    var accessor = function(neo) { //创建监控属性或数组，自变量，由用户触发其改变
                        var value = accessor.value, preValue = value, complexValue;
                        
                        if (arguments.length) {
                            //写操作
                            //set 的 值的 类型
                            var neoType = typeof neo;
    
                            if (stopRepeatAssign) {
                                return //阻止重复赋值
                            }
                            if (value !== neo) {
                                if( neo && neoType === "object" && 
                                    !(neo instanceof Array) &&
                                    !neo.addColorStop // neo instanceof CanvasGradient
                                 ){
                                    value = neo.$model ? neo : PropertyFactory(neo , neo);
                                    complexValue = value.$model;
                                } else {//如果是其他数据类型
                                    //if( neoType === "array" ){
                                    //    value = _.clone(neo);
                                    //} else {
                                        value = neo
                                    //}
                                }
                                accessor.value = value;
                                model[name] = complexValue ? complexValue : value;//更新$model中的值
                                if (!complexValue) {
                                    pmodel.$fire && pmodel.$fire(name, value, preValue)
                                }
                                if(valueType != neoType){
                                    //如果set的值类型已经改变，
                                    //那么也要把对应的valueType修改为对应的neoType
                                    valueType = neoType;
                                }
                                var hasWatchModel = pmodel;
                                //所有的赋值都要触发watch的监听事件
                                if ( !pmodel.$watch ) {
                                  while( hasWatchModel.$parent ){
                                     hasWatchModel = hasWatchModel.$parent;
                                  }
                                }
                                if ( hasWatchModel.$watch ) {
                                  hasWatchModel.$watch.call(hasWatchModel , name, value, preValue);
                                }
                            }
                        } else {
                            //读操作
                            //读的时候，发现value是个obj，而且还没有defineProperty
                            //那么就临时defineProperty一次
                            if ( value && (valueType === "object") 
                               && !(value instanceof Array) 
                               && !value.$model
                               && !value.addColorStop) {
                                //建立和父数据节点的关系
                                value.$parent = pmodel;
                                value = PropertyFactory(value , value);
    
                                //accessor.value 重新复制为defineProperty过后的对象
                                accessor.value = value;
                            }
                            return value;
                        }
                    };
                    accessor.value = val;
                    
                    accessores[name] = {
                        set: accessor,
                        get: accessor,
                        enumerable: true
                    }
                }
            };
            
            for (var i in scope) {
                loop(i, scope[i])
            };
    
            pmodel = defineProperties(pmodel, accessores, VBPublics);//生成一个空的ViewModel
    
            _.forEach(VBPublics,function(name) {
                if (scope[name]) {//先为函数等不被监控的属性赋值
                    if(typeof scope[name] == "function" ){
                       pmodel[name] = function(){
                          scope[name].apply(this , arguments);
                       }
                    } else {
                       pmodel[name] = scope[name];
                    }
                }
            });
    
            pmodel.$model = model;
            pmodel.$accessor = accessores;
    
            pmodel.hasOwnProperty = function(name) {
                return name in pmodel.$model
            };
    
            stopRepeatAssign = false;
    
            return pmodel
        }
        var defineProperty = Object.defineProperty
            //如果浏览器不支持ecma262v5的Object.defineProperties或者存在BUG，比如IE8
            //标准浏览器使用__defineGetter__, __defineSetter__实现
            try {
                defineProperty({}, "_", {
                    value: "x"
                })
                var defineProperties = Object.defineProperties
            } catch (e) {
                if ("__defineGetter__" in Object) {
                    defineProperty = function(obj, prop, desc) {
                        if ('value' in desc) {
                            obj[prop] = desc.value
                        }
                        if ('get' in desc) {
                            obj.__defineGetter__(prop, desc.get)
                        }
                        if ('set' in desc) {
                            obj.__defineSetter__(prop, desc.set)
                        }
                        return obj
                    };
                    defineProperties = function(obj, descs) {
                        for (var prop in descs) {
                            if (descs.hasOwnProperty(prop)) {
                                defineProperty(obj, prop, descs[prop])
                            }
                        }
                        return obj
                    };
                }
            }
        //IE6-8使用VBScript类的set get语句实现
        if (!defineProperties && window.VBArray) {
            window.execScript([
                    "Function parseVB(code)",
                    "\tExecuteGlobal(code)",
                    "End Function"
                    ].join("\n"), "VBScript");
    
            function VBMediator(description, name, value) {
                var fn = description[name] && description[name].set;
                if (arguments.length === 3) {
                    fn(value);
                } else {
                    return fn();
                }
            };
            defineProperties = function(publics, description, array) {
                publics = array.slice(0);
                publics.push("hasOwnProperty");
                var className = "VBClass" + setTimeout("1"), owner = {}, buffer = [];
                buffer.push(
                        "Class " + className,
                        "\tPrivate [__data__], [__proxy__]",
                        "\tPublic Default Function [__const__](d, p)",
                        "\t\tSet [__data__] = d: set [__proxy__] = p",
                        "\t\tSet [__const__] = Me", //链式调用
                        "\tEnd Function");
                _.forEach(publics,function(name) { //添加公共属性,如果此时不加以后就没机会了
                    if (owner[name] !== true) {
                        owner[name] = true //因为VBScript对象不能像JS那样随意增删属性
                    buffer.push("\tPublic [" + name + "]") //你可以预先放到skipArray中
                    }
                });
                for (var name in description) {
                    owner[name] = true
                        buffer.push(
                                //由于不知对方会传入什么,因此set, let都用上
                                "\tPublic Property Let [" + name + "](val)", //setter
                                "\t\tCall [__proxy__]([__data__], \"" + name + "\", val)",
                                "\tEnd Property",
                                "\tPublic Property Set [" + name + "](val)", //setter
                                "\t\tCall [__proxy__]([__data__], \"" + name + "\", val)",
                                "\tEnd Property",
                                "\tPublic Property Get [" + name + "]", //getter
                                "\tOn Error Resume Next", //必须优先使用set语句,否则它会误将数组当字符串返回
                                "\t\tSet[" + name + "] = [__proxy__]([__data__],\"" + name + "\")",
                                "\tIf Err.Number <> 0 Then",
                                "\t\t[" + name + "] = [__proxy__]([__data__],\"" + name + "\")",
                                "\tEnd If",
                                "\tOn Error Goto 0",
                                "\tEnd Property")
                }
                buffer.push("End Class"); //类定义完毕
                buffer.push(
                        "Function " + className + "Factory(a, b)", //创建实例并传入两个关键的参数
                        "\tDim o",
                        "\tSet o = (New " + className + ")(a, b)",
                        "\tSet " + className + "Factory = o",
                        "End Function");
                window.parseVB(buffer.join("\r\n"));//先创建一个VB类工厂
                return  window[className + "Factory"](description, VBMediator);//得到其产品
            }
        }
        window.PropertyFactory = PropertyFactory;
        return PropertyFactory;
});
;define(
    "canvax/display/Point",
    [],
    function(){
        var Point = function(x,y){
            if(arguments.length==1 && typeof arguments[0] == 'object' ){
               var arg=arguments[0]
               if( "x" in arg && "y" in arg ){
                  this.x = arg.x*1;
                  this.y = arg.y*1;
               } else {
                  var i=0;
                  for (var p in arg){
                      if(i==0){
                        this.x = arg[p]*1;
                      } else {
                        this.y = arg[p]*1;
                        break;
                      }
                      i++;
                  }
               }
               return;
            }
            x || (x=0);
            y || (y=0);
            this.x = x*1;
            this.y = y*1;
        };
        return Point;
    }
);
;define(
    "canvax/event/CanvaxEvent",
    [
         "canvax/core/Base"
    ],
    function(EventBase){
        var CanvaxEvent = function( e ) {
            this.target = null;
            this.currentTarget = null;	
            this.params = null;

            this.type   = e.type;
            this.points = null;

            this._stopPropagation = false ; //默认不阻止事件冒泡
        }
        CanvaxEvent.prototype = {
            stopPropagation : function() {
                this._stopPropagation = true;
            }
        }
        CanvaxEvent.pageX = function(e) {
            if (e.pageX) return e.pageX;
            else if (e.clientX)
                return e.clientX + (document.documentElement.scrollLeft ?
                        document.documentElement.scrollLeft : document.body.scrollLeft);
            else return null;
        }
        CanvaxEvent.pageY = function(e) {
            if (e.pageY) return e.pageY;
            else if (e.clientY)
                return e.clientY + (document.documentElement.scrollTop ?
                        document.documentElement.scrollTop : document.body.scrollTop);
            else return null;
        }
        return CanvaxEvent;
    } 
);
;define(
    "canvax/event/EventManager",
    [ ],
    function(){
        /**
         * 构造函数.
         * @name EventDispatcher
         * @class EventDispatcher类是可调度事件的类的基类，它允许显示列表上的任何对象都是一个事件目标。
         */
        var EventManager = function() {
            //事件映射表，格式为：{type1:[listener1, listener2], type2:[listener3, listener4]}
            this._eventMap = {};
        };
    
        EventManager.prototype = { 
            /*
             * 注册事件侦听器对象，以使侦听器能够接收事件通知。
             */
            _addEventListener : function(type, listener) {
    
                if( typeof listener != "function" ){
                  //listener必须是个function呐亲
                  return false;
                }
                var addResult = true;
                var self      = this;
                if( !self._eventMap ){
                	self._eventMap = [];
                }
                _.each( type.split(" ") , function(type){
                    var map = self._eventMap[type];
                    if(!map){
                        map = self._eventMap[type] = [];
                        map.push(listener);
                        self._eventEnabled = true;
                        return true;
                    }
    
                    if(_.indexOf(map ,listener) == -1) {
                        map.push(listener);
                        self._eventEnabled = true;
                        return true;
                    }
    
                    addResult = false;
                });
                return addResult;
            },
            /**
             * 删除事件侦听器。
             */
            _removeEventListener : function(type, listener) {
                if(arguments.length == 1) return this.removeEventListenerByType(type);
    
                var map = this._eventMap[type];
                if(!map){
                    return false;
                }
    
                for(var i = 0; i < map.length; i++) {
                    var li = map[i];
                    if(li === listener) {
                        map.splice(i, 1);
                        if(map.length    == 0) { 
                            delete this._eventMap[type];
                            //如果这个如果这个时候child没有任何事件侦听
                            if(_.isEmpty(this._eventMap)){
                                //那么该元素不再接受事件的检测
                                this._eventEnabled = false;
                            }
                        }
                        return true;
                    }
                }
                
                return false;
            },
            /**
             * 删除指定类型的所有事件侦听器。
             */
            _removeEventListenerByType : function(type) {
                var map = this._eventMap[type];
                if(!map) {
                    delete this._eventMap[type];
    
                    //如果这个如果这个时候child没有任何事件侦听
                    if(_.isEmpty(this._eventMap)){
                        //那么该元素不再接受事件的检测
                        this._eventEnabled = false;
                    }
    
                    return true;
                }
                return false;
            },
            /**
             * 删除所有事件侦听器。
             */
            _removeAllEventListeners : function() {	
                this._eventMap = {};
                this._eventEnabled = false;
            },
            /**
            * 派发事件，调用事件侦听器。
            */
            _dispatchEvent : function(e) {
                var map = this._eventMap[e.type];
                
                if( map ){
                    if(!e.target) e.target = this;
                    map = map.slice();
    
                    for(var i = 0; i < map.length; i++) {
                        var listener = map[i];
                        if(typeof(listener) == "function") {
                            listener.call(this, e);
                        }
                    }
                }
    
                if( !e._stopPropagation ) {
                    //向上冒泡
                    if( this.parent ){
                        e.currentTarget = this.parent;
                        this.parent._dispatchEvent( e );
                    }
                } 
                return true;
            },
            /**
               * 检查是否为指定事件类型注册了任何侦听器。
               */
            _hasEventListener : function(type) {
                var map = this._eventMap[type];
                return map != null && map.length > 0;
            }
        }
    
        return EventManager;
    }
);
;define(
    "canvax/event/EventDispatcher",
    [
        "canvax/core/Base",
        "canvax/event/EventManager"
    ],
    function( Base ,EventManager){

        var EventDispatcher = function(){
            arguments.callee.superclass.constructor.call(this, name);
        };
      
        Base.creatClass(EventDispatcher , EventManager , {
            on : function(type, listener){
                this._addEventListener( type, listener);
                return this;
            },
            addEventListener:function(type, listener){
                this._addEventListener( type, listener);
                return this;
            },
            un : function(type,listener){
                this._removeEventListener( type, listener);
                return this;
            },
            removeEventListener:function(type,listener){
                this._removeEventListener( type, listener);
                return this;
            },
            removeEventListenerByType:function(type){
                this._removeEventListenerByType( type);
                return this;
            },
            removeAllEventListeners:function(){
                this._removeAllEventListeners();
                return this;
            },
            fire : function(eventType , event){
                //因为需要在event上面冒泡传递信息，所以还是不用clone了
                var e       = event || {};//_.clone( event );
                var me      = this;
                if( _.isObject(eventType) && eventType.type ){
                    e         = _.extend( e , eventType );
                    eventType = eventType.type;
                };
                var preCurr = e ? e.currentTarget : null;
                _.each( eventType.split(" ") , function(evt){
                    var preEventType = null;
                    if( !e ){
                        e = { type : evt };
                    } else {
                        //把原有的e.type暂存起来
                        preEventType = e.type;
                        //如果有传递e过来
                        e.type = evt;
                    };
                    e.currentTarget = me;
                    me.dispatchEvent( e );
                    if( preEventType ){
                        e.type = preEventType;
                    }
                } );
                e.currentTarget = preCurr;
                return this;
            },
            dispatchEvent:function(event){
                
                if( this instanceof DisplayObjectContainer && event.point ){
                    var target = this.getObjectsUnderPoint( event.point , 1)[0];
                    if( target ){
                        target.dispatchEvent( event );
                    }
                    return;
                };
                
                if(this.context && event.type == "mouseover"){
                    //记录dispatchEvent之前的心跳
                    var preHeartBeat = this._heartBeatNum;
                    var pregAlpha    = this.context.globalAlpha;
                    this._dispatchEvent( event );
                    if( preHeartBeat != this._heartBeatNum ){
                        this._hoverClass = true;
                        if( this.hoverClone ){
                            var canvax = this.getStage().parent;
                            //然后clone一份obj，添加到_hoverStage 中
                            var activShape = this.clone(true);                     
                            activShape._transform = this.getConcatenatedMatrix();
                            canvax._hoverStage.addChildAt( activShape , 0 ); 
                            //然后把自己隐藏了
                            this._globalAlpha = pregAlpha;
                            this.context.globalAlpha = 0;
                        }
                    }
                    return;
                };
      
                this._dispatchEvent( event );
      
                if( this.context && event.type == "mouseout"){
                    if(this._hoverClass){
                        //说明刚刚over的时候有添加样式
                        var canvax = this.getStage().parent;
                        this._hoverClass = false;
                        canvax._hoverStage.removeChildById(this.id);
                        
                        if( this._globalAlpha ){
                            this.context.globalAlpha = this._globalAlpha;
                            delete this._globalAlpha;
                        }
                    }
                }
      
                return this;
            },
            hasEvent:function(type){
                return this._hasEventListener(type);
            },
            hasEventListener:function(type){
                return this._hasEventListener(type);
            },
            hover : function( overFun , outFun ){
                this.on("mouseover" , overFun);
                this.on("mouseout"  , outFun );
                return this;
            },
            once : function(type, listener){
                this.on(type , function(){
                    listener.apply(this , arguments);
                    this.un(type , arguments.callee);
                });
                return this;
            }
        });
      
        return EventDispatcher;
      
    }
);
;define(
    "canvax/event/EventHandler", [
        "canvax/core/Base", 
        ('ontouchstart' in window) ? "canvax/event/handler/touch" : "canvax/event/handler/mouse",
        "canvax/display/Point",
        "canvax/event/CanvaxEvent"
    ],
    function(Base, Handler, Point, CanvaxEvent) {
        var EventHandler = function(canvax) {
            this.canvax = canvax;
            this.curPoints = [new Point(0, 0)] //X,Y 的 point 集合, 在touch下面则为 touch的集合，只是这个touch被添加了对应的x，y

            //当前激活的点对应的obj，在touch下可以是个数组,和上面的curPoints对应
            this.curPointsTarget = [];

            this._touching = false;
            //正在拖动，前提是_touching=true
            this._draging = false;

            //当前的鼠标状态
            this._cursor = "default";
        };
        Base.creatClass(EventHandler, Handler, {
            /*
             *@param {array} childs 
             * */
            __dispatchEventInChilds: function(e, childs) {
                if (!childs && !("length" in childs)) {
                    return false;
                }
                var me = this;
                var hasChild = false;
                _.each(childs, function(child, i) {
                    if (child) {
                        hasChild = true;
                        var ce = new CanvaxEvent(e);
                        ce.target = ce.currentTarget = child || this;
                        ce.stagePoint = me.curPoints[i];
                        ce.point = ce.target.globalToLocal(ce.stagePoint);
                        child.dispatchEvent(ce);
                    }
                });
                return hasChild;
            },
            //克隆一个元素到hover stage中去
            _clone2hoverStage: function(target, i) {
                var me = this;
                var root = me.canvax;
                var _dragDuplicate = root._hoverStage.getChildById(target.id);
                if (!_dragDuplicate) {
                    _dragDuplicate = target.clone(true);
                    _dragDuplicate._transform = target.getConcatenatedMatrix();

                    /**
                     *TODO: 因为后续可能会有手动添加的 元素到_hoverStage 里面来
                     *比如tips
                     *这类手动添加进来的肯定是因为需要显示在最外层的。在hover元素之上。
                     *所有自动添加的hover元素都默认添加在_hoverStage的最底层
                     **/

                    root._hoverStage.addChildAt(_dragDuplicate, 0);
                }
                _dragDuplicate.context.globalAlpha = target._globalAlpha;
                _dragDuplicate._dragPoint = target.globalToLocal(me.curPoints[i]);
                return _dragDuplicate;
            },
            //drag 中 的处理函数
            _dragHander: function(e, target, i) {
                var me = this;
                var root = me.canvax;
                var _dragDuplicate = root._hoverStage.getChildById(target.id);
                var gPoint = new Point(me.curPoints[i].x - _dragDuplicate._dragPoint.x, me.curPoints[i].y - _dragDuplicate._dragPoint.y);
                _dragDuplicate.context.x = gPoint.x;
                _dragDuplicate.context.y = gPoint.y;
                target.drag && target.drag(e);

                //要对应的修改本尊的位置，但是要告诉引擎不要watch这个时候的变化
                var tPoint = gPoint;
                if (target.type != "stage" && target.parent && target.parent.type != "stage") {
                    tPoint = target.parent.globalToLocal(gPoint);
                }
                target._notWatch = true;
                target.context.x = tPoint.x;
                target.context.y = tPoint.y;
                target._notWatch = false;
                //同步完毕本尊的位置
            },
            //drag结束的处理函数
            _dragEnd: function(e, target, i) {
                var me = this;
                var root = me.canvax;

                //_dragDuplicate 复制在_hoverStage 中的副本
                var _dragDuplicate = root._hoverStage.getChildById(target.id);
                _dragDuplicate.destroy();

                target.context.globalAlpha = target._globalAlpha;
            },
            _stopBubble: function(e) {
                //如果提供了事件对象，则这是一个非IE浏览器
                if (e && e.stopPropagation)
                //因此它支持W3C的stopPropagation()方法
                    e.stopPropagation();
                else
                //否则，我们需要使用IE的方式来取消事件冒泡
                    window.event.cancelBubble = true;
            },
            //阻止浏览器的默认行为
            _stopDefault: function(e) {
                //阻止默认浏览器动作(W3C)
                if (e && e.preventDefault)
                    e.preventDefault();
                //IE中阻止函数器默认动作的方式
                else
                    window.event.returnValue = false;
                return false;
            }
        });
        return EventHandler;
    }
);;define(
    "canvax/geom/Math",
    [],
    function(){
        var _cache = {
            sin : {},     //sin缓存
            cos : {}      //cos缓存
        };
        var _radians = Math.PI / 180;

        /**
         * @param angle 弧度（角度）参数
         * @param isDegrees angle参数是否为角度计算，默认为false，angle为以弧度计量的角度
         */
        function sin(angle, isDegrees) {
            angle = (isDegrees ? angle * _radians : angle).toFixed(4);
            if(typeof _cache.sin[angle] == 'undefined') {
                _cache.sin[angle] = Math.sin(angle);
            }
            return _cache.sin[angle];
        }

        /**
         * @param radians 弧度参数
         */
        function cos(angle, isDegrees) {
            angle = (isDegrees ? angle * _radians : angle).toFixed(4);
            if(typeof _cache.cos[angle] == 'undefined') {
                _cache.cos[angle] = Math.cos(angle);
            }
            return _cache.cos[angle];
        }

        /**
         * 角度转弧度
         * @param {Object} angle
         */
        function degreeToRadian(angle) {
            return angle * _radians;
        }

        /**
         * 弧度转角度
         * @param {Object} angle
         */
        function radianToDegree(angle) {
            return angle / _radians;
        }

        /*
         * 校验角度到360度内
         * @param {angle} number
         */
        function degreeTo360( angle ) {
            var reAng = (360 +  angle  % 360) % 360;//Math.abs(360 + Math.ceil( angle ) % 360) % 360;
            if( reAng == 0 && angle !== 0 ){
                reAng = 360
            }
            return reAng;
        }

        return {
            PI  : Math.PI  ,
            sin : sin      ,
            cos : cos      ,
            degreeToRadian : degreeToRadian,
            radianToDegree : radianToDegree,
            degreeTo360    : degreeTo360   
        };
 
    }
)
;define(
    "canvax/geom/HitTestPoint", [
        "canvax/geom/Math"
    ],
    function(myMath) {
        /**
         * TODO:本检测只为进一步的 详细 检测。也就是说 进过了基本的矩形范围检测后才会
         */
        var HitTestPoint = {};
        /**
         * 包含判断
         * shape : 图形
         * x : 横坐标
         * y : 纵坐标
         */
        function isInside(shape, point) {
            var x = point.x;
            var y = point.y;
            if (!shape || !shape.type) {
                // 无参数或不支持类型
                return false;
            };
            //数学运算，主要是line，brokenLine
            return _pointInShape(shape, x, y);
        };

        function _pointInShape(shape, x, y) {
            // 在矩形内则部分图形需要进一步判断
            switch (shape.type) {
                case 'line':
                    return _isInsideLine(shape.context, x, y);
                case 'brokenline':
                    return _isInsideBrokenLine(shape, x, y);
                case 'text':
                    return true;
                case 'rect':
                    return true;
                case 'circle':
                    return _isInsideCircle(shape, x, y);
                case 'ellipse':
                    return _isPointInElipse(shape, x, y);
                case 'sector':
                    return _isInsideSector(shape, x, y);
                case 'path':
                case 'droplet':
                    return _isInsidePath(shape, x, y);
                case 'polygon':
                case 'isogon':
                    return _isInsidePolygon_WindingNumber(shape, x, y);
                    //return _isInsidePolygon_CrossingNumber(shape, x, y);
            }
        };
        /**
         * !isInside
         */
        function isOutside(shape, x, y) {
            return !isInside(shape, x, y);
        };

        /**
         * 线段包含判断
         */
        function _isInsideLine(context, x, y) {
            var x0 = context.xStart;
            var y0 = context.yStart;
            var x1 = context.xEnd;
            var y1 = context.yEnd;
            var _l = Math.max(context.lineWidth , 3);
            var _a = 0;
            var _b = x0;

            if(
                (y > y0 + _l && y > y1 + _l) 
                || (y < y0 - _l && y < y1 - _l) 
                || (x > x0 + _l && x > x1 + _l) 
                || (x < x0 - _l && x < x1 - _l) 
            ){
                return false;
            }

            if (x0 !== x1) {
                _a = (y0 - y1) / (x0 - x1);
                _b = (x0 * y1 - x1 * y0) / (x0 - x1);
            } else {
                return Math.abs(x - x0) <= _l / 2;
            }

            var _s = (_a * x - y + _b) * (_a * x - y + _b) / (_a * _a + 1);
            return _s <= _l / 2 * _l / 2;
        };

        function _isInsideBrokenLine(shape, x, y) {
            var context = shape.context;
            var pointList = context.pointList;
            var lineArea;
            var insideCatch = false;
            for (var i = 0, l = pointList.length - 1; i < l; i++) {
                lineArea = {
                    xStart: pointList[i][0],
                    yStart: pointList[i][1],
                    xEnd: pointList[i + 1][0],
                    yEnd: pointList[i + 1][1],
                    lineWidth: context.lineWidth
                };
                if (!_isInsideRectangle({
                            x: Math.min(lineArea.xStart, lineArea.xEnd) - lineArea.lineWidth,
                            y: Math.min(lineArea.yStart, lineArea.yEnd) - lineArea.lineWidth,
                            width: Math.abs(lineArea.xStart - lineArea.xEnd) + lineArea.lineWidth,
                            height: Math.abs(lineArea.yStart - lineArea.yEnd) + lineArea.lineWidth
                        },
                        x, y
                    )) {
                    // 不在矩形区内跳过
                    continue;
                }
                insideCatch = _isInsideLine(lineArea, x, y);
                if (insideCatch) {
                    break;
                }
            }
            return insideCatch;
        };


        /**
         * 矩形包含判断
         */
        function _isInsideRectangle(shape, x, y) {
            if (x >= shape.x && x <= (shape.x + shape.width) && y >= shape.y && y <= (shape.y + shape.height)) {
                return true;
            }
            return false;
        };

        /**
         * 圆形包含判断
         */
        function _isInsideCircle(shape, x, y, r) {
            var context = shape.context;
            !r && (r = context.r);
            r+= context.lineWidth;
            return (x * x + y * y) < r * r;
        };

        /**
         * 扇形包含判断
         */
        function _isInsideSector(shape, x, y) {
            var context = shape.context
            if (!_isInsideCircle(shape, x, y) || (context.r0 > 0 && _isInsideCircle(shape, x, y, context.r0))) {
                // 大圆外或者小圆内直接false
                return false;
            } else {
                // 判断夹角
                var startAngle = myMath.degreeTo360(context.startAngle); // 起始角度[0,360)
                var endAngle = myMath.degreeTo360(context.endAngle); // 结束角度(0,360]

                //计算该点所在的角度
                var angle = myMath.degreeTo360((Math.atan2(y, x) / Math.PI * 180) % 360);

                var regIn = true; //如果在start和end的数值中，end大于start而且是顺时针则regIn为true
                if ((startAngle > endAngle && !context.clockwise) || (startAngle < endAngle && context.clockwise)) {
                    regIn = false; //out
                }
                //度的范围，从小到大
                var regAngle = [
                    Math.min(startAngle, endAngle),
                    Math.max(startAngle, endAngle)
                ];

                var inAngleReg = angle > regAngle[0] && angle < regAngle[1];
                return (inAngleReg && regIn) || (!inAngleReg && !regIn);
            }
        };

        /*
         *椭圆包含判断
         * */
        function _isPointInElipse(shape, x, y) {
            var context = shape.context;
            var center = {
                x: 0,
                y: 0
            };
            //x半径
            var XRadius = context.hr;
            var YRadius = context.vr;

            var p = {
                x: x,
                y: y
            };

            var iRes;

            p.x -= center.x;
            p.y -= center.y;

            p.x *= p.x;
            p.y *= p.y;

            XRadius *= XRadius;
            YRadius *= YRadius;

            iRes = YRadius * p.x + XRadius * p.y - XRadius * YRadius;

            return (iRes < 0);
        };

        /**
         * 多边形包含判断 Nonzero Winding Number Rule
         */

        function _isInsidePolygon_WindingNumber(shape, x, y) {
            var context = shape.context ? shape.context : shape;
            var poly = _.clone(context.pointList); //poly 多边形顶点，数组成员的格式同 p
            poly.push(poly[0]); //记得要闭合
            var wn = 0;
            for (var shiftP, shift = poly[0][1] > y, i = 1; i < poly.length; i++) {
                //先做线的检测，如果是在两点的线上，就肯定是在认为在图形上
                var inLine = _isInsideLine({
                    xStart : poly[i-1][0],
                    yStart : poly[i-1][1],
                    xEnd   : poly[i][0],
                    yEnd   : poly[i][1],
                    lineWidth : (context.lineWidth || 1)
                } , x , y);
                if ( inLine ){
                    return true;
                };
                //如果有fillStyle ， 那么肯定需要做面的检测
                if (context.fillStyle) {
                    shiftP = shift;
                    shift = poly[i][1] > y;
                    if (shiftP != shift) {
                        var n = (shiftP ? 1 : 0) - (shift ? 1 : 0);
                        if (n * ((poly[i - 1][0] - x) * (poly[i][1] - y) - (poly[i - 1][1] - y) * (poly[i][0] - x)) > 0) {
                            wn += n;
                        }
                    };
                }
            };
            return wn;
        };

        /**
         * 路径包含判断，依赖多边形判断
         */
        function _isInsidePath(shape, x, y) {
            var context = shape.context;
            var pointList = context.pointList;
            var insideCatch = false;
            for (var i = 0, l = pointList.length; i < l; i++) {
                insideCatch = _isInsidePolygon_WindingNumber({
                    pointList: pointList[i],
                    lineWidth: context.lineWidth,
                    fillStyle: context.fillStyle
                }, x, y);
                if (insideCatch) {
                    break;
                }
            }
            return insideCatch;
        };
        HitTestPoint = {
            isInside: isInside,
            isOutside: isOutside
        };
        return HitTestPoint;
    }
);;define(
    "canvax/geom/Matrix",
    [
        "canvax/core/Base"
    ],
    function(Base){
  
        var Matrix = function(a, b, c, d, tx, ty){
            this.a = a != undefined ? a : 1;
            this.b = b != undefined ? b : 0;
            this.c = c != undefined ? c : 0;
            this.d = d != undefined ? d : 1;
            this.tx = tx != undefined ? tx : 0;
            this.ty = ty != undefined ? ty : 0;
        };
    
        Base.creatClass( Matrix , function(){} , {
            concat : function(mtx){
                var a = this.a;
                var c = this.c;
                var tx = this.tx;
    
                this.a = a * mtx.a + this.b * mtx.c;
                this.b = a * mtx.b + this.b * mtx.d;
                this.c = c * mtx.a + this.d * mtx.c;
                this.d = c * mtx.b + this.d * mtx.d;
                this.tx = tx * mtx.a + this.ty * mtx.c + mtx.tx;
                this.ty = tx * mtx.b + this.ty * mtx.d + mtx.ty;
                return this;
            },
            concatTransform : function(x, y, scaleX, scaleY, rotation){
                var cos = 1;
                var sin = 0;
                if(rotation%360){
                    var r = rotation * Math.PI / 180;
                    cos = Math.cos(r);
                    sin = Math.sin(r);
                }
    
                this.concat(new Matrix(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y));
                return this;
            },
            rotate : function(angle){
                //目前已经提供对顺时针逆时针两个方向旋转的支持
                var cos = Math.cos(angle);
                var sin = Math.sin(angle);
    
                var a = this.a;
                var c = this.c;
                var tx = this.tx;
    
                if (angle>0){
                    this.a = a * cos - this.b * sin;
                    this.b = a * sin + this.b * cos;
                    this.c = c * cos - this.d * sin;
                    this.d = c * sin + this.d * cos;
                    this.tx = tx * cos - this.ty * sin;
                    this.ty = tx * sin + this.ty * cos;
                } else {
                    var st = Math.sin(Math.abs(angle));
                    var ct = Math.cos(Math.abs(angle));
    
                    this.a = a*ct + this.b*st;
                    this.b = -a*st + this.b*ct;
                    this.c = c*ct + this.d*st;
                    this.d = -c*st + ct*this.d;
                    this.tx = ct*tx + st*this.ty;
                    this.ty = ct*this.ty - st*tx;
                }
                return this;
            },
            scale : function(sx, sy){
                this.a *= sx;
                this.d *= sy;
                this.tx *= sx;
                this.ty *= sy;
                return this;
            },
            translate : function(dx, dy){
                this.tx += dx;
                this.ty += dy;
                return this;
            },
            identity : function(){
                //初始化
                this.a = this.d = 1;
                this.b = this.c = this.tx = this.ty = 0;
                return this;
            },
            invert : function(){
                //逆向矩阵
                var a = this.a;
                var b = this.b;
                var c = this.c;
                var d = this.d;
                var tx = this.tx;
                var i = a * d - b * c;
    
                this.a = d / i;
                this.b = -b / i;
                this.c = -c / i;
                this.d = a / i;
                this.tx = (c * this.ty - d * tx) / i;
                this.ty = -(a * this.ty - b * tx) / i;
                return this;
            },
            clone : function(){
                return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
            },
            toArray : function(){
                return [ this.a , this.b , this.c , this.d , this.tx , this.ty ];
            },
            /**
             * 矩阵左乘向量
             */
            mulVector : function(v) {
                var aa = this.a, ac = this.c, atx = this.tx;
                var ab = this.b, ad = this.d, aty = this.ty;
    
                var out = [0,0];
                out[0] = v[0] * aa + v[1] * ac + atx;
                out[1] = v[0] * ab + v[1] * ad + aty;
    
                return out;
            }    
        } );
    
        return Matrix;
    
    }
);
;define(
    "canvax/geom/Vector",
    [],
    function(){
        function Vector(x, y) {
            var vx = 0,vy = 0;
            if ( arguments.length == 1 && _.isObject( x ) ){
                var arg = arguments[0];
                if( _.isArray( arg ) ){
                   vx = arg[0];
                   vy = arg[1];
                } else if( arg.hasOwnProperty("x") && arg.hasOwnProperty("y") ) {
                   vx = arg.x;
                   vy = arg.y;
                }
            }
            this._axes = [vx, vy];
        };
        Vector.prototype = {
            distance: function (v) {
                var x = this._axes[0] - v._axes[0];
                var y = this._axes[1] - v._axes[1];
    
                return Math.sqrt((x * x) + (y * y));
            }
        };
        return Vector;
    } 
)
;define(
    "canvax/geom/SmoothSpline",
    [
        "canvax/geom/Vector"
    ],
    function( Vector ){
        /**
         * @inner
         */
        function interpolate(p0, p1, p2, p3, t, t2, t3) {
            var v0 = (p2 - p0) * 0.25;
            var v1 = (p3 - p1) * 0.25;
            return (2 * (p1 - p2) + v0 + v1) * t3 
                   + (- 3 * (p1 - p2) - 2 * v0 - v1) * t2
                   + v0 * t + p1;
        }
        /**
         * 多线段平滑曲线 
         * opt ==> points , isLoop
         */
        return function ( opt ) {
            var points = opt.points;
            var isLoop = opt.isLoop;
            var smoothFilter = opt.smoothFilter;

            var len = points.length;
            if( len == 1 ){
                return points;
            }
            var ret = [];
            var distance  = 0;
            var preVertor = new Vector( points[0] );
            var iVtor     = null
            for (var i = 1; i < len; i++) {
                iVtor = new Vector(points[i]);
                distance += preVertor.distance( iVtor );
                preVertor = iVtor;
            }
    
            preVertor = null;
            iVtor     = null;
    
    
            //基本上等于曲率
            var segs = distance / 6;
    
            segs = segs < len ? len : segs;
            for (var i = 0; i < segs; i++) {
                var pos = i / (segs-1) * (isLoop ? len : len - 1);
                var idx = Math.floor(pos);
    
                var w = pos - idx;
    
                var p0;
                var p1 = points[idx % len];
                var p2;
                var p3;
                if (!isLoop) {
                    p0 = points[idx === 0 ? idx : idx - 1];
                    p2 = points[idx > len - 2 ? len - 1 : idx + 1];
                    p3 = points[idx > len - 3 ? len - 1 : idx + 2];
                } else {
                    p0 = points[(idx -1 + len) % len];
                    p2 = points[(idx + 1) % len];
                    p3 = points[(idx + 2) % len];
                }
    
                var w2 = w * w;
                var w3 = w * w2;

                var rp = [
                        interpolate(p0[0], p1[0], p2[0], p3[0], w, w2, w3),
                        interpolate(p0[1], p1[1], p2[1], p3[1], w, w2, w3)
                        ];

                _.isFunction(smoothFilter) && smoothFilter( rp );
    
                ret.push( rp );
            }
            return ret;
        };
    } 
);


;define(
    "canvax/display/DisplayObject",
    [
        "canvax/event/EventDispatcher",
        "canvax/geom/Matrix",
        "canvax/display/Point",
        "canvax/core/Base",
        "canvax/geom/HitTestPoint",
        "canvax/animation/AnimationFrame",
        "canvax/core/PropertyFactory"
    ],
    function(EventDispatcher , Matrix , Point , Base , HitTestPoint , AnimationFrame , PropertyFactory){

        var DisplayObject = function(opt){
            arguments.callee.superclass.constructor.apply(this, arguments);
            var self = this;
    
            //如果用户没有传入context设置，就默认为空的对象
            opt      = Base.checkOpt( opt );
    
            //设置默认属性
            self.id  = opt.id || null;
    
            //相对父级元素的矩阵
            self._transform      = null;
    
            //心跳次数
            self._heartBeatNum   = 0;
    
            //元素对应的stage元素
            self.stage           = null;
    
            //元素的父元素
            self.parent          = null;
    
            self._eventEnabled   = false;   //是否响应事件交互,在添加了事件侦听后会自动设置为true
    
            self.dragEnabled     = "dragEnabled" in opt ? opt.dragEnabled : false;   //是否启用元素的拖拽

            self.xyToInt         = "xyToInt" in opt ? opt.xyToInt : true;    //是否对xy坐标统一int处理，默认为true，但是有的时候可以由外界用户手动指定是否需要计算为int，因为有的时候不计算比较好，比如，进度图表中，再sector的两端添加两个圆来做圆角的进度条的时候，圆circle不做int计算，才能和sector更好的衔接

            //创建好context
            self._createContext( opt );
    
            var UID = Base.createId(self.type);
    
            //如果没有id 则 沿用uid
            if(self.id == null){
                self.id = UID ;
            };
    
            self.init.apply(self , arguments);
    
            //所有属性准备好了后，先要计算一次this._updateTransform()得到_tansform
            this._updateTransform();
        };
        Base.creatClass( DisplayObject , EventDispatcher , {
            init : function(){},
            _createContext : function( opt ){
                var self = this;
                //所有显示对象，都有一个类似canvas.context类似的 context属性
                //用来存取改显示对象所有和显示有关的属性，坐标，样式等。
                //该对象为Coer.PropertyFactory()工厂函数生成
                self.context = null;
    
                //提供给Coer.PropertyFactory() 来 给 self.context 设置 propertys
                //这里不能用_.extend， 因为要保证_contextATTRS的纯粹，只覆盖下面已有的属性
                var _contextATTRS = Base.copy( {
                    width         : 0,
                    height        : 0,
                    x             : 0,
                    y             : 0,
                    scaleX        : 1,
                    scaleY        : 1,
                    scaleOrigin   : {
                        x : 0,
                        y : 0
                    },
                    rotation      : 0,
                    rotateOrigin  :  {
                        x : 0,
                        y : 0
                    },
                    visible       : true,
                    cursor        : "default",
                    //canvas context 2d 的 系统样式。目前就知道这么多
                    fillStyle     : null,//"#000000",
                    lineCap       : null,
                    lineJoin      : null,
                    lineWidth     : null,
                    miterLimit    : null,
                    shadowBlur    : null,
                    shadowColor   : null,
                    shadowOffsetX : null,
                    shadowOffsetY : null,
                    strokeStyle   : null,
                    globalAlpha   : 1,
                    font          : null,
                    textAlign     : "left",
                    textBaseline  : "top", 
                    arcScaleX_    : null,
                    arcScaleY_    : null,
                    lineScale_    : null,
                    globalCompositeOperation : null
                } , opt.context , true );            
    
                //然后看继承者是否有提供_context 对象 需要 我 merge到_context2D_context中去的
                if (self._context) {
                    _contextATTRS = _.extend(_contextATTRS , self._context );
                }
    
                //有些引擎内部设置context属性的时候是不用上报心跳的，比如做hitTestPoint热点检测的时候
                self._notWatch = false;
    
                _contextATTRS.$owner = self;
                _contextATTRS.$watch = function(name , value , preValue){
    
                    //下面的这些属性变化，都会需要重新组织矩阵属性_transform 
                    var transFormProps = [ "x" , "y" , "scaleX" , "scaleY" , "rotation" , "scaleOrigin" , "rotateOrigin, lineWidth" ];
    
                    if( _.indexOf( transFormProps , name ) >= 0 ) {
                        this.$owner._updateTransform();
                    };
    
                    if( this.$owner._notWatch ){
                        return;
                    };
    
                    if( this.$owner.$watch ){
                        this.$owner.$watch( name , value , preValue );
                    };
    
                    this.$owner.heartBeat( {
                        convertType:"context",
                        shape      : this.$owner,
                        name       : name,
                        value      : value,
                        preValue   : preValue
                    });
                    
                };
    
                //执行init之前，应该就根据参数，把context组织好线
                self.context = PropertyFactory( _contextATTRS );
            },
            /* @myself 是否生成自己的镜像 
             * 克隆又两种，一种是镜像，另外一种是绝对意义上面的新个体
             * 默认为绝对意义上面的新个体，新对象id不能相同
             * 镜像基本上是框架内部在实现  镜像的id相同 主要用来把自己画到另外的stage里面，比如
             * mouseover和mouseout的时候调用*/
            clone : function( myself ){
                var conf   = {
                    id      : this.id,
                    context : _.clone(this.context.$model)
                };
                if( this.img ){
                    conf.img = this.img;
                };
                var newObj = new this.constructor( conf , "clone");
                if( this.children ){
                    newObj.children = this.children;
                }
                if (!myself){
                    newObj.id       = Base.createId(newObj.type);
                };
                return newObj;
            },
            heartBeat : function(opt){
                //stage存在，才说self代表的display已经被添加到了displayList中，绘图引擎需要知道其改变后
                //的属性，所以，通知到stage.displayAttrHasChange
                var stage = this.getStage();
                if( stage ){
                    this._heartBeatNum ++;
                    stage.heartBeat && stage.heartBeat( opt );
                }
            },
            getCurrentWidth : function(){
               return Math.abs(this.context.width * this.context.scaleX);
            },
            getCurrentHeight : function(){
    	       return Math.abs(this.context.height * this.context.scaleY);
            },
            getStage : function(){
                if( this.stage ) {
                    return this.stage;
                };
                var p = this;
                if (p.type != "stage"){
                  while(p.parent) {
                    p = p.parent;
                    if (p.type == "stage"){
                      break;
                    }
                  };
                  if (p.type !== "stage") {
                    //如果得到的顶点display 的type不是Stage,也就是说不是stage元素
                    //那么只能说明这个p所代表的顶端display 还没有添加到displayList中，也就是没有没添加到
                    //stage舞台的childen队列中，不在引擎渲染范围内
                    return false;
                  }
                } 
                //一直回溯到顶层object， 即是stage， stage的parent为null
                this.stage = p;
                return p;
            },
            localToGlobal : function( point , container ){
                !point && ( point = new Point( 0 , 0 ) );
                var cm = this.getConcatenatedMatrix( container );
    
                if (cm == null) return Point( 0 , 0 );
                var m = new Matrix(1, 0, 0, 1, point.x , point.y);
                m.concat(cm);
                return new Point( m.tx , m.ty ); //{x:m.tx, y:m.ty};
            },
            globalToLocal : function( point , container) {
                !point && ( point = new Point( 0 , 0 ) );
    
                if( this.type == "stage" ){
                    return point;
                }
                var cm = this.getConcatenatedMatrix( container );
    
                if (cm == null) return new Point( 0 , 0 ); //{x:0, y:0};
                cm.invert();
                var m = new Matrix(1, 0, 0, 1, point.x , point.y);
                m.concat(cm);
                return new Point( m.tx , m.ty ); //{x:m.tx, y:m.ty};
            },
            localToTarget : function( point , target){
                var p = localToGlobal( point );
                return target.globalToLocal( p );
            },
            getConcatenatedMatrix : function( container ){
                var cm = new Matrix();
                for (var o = this; o != null; o = o.parent) {
                    cm.concat( o._transform );
                    if( !o.parent || ( container && o.parent && o.parent == container ) || ( o.parent && o.parent.type=="stage" ) ) {
                    //if( o.type == "stage" || (o.parent && container && o.parent.type == container.type ) ) {
                        return cm;//break;
                    }
                }
                return cm;
            },
            /*
             *设置元素的是否响应事件检测
             *@bool  Boolean 类型
             */
            setEventEnable : function( bool ){
                if(_.isBoolean(bool)){
                    this._eventEnabled = bool
                    return true;
                };
                return false;
            },
            /*
             *查询自己在parent的队列中的位置
             */
            getIndex   : function(){
                if(!this.parent) {
                  return;
                };
                return _.indexOf(this.parent.children , this)
            },
            /*
             *元素在z轴方向向下移动
             *@num 移动的层级
             */
            toBack : function( num ){
                if(!this.parent) {
                  return;
                }
                var fromIndex = this.getIndex();
                var toIndex = 0;
                
                if(_.isNumber( num )){
                  if( num == 0 ){
                     //原地不动
                     return;
                  };
                  toIndex = fromIndex - num;
                }
                var me = this.parent.children.splice( fromIndex , 1 )[0];
                if( toIndex < 0 ){
                    toIndex = 0;
                };
                this.parent.addChildAt( me , toIndex );
            },
            /*
             *元素在z轴方向向上移动
             *@num 移动的层数量 默认到顶端
             */
            toFront : function( num ){
                if(!this.parent) {
                  return;
                }
                var fromIndex = this.getIndex();
                var pcl = this.parent.children.length;
                var toIndex = pcl;
                
                if(_.isNumber( num )){
                  if( num == 0 ){
                     //原地不动
                     return;
                  }
                  toIndex = fromIndex + num + 1;
                }
                var me = this.parent.children.splice( fromIndex , 1 )[0];
                if(toIndex > pcl){
                    toIndex = pcl;
                }
                this.parent.addChildAt( me , toIndex-1 );
            },
            _transformHander : function( ctx ){
                var transForm = this._transform;
                if( !transForm ) {
                    transForm = this._updateTransform();
                };
                //运用矩阵开始变形
                ctx.transform.apply( ctx , transForm.toArray() );
                //ctx.globalAlpha *= this.context.globalAlpha;
            },
            _updateTransform : function() {
                var _transform = new Matrix();
                _transform.identity();
                var ctx = this.context;
                //是否需要Transform
                if(ctx.scaleX !== 1 || ctx.scaleY !==1 ){
                    //如果有缩放
                    //缩放的原点坐标
                    var origin = new Point(ctx.scaleOrigin);
                    if( origin.x || origin.y ){
                        _transform.translate( -origin.x , -origin.y );
                    }
                    _transform.scale( ctx.scaleX , ctx.scaleY );
                    if( origin.x || origin.y ){
                        _transform.translate( origin.x , origin.y );
                    };
                };
    
                var rotation = ctx.rotation;
                if( rotation ){
                    //如果有旋转
                    //旋转的原点坐标
                    var origin = new Point(ctx.rotateOrigin);
                    if( origin.x || origin.y ){
                        _transform.translate( -origin.x , -origin.y );
                    }
                    _transform.rotate( rotation % 360 * Math.PI/180 );
                    if( origin.x || origin.y ){
                        _transform.translate( origin.x , origin.y );
                    }
                };

                //如果有位移
                var x,y;
                if( this.xyToInt ){
                    var x = parseInt( ctx.x );//Math.round(ctx.x);
                    var y = parseInt( ctx.y );//Math.round(ctx.y);
    
                    if( parseInt(ctx.lineWidth , 10) % 2 == 1 && ctx.strokeStyle ){
                        x += 0.5;
                        y += 0.5;
                    }
                } else {
                    x = ctx.x;
                    y = ctx.y;
                };
    
                if( x != 0 || y != 0 ){
                    _transform.translate( x , y );
                };
                this._transform = _transform;
                //console.log(this.id+":tx_"+_transform.tx+":cx_"+this.context.x);
    
                return _transform;
            },
            //显示对象的选取检测处理函数
            getChildInPoint : function( point ){
                var result; //检测的结果
    
                //第一步，吧glob的point转换到对应的obj的层级内的坐标系统
                if( this.type != "stage" && this.parent && this.parent.type != "stage" ) {
                    point = this.parent.globalToLocal( point );
                };
    
                var x = point.x;
                var y = point.y;
    
                //这个时候如果有对context的set，告诉引擎不需要watch，因为这个是引擎触发的，不是用户
                //用户set context 才需要触发watch
                this._notWatch = true;
            
                //对鼠标的坐标也做相同的变换
                if( this._transform ){
                    var inverseMatrix = this._transform.clone().invert();
                    var originPos = [x, y];
                    originPos = inverseMatrix.mulVector( originPos );
    
                    x = originPos[0];
                    y = originPos[1];
                };
    
                var _rect = this._rect = this.getRect(this.context);
    
                if(!_rect){
                    return false;
                };
                if( !this.context.width && !!_rect.width ){
                    this.context.width = _rect.width;
                };
                if( !this.context.height && !!_rect.height ){
                    this.context.height = _rect.height;
                };
                if(!_rect.width || !_rect.height) {
                    return false;
                };
                //正式开始第一步的矩形范围判断
                if ( x    >= _rect.x
                    &&  x <= (_rect.x + _rect.width)
                    &&  y >= _rect.y
                    &&  y <= (_rect.y + _rect.height)
                ) {
                   //那么就在这个元素的矩形范围内
                   result = HitTestPoint.isInside( this , {
                       x : x,
                       y : y
                   } );
                } else {
                   //如果连矩形内都不是，那么肯定的，这个不是我们要找的shap
                   result = false;
                }
                this._notWatch = false;
                return result;
            },
            /*
            * animate
            * @param toContent 要动画变形到的属性集合
            * @param options tween 动画参数
            */
            animate : function( toContent , options ){
                var to = toContent;
                var from = {};
                for( var p in to ){
                    from[ p ] = this.context[p];
                };
                !options && (options = {});
                options.from = from;
                options.to = to;

                var self = this;
                var upFun = function(){};
                if( options.onUpdate ){
                    upFun = options.onUpdate;
                };
                var tween;
                options.onUpdate = function(){
                    //如果context不存在说明该obj已经被destroy了，那么要把他的tween给destroy
                    if (!self.context && tween) {
                        AnimationFrame.destroyTween(tween);
                        tween = null;
                        return;
                    };
                    for( var p in this ){
                        self.context[p] = this[p];
                    };
                    upFun.apply(self , [this]);
                };
                var compFun = function(){};
                if( options.onComplete ){
                    compFun = options.onComplete;
                };
                options.onComplete = function( opt ){
                    compFun.apply(self , arguments)
                };
                tween = AnimationFrame.registTween( options );
                return tween;
            },
            _render : function( ctx ){	
                if( !this.context.visible || this.context.globalAlpha <= 0 ){
                    return;
                }
                ctx.save();
                this._transformHander( ctx );
    
                //文本有自己的设置样式方式
                if( this.type != "text" ) {
                    Base.setContextStyle( ctx , this.context.$model );
                }
    
                this.render( ctx );
                ctx.restore();
            },
            render : function( ctx ) {
                //基类不提供render的具体实现，由后续具体的派生类各自实现
            },
            //从树中删除
            remove : function(){
                if( this.parent ){
                    this.parent.removeChild(this);
                    this.parent = null;
                }
            },
            //元素的自我销毁
            destroy : function(){
                this.remove();
                this.fire("destroy");
                //把自己从父节点中删除了后做自我清除，释放内存
                this.context = null;
                delete this.context;
            }
        } );
        return DisplayObject;
    } 
);
;define(
    "canvax/display/DisplayObjectContainer",
    [
        "canvax/core/Base",
        "canvax/display/DisplayObject",
        "canvax/display/Point"
    ],
    function(Base , DisplayObject , Point){

        DisplayObjectContainer = function(opt){
           var self = this;
           self.children = [];
           self.mouseChildren = [];
           arguments.callee.superclass.constructor.apply(this, arguments);
    
           //所有的容器默认支持event 检测，因为 可能有里面的shape是eventEnable是true的
           //如果用户有强制的需求让容器下的所有元素都 不可检测，可以调用
           //DisplayObjectContainer的 setEventEnable() 方法
           self._eventEnabled = true;
        };
    
        Base.creatClass( DisplayObjectContainer , DisplayObject , {
            addChild : function(child){
                if( !child ) {
                    return;
                };
                if(this.getChildIndex(child) != -1) {
                    child.parent = this;
                    return child;
                };
                //如果他在别的子元素中，那么就从别人那里删除了
                if(child.parent) {
                    child.parent.removeChild(child);
                };
                this.children.push( child );
                child.parent = this;
                if(this.heartBeat){
                   this.heartBeat({
                     convertType : "children",
                     target      : child,
                     src         : this
                   });
                };
    
                if(this._afterAddChild){
                   this._afterAddChild(child);
                };
    
                return child;
            },
            addChildAt : function(child, index) {
                if(this.getChildIndex(child) != -1) {
                    child.parent = this;
                    return child;
                };
                if(child.parent) {
                    child.parent.removeChild(child);
                };
                this.children.splice(index, 0, child);
                child.parent = this;
                
                //上报children心跳
                if(this.heartBeat){
                   this.heartBeat({
                     convertType : "children",
                     target       : child,
                     src      : this
                   });
                };
                
                if(this._afterAddChild){
                   this._afterAddChild(child,index);
                };
    
                return child;
            },
            removeChild : function(child) {
                return this.removeChildAt(_.indexOf( this.children , child ));
            },
            removeChildAt : function(index) {
                if (index < 0 || index > this.children.length - 1) {
                    return false;
                };
                var child = this.children[index];
                if (child != null) {
                    child.parent = null;
                };
                this.children.splice(index, 1);
                
                if(this.heartBeat){
                   this.heartBeat({
                     convertType : "children",
                     target       : child,
                     src      : this
                   });
                };
                
                if(this._afterDelChild){
                   this._afterDelChild(child , index);
                }
    
                return child;
            },
            removeChildById : function( id ) {	
                for(var i = 0, len = this.children.length; i < len; i++) {
                    if(this.children[i].id == id) {
                        return this.removeChildAt(i);
                    }
                }
                return false;
            },
            removeAllChildren : function() {
                while(this.children.length > 0) {
                    this.removeChildAt(0);
                }
            },
            //集合类的自我销毁
            destroy : function(){
                if( this.parent ){
                    this.parent.removeChild(this);
                    this.parent = null;
                };
                this.fire("destroy");
                //依次销毁所有子元素
                for (var i=0,l=this.children.length ; i<l ; i++){
                    this.getChildAt(i).destroy();
                    i--;
                    l--;
                };
            },
            /*
             *@id 元素的id
             *@boolen 是否深度查询，默认就在第一层子元素中查询
             **/
            getChildById : function(id , boolen){
                if(!boolen) {
                    for(var i = 0, len = this.children.length; i < len; i++){
                        if(this.children[i].id == id) {
                            return this.children[i];
                        }
                    }
                } else {
                    //深度查询
                    //TODO:暂时未实现
                    return null
                }
                return null;
            },
            getChildAt : function(index) {
                if (index < 0 || index > this.children.length - 1) return null;
                return this.children[index];
            },
            getChildIndex : function(child) {
                return _.indexOf( this.children , child );
            },
            setChildIndex : function(child, index){
                if(child.parent != this) return;
                var oldIndex = _.indexOf( this.children , child );
                if(index == oldIndex) return;
                this.children.splice(oldIndex, 1);
                this.children.splice(index, 0, child);
            },
            getNumChildren : function() {
                return this.children.length;
            },
            //获取x,y点上的所有object  num 需要返回的obj数量
            getObjectsUnderPoint : function( point , num) {
                var result = [];
                
                for(var i = this.children.length - 1; i >= 0; i--) {
                    var child = this.children[i];
    
                    if( child == null ||
                        (!child._eventEnabled && !child.dragEnabled) || 
                        !child.context.visible 
                    ) {
                        continue;
                    }
                    if( child instanceof DisplayObjectContainer ) {
                        //是集合
                        if (child.mouseChildren && child.getNumChildren() > 0){
                           var objs = child.getObjectsUnderPoint( point );
                           if (objs.length > 0){
                              result = result.concat( objs );
                           }
                        }		
                    } else {
                        //非集合，可以开始做getChildInPoint了
                        if (child.getChildInPoint( point )) {
                            result.push(child);
                            if (num != undefined && !isNaN(num)){
                               if(result.length == num){
                                  return result;
                               }
                            }
                        }
                    }
                }
                return result;
            },
            render : function( ctx ) {
                for(var i = 0, len = this.children.length; i < len; i++) {
                    this.children[i]._render( ctx );
                }
            }
        });
        return DisplayObjectContainer;
    }
);;define(
    "canvax/display/Shape",
    [
        "canvax/display/DisplayObject",
        "canvax/core/Base"
    ],
    function( DisplayObject , Base  ){

        var Shape = function(opt){
            
            var self = this;
            //元素是否有hover事件 和 chick事件，由addEvenetLister和remiveEventLister来触发修改
            self._hoverable  = false;
            self._clickable  = false;
     
            //over的时候如果有修改样式，就为true
            self._hoverClass = false;
            self.hoverClone  = true;    //是否开启在hover的时候clone一份到active stage 中 
            self.pointChkPriority = true; //在鼠标mouseover到该节点，然后mousemove的时候，是否优先检测该节点
     
            //拖拽drag的时候显示在activShape的副本
            self._dragDuplicate = null;
     
            //元素是否 开启 drag 拖动，这个有用户设置传入
            //self.draggable = opt.draggable || false;
     
            self.type = self.type || "shape" ;
            opt.draw && (self.draw=opt.draw);
            
            //处理所有的图形一些共有的属性配置
            self.initCompProperty(opt);

            arguments.callee.superclass.constructor.apply(this , arguments);
            self._rect = null;
        };
     
        Base.creatClass(Shape , DisplayObject , {
           init : function(){
           },
           initCompProperty : function( opt ){
               for( var i in opt ){
                   if( i != "id" && i != "context"){
                       this[i] = opt[i];
                   }
               }
           },
           /*
            *下面两个方法为提供给 具体的 图形类覆盖实现，本shape类不提供具体实现
            *draw() 绘制   and   setRect()获取该类的矩形边界
           */
           draw:function(){
           
           },
           drawEnd : function(ctx){
               if(this._hasFillAndStroke){
                   //如果在子shape类里面已经实现stroke fill 等操作， 就不需要统一的d
                   return;
               }
     
               //style 要从diaplayObject的 context上面去取
               var style = this.context;
         
               //fill stroke 之前， 就应该要closepath 否则线条转角口会有缺口。
               //drawTypeOnly 由继承shape的具体绘制类提供
               if ( this._drawTypeOnly != "stroke" && this.type != "path"){
                   ctx.closePath();
               }
     
               if ( style.strokeStyle && style.lineWidth ){
                   ctx.stroke();
               }
               //比如贝塞尔曲线画的线,drawTypeOnly==stroke，是不能使用fill的，后果很严重
               if (style.fillStyle && this._drawTypeOnly!="stroke"){
                   ctx.fill();
               }
               
           },
     
     
           render : function(){
              var ctx  = this.getStage().context2D;
              
              if (this.context.type == "shape"){
                  //type == shape的时候，自定义绘画
                  //这个时候就可以使用self.graphics绘图接口了，该接口模拟的是as3的接口
                  this.draw.apply( this );
              } else {
                  //这个时候，说明该shape是调用已经绘制好的 shape 模块，这些模块全部在../shape目录下面
                  if( this.draw ){
                      ctx.beginPath();
                      this.draw( ctx , this.context );
                      this.drawEnd( ctx );
                  }
              }
           }
           ,
           /*
            * 画虚线
            */
           dashedLineTo:function(ctx, x1, y1, x2, y2, dashLength) {
                 dashLength = typeof dashLength == 'undefined'
                              ? 3 : dashLength;
                 dashLength = Math.max( dashLength , this.context.lineWidth );
                 var deltaX = x2 - x1;
                 var deltaY = y2 - y1;
                 var numDashes = Math.floor(
                     Math.sqrt(deltaX * deltaX + deltaY * deltaY) / dashLength
                 );
                 for (var i = 0; i < numDashes; ++i) {
                     var x = parseInt(x1 + (deltaX / numDashes) * i);
                     var y = parseInt(y1 + (deltaY / numDashes) * i);
                     ctx[i % 2 === 0 ? 'moveTo' : 'lineTo']( x , y );
                     if( i == (numDashes-1) && i%2 === 0){
                         ctx.lineTo( x2 , y2 );
                     }
                 }
           },
           /*
            *从cpl节点中获取到4个方向的边界节点
            *@param  context 
            *
            **/
           getRectFormPointList : function( context ){
               var minX =  Number.MAX_VALUE;
               var maxX =  Number.MIN_VALUE;
               var minY =  Number.MAX_VALUE;
               var maxY =  Number.MIN_VALUE;
      
               var cpl = context.pointList; //this.getcpl();
               for(var i = 0, l = cpl.length; i < l; i++) {
                   if (cpl[i][0] < minX) {
                       minX = cpl[i][0];
                   }
                   if (cpl[i][0] > maxX) {
                       maxX = cpl[i][0];
                   }
                   if (cpl[i][1] < minY) {
                       minY = cpl[i][1];
                   }
                   if (cpl[i][1] > maxY) {
                       maxY = cpl[i][1];
                   }
               }
     
               var lineWidth;
               if (context.strokeStyle || context.fillStyle  ) {
                   lineWidth = context.lineWidth || 1;
               } else {
                   lineWidth = 0;
               }
               return {
                   x      : Math.round(minX - lineWidth / 2),
                   y      : Math.round(minY - lineWidth / 2),
                   width  : maxX - minX + lineWidth,
                   height : maxY - minY + lineWidth
               };
           }
        });
     
        return Shape;
     
     }
)
;define(
    "canvax/display/Sprite",
    [
        "canvax/display/DisplayObjectContainer",
        "canvax/core/Base"
    ],
    function( DisplayObjectContainer , Base){
        var Sprite = function(){
            var self = this;
            self.type = "sprite";
            arguments.callee.superclass.constructor.apply(this, arguments);
        };
      
        Base.creatClass(Sprite , DisplayObjectContainer , {
            init : function(){
            
            }
        });
      
        return Sprite;
      
    } 
)
;define(
    "canvax/display/Stage",
    [
        "canvax/display/DisplayObjectContainer",
        "canvax/core/Base"
    ],
    function( DisplayObjectContainer , Base ){
  
        var Stage = function( ){
            var self = this;
            self.type = "stage";
            self.context2D = null;
            //stage正在渲染中
            self.stageRending = false;
            self._isReady = false;
            arguments.callee.superclass.constructor.apply(this, arguments);
        };
        Base.creatClass( Stage , DisplayObjectContainer , {
            init : function(){},
            //由canvax的afterAddChild 回调
            initStage : function( context2D , width , height ){
               var self = this;
               self.context2D = context2D;
               self.context.width  = width;
               self.context.height = height;
               self.context.scaleX = Base._devicePixelRatio;
               self.context.scaleY = Base._devicePixelRatio;
               self._isReady = true;
            },
            render : function( context ){
                this.stageRending = true;
                //TODO：
                //clear 看似 很合理，但是其实在无状态的cavnas绘图中，其实没必要执行一步多余的clear操作
                //反而增加无谓的开销，如果后续要做脏矩阵判断的话。在说
                this.clear();
                Stage.superclass.render.call( this, context );
                this.stageRending = false;
            },
            heartBeat : function( opt ){
                //shape , name , value , preValue 
                //displayList中某个属性改变了
                if (!this._isReady) {
                   //在stage还没初始化完毕的情况下，无需做任何处理
                   return;
                };
                opt || ( opt = {} ); //如果opt为空，说明就是无条件刷新
                opt.stage   = this;

                //TODO临时先这么处理
                this.parent && this.parent.heartBeat(opt);
            },
            clear : function(x, y, width, height) {
                if(arguments.length >= 4) {
                    this.context2D.clearRect(x, y, width, height);
                } else {
                    this.context2D.clearRect( 0, 0, this.parent.width , this.parent.height );
                }
            }
        });
        return Stage;
    }
);
         
;define(
    "canvax/display/Text", [
        "canvax/display/DisplayObject",
        "canvax/core/Base"
    ],
    function(DisplayObject, Base) {
        var Text = function(text, opt) {
            var self = this;
            self.type = "text";
            self._reNewline = /\r?\n/;
            self.fontProperts = ["fontStyle", "fontVariant", "fontWeight", "fontSize", "fontFamily"];

            //做一次简单的opt参数校验，保证在用户不传opt的时候 或者传了opt但是里面没有context的时候报错
            opt = Base.checkOpt(opt);

            self._context = _.deepExtend({
                fontSize: 13, //字体大小默认13
                fontWeight: "normal",
                fontFamily: "微软雅黑,sans-serif",
                textDecoration: null,
                fillStyle: 'blank',
                strokeStyle: null,
                lineWidth: 0,
                lineHeight: 1.2,
                backgroundColor: null,
                textBackgroundColor: null
            }, opt.context);

            self._context.font = self._getFontDeclaration();

            self.text = text.toString();

            arguments.callee.superclass.constructor.apply(this, [opt]);

        };

        Base.creatClass(Text, DisplayObject, {
            $watch: function(name, value, preValue) {
                //context属性有变化的监听函数
                if (_.indexOf(this.fontProperts, name) >= 0) {
                    this._context[name] = value;
                    //如果修改的是font的某个内容，就重新组装一遍font的值，
                    //然后通知引擎这次对context的修改不需要上报心跳
                    this._notWatch = false;
                    this.context.font = this._getFontDeclaration();
                    this.context.width = this.getTextWidth();
                    this.context.height = this.getTextHeight();
                }
            },
            init: function(text, opt) {
                var self = this;
                var c = this.context;
                c.width = this.getTextWidth();
                c.height = this.getTextHeight();
            },
            render: function(ctx) {
                for (p in this.context.$model) {
                    if (p in ctx) {
                        if (p != "textBaseline" && this.context.$model[p]) {
                            ctx[p] = this.context.$model[p];
                        };
                    };
                };
                this._renderText(ctx, this._getTextLines());
            },
            resetText: function(text) {
                this.text = text.toString();
                this.heartBeat();
            },
            getTextWidth: function() {
                var width = 0;
                Base._pixelCtx.save();
                Base._pixelCtx.font = this.context.font;
                width = this._getTextWidth(Base._pixelCtx, this._getTextLines());
                Base._pixelCtx.restore();
                return width;
            },
            getTextHeight: function() {
                return this._getTextHeight(Base._pixelCtx, this._getTextLines());
            },
            _getTextLines: function() {
                return this.text.split(this._reNewline);
            },
            _renderText: function(ctx, textLines) {
                ctx.save();
                this._renderTextStroke(ctx, textLines);
                this._renderTextFill(ctx, textLines);
                ctx.restore();
            },
            _getFontDeclaration: function() {
                var self = this;
                var fontArr = [];

                _.each(this.fontProperts, function(p) {
                    var fontP = self._context[p];
                    if (p == "fontSize") {
                        fontP = parseFloat(fontP) + "px"
                    }
                    fontP && fontArr.push(fontP);
                });

                return fontArr.join(' ');

            },
            _renderTextFill: function(ctx, textLines) {
                if (!this.context.fillStyle) return;

                this._boundaries = [];
                var lineHeights = 0;
                
                for (var i = 0, len = textLines.length; i < len; i++) {
                    var heightOfLine = this._getHeightOfLine(ctx, i, textLines);
                    lineHeights += heightOfLine;

                    this._renderTextLine(
                        'fillText',
                        ctx,
                        textLines[i],
                        0, //this._getLeftOffset(),
                        this._getTopOffset() + lineHeights,
                        i
                    );
                }
            },
            _renderTextStroke: function(ctx, textLines) {
                if (!this.context.strokeStyle || !this.context.lineWidth) return;

                var lineHeights = 0;

                ctx.save();
                if (this.strokeDashArray) {
                    if (1 & this.strokeDashArray.length) {
                        this.strokeDashArray.push.apply(this.strokeDashArray, this.strokeDashArray);
                    }
                    supportsLineDash && ctx.setLineDash(this.strokeDashArray);
                }

                ctx.beginPath();
                for (var i = 0, len = textLines.length; i < len; i++) {
                    var heightOfLine = this._getHeightOfLine(ctx, i, textLines);
                    lineHeights += heightOfLine;

                    this._renderTextLine(
                        'strokeText',
                        ctx,
                        textLines[i],
                        0, //this._getLeftOffset(),
                        this._getTopOffset() + lineHeights,
                        i
                    );
                }
                ctx.closePath();
                ctx.restore();
            },
            _renderTextLine: function(method, ctx, line, left, top, lineIndex) {
                top -= this._getHeightOfLine() / 4;
                if (this.context.textAlign !== 'justify') {
                    this._renderChars(method, ctx, line, left, top, lineIndex);
                    return;
                };
                var lineWidth = ctx.measureText(line).width;
                var totalWidth = this.context.width;

                if (totalWidth > lineWidth) {
                    var words = line.split(/\s+/);
                    var wordsWidth = ctx.measureText(line.replace(/\s+/g, '')).width;
                    var widthDiff = totalWidth - wordsWidth;
                    var numSpaces = words.length - 1;
                    var spaceWidth = widthDiff / numSpaces;

                    var leftOffset = 0;
                    for (var i = 0, len = words.length; i < len; i++) {
                        this._renderChars(method, ctx, words[i], left + leftOffset, top, lineIndex);
                        leftOffset += ctx.measureText(words[i]).width + spaceWidth;
                    }
                } else {
                    this._renderChars(method, ctx, line, left, top, lineIndex);
                }
            },
            _renderChars: function(method, ctx, chars, left, top) {
                ctx[method](chars, 0, top);
            },
            _getHeightOfLine: function() {
                return this.context.fontSize * this.context.lineHeight;
            },
            _getTextWidth: function(ctx, textLines) {
                var maxWidth = ctx.measureText(textLines[0] || '|').width;
                for (var i = 1, len = textLines.length; i < len; i++) {
                    var currentLineWidth = ctx.measureText(textLines[i]).width;
                    if (currentLineWidth > maxWidth) {
                        maxWidth = currentLineWidth;
                    }
                }
                return maxWidth;
            },
            _getTextHeight: function(ctx, textLines) {
                return this.context.fontSize * textLines.length * this.context.lineHeight;
            },

            /**
             * @private
             * @return {Number} Top offset
             */
            _getTopOffset: function() {
                var t = 0;
                switch (this.context.textBaseline) {
                    case "top":
                        t = 0;
                        break;
                    case "middle":
                        t = -this.context.height / 2;
                        break;
                    case "bottom":
                        t = -this.context.height;
                        break;
                }
                return t;
            },
            getRect: function() {
                var c = this.context;
                var x = 0;
                var y = 0;
                //更具textAlign 和 textBaseline 重新矫正 xy
                if (c.textAlign == "center") {
                    x = -c.width / 2;
                };
                if (c.textAlign == "right") {
                    x = -c.width;
                };
                if (c.textBaseline == "middle") {
                    y = -c.height / 2;
                };
                if (c.textBaseline == "bottom") {
                    y = -c.height;
                };

                return {
                    x: x,
                    y: y,
                    width: c.width,
                    height: c.height
                }
            }
        });
        return Text;
    }
);;define(
    "canvax/shape/BrokenLine", [
        "canvax/display/Shape",
        "canvax/core/Base",
        "canvax/geom/SmoothSpline"
    ],
    function(Shape, Base, SmoothSpline) {
        var BrokenLine = function(opt , atype) {
            var self = this;
            self.type = "brokenline";
            self._drawTypeOnly = "stroke";
            opt = Base.checkOpt(opt);
            if( atype !== "clone" ){
                self._initPointList(opt.context);
            };
            self._context = _.deepExtend({
                lineType: null,
                smooth: false,
                pointList: [], //{Array}  // 必须，各个顶角坐标
                smoothFilter: null
            }, opt.context );

            arguments.callee.superclass.constructor.apply(this, arguments);
        };

        Base.creatClass(BrokenLine, Shape, {
            $watch: function(name, value, preValue) {
                if (name == "pointList") {
                    this._initPointList(this.context, value, preValue);
                }
            },
            _initPointList: function(context, value, preValue) {
                var myC = context;
                if (myC.smooth) {
                    //smoothFilter -- 比如在折线图中。会传一个smoothFilter过来做point的纠正。
                    //让y不能超过底部的原点
                    var obj = {
                        points: myC.pointList
                    }
                    if (_.isFunction(myC.smoothFilter)) {
                        obj.smoothFilter = myC.smoothFilter;
                    }
                    this._notWatch = true; //本次转换不出发心跳
                    var currL = SmoothSpline(obj);

                    if (value && value.length>0) {
                        currL[currL.length - 1][0] = value[value.length - 1][0];
                    };
                    myC.pointList = currL;
                    this._notWatch = false;
                };
            },
            //polygon需要覆盖draw方法，所以要把具体的绘制代码作为_draw抽离出来
            draw: function(ctx, context) {
                this._draw(ctx, context);
            },
            _draw: function(ctx, context) {
                var pointList = context.pointList;
                if (pointList.length < 2) {
                    // 少于2个点就不画了~
                    return;
                };
                if (!context.lineType || context.lineType == 'solid') {
                    //默认为实线
                    //TODO:目前如果 有设置smooth 的情况下是不支持虚线的
                    ctx.moveTo(pointList[0][0], pointList[0][1]);
                    for (var i = 1, l = pointList.length; i < l; i++) {
                        ctx.lineTo(pointList[i][0], pointList[i][1]);
                    };
                } else if (context.lineType == 'dashed' || context.lineType == 'dotted') {
                    if (context.smooth) {
                        for (var si = 0, sl = pointList.length; si < sl; si++) {
                            if (si == sl-1) {
                                break;
                            };
                            ctx.moveTo( pointList[si][0] , pointList[si][1] );
                            ctx.lineTo( pointList[si+1][0] , pointList[si+1][1] );
                            si+=1;
                        };
                    } else {
                        //画虚线的方法  
                        ctx.moveTo(pointList[0][0], pointList[0][1]);
                        for (var i = 1, l = pointList.length; i < l; i++) {
                            var fromX = pointList[i - 1][0];
                            var toX = pointList[i][0];
                            var fromY = pointList[i - 1][1];
                            var toY = pointList[i][1];
                            this.dashedLineTo(ctx, fromX, fromY, toX, toY, 5);
                        };
                    }
                };
                return;
            },
            getRect: function(context) {
                var context = context ? context : this.context;
                return this.getRectFormPointList(context);
            }
        });
        return BrokenLine;
    }
);;define(
    "canvax/shape/Circle",
    [
        "canvax/display/Shape",
        "canvax/core/Base"
    ],
    function(Shape , Base) {
        var Circle = function(opt) {
            var self = this;
            self.type = "circle";

            opt = Base.checkOpt( opt );

            //默认情况下面，circle不需要把xy进行parentInt转换
            ( "xyToInt" in opt ) || ( opt.xyToInt = false );

            self._context = {
                r : opt.context.r || 0   //{number},  // 必须，圆半径
            }
            arguments.callee.superclass.constructor.apply(this, arguments);
        }

        Base.creatClass(Circle , Shape , {
           /**
             * 创建圆形路径
             * @param {Context2D} ctx Canvas 2D上下文
             * @param {Object} style 样式
             */
            draw : function(ctx, style) {
                if (!style) {
                  return;
                }
                ctx.arc(0 , 0, style.r, 0, Math.PI * 2, true);
            },

            /**
             * 返回矩形区域，用于局部刷新和文字定位
             * @param {Object} style
             */
            getRect : function(style) {
                var lineWidth;
                var style = style ? style : this.context;
                if (style.fillStyle || style.strokeStyle ) {
                    lineWidth = style.lineWidth || 1;
                } else {
                    lineWidth = 0;
                }
                return {
                    x : Math.round(0 - style.r - lineWidth / 2),
                    y : Math.round(0 - style.r - lineWidth / 2),
                    width : style.r * 2 + lineWidth,
                    height : style.r * 2 + lineWidth
                };
            }
        });

        return Circle;
    }
)
;define(
    "canvax/shape/Line", [
        "canvax/display/Shape",
        "canvax/core/Base"
    ],
    function(Shape, Base) {
        var Line = function(opt) {
            var self = this;
            this.type = "line";
            this.drawTypeOnly = "stroke";
            opt = Base.checkOpt(opt);
            self._context = {
                lineType: opt.context.lineType || null, //可选 虚线 实现 的 类型
                xStart: opt.context.xStart || 0, //{number},  // 必须，起点横坐标
                yStart: opt.context.yStart || 0, //{number},  // 必须，起点纵坐标
                xEnd: opt.context.xEnd || 0, //{number},  // 必须，终点横坐标
                yEnd: opt.context.yEnd || 0, //{number},  // 必须，终点纵坐标
                dashLength: opt.context.dashLength
            }
            arguments.callee.superclass.constructor.apply(this, arguments);
        };


        Base.creatClass(Line, Shape, {
            /**
             * 创建线条路径
             * ctx Canvas 2D上下文
             * style 样式
             */
            draw: function(ctx, style) {
                if (!style.lineType || style.lineType == 'solid') {
                    //默认为实线
                    ctx.moveTo(parseInt(style.xStart), parseInt(style.yStart));
                    ctx.lineTo(parseInt(style.xEnd), parseInt(style.yEnd));
                } else if (style.lineType == 'dashed' || style.lineType == 'dotted') {
                    this.dashedLineTo(
                        ctx,
                        style.xStart, style.yStart,
                        style.xEnd, style.yEnd,
                        style.dashLength
                    );
                }
            },

            /**
             * 返回矩形区域，用于局部刷新和文字定位
             * style
             */
            getRect: function(style) {
                var lineWidth = style.lineWidth || 1;
                var style = style ? style : this.context;
                return {
                    x: Math.min(style.xStart, style.xEnd) - lineWidth,
                    y: Math.min(style.yStart, style.yEnd) - lineWidth,
                    width: Math.abs(style.xStart - style.xEnd) + lineWidth,
                    height: Math.abs(style.yStart - style.yEnd) + lineWidth
                };
            }

        });

        return Line;
    }
);;define(
    "canvax/shape/Path", [
        "canvax/display/Shape",
        "canvax/core/Base",
        "canvax/geom/Matrix",
        "canvax/geom/bezier"
    ],
    function(Shape, Base, Matrix, Bezier) {
        var Path = function(opt) {
            var self = this;
            self.type = "path";
            opt = Base.checkOpt(opt);
            if ("drawTypeOnly" in opt) {
                self.drawTypeOnly = opt.drawTypeOnly;
            };
            self.__parsePathData = null;
            var _context = {
                pointList: [], //从下面的path中计算得到的边界点的集合
                path: opt.context.path || "" //字符串 必须，路径。例如:M 0 0 L 0 10 L 10 10 Z (一个三角形)
                    //M = moveto
                    //L = lineto
                    //H = horizontal lineto
                    //V = vertical lineto
                    //C = curveto
                    //S = smooth curveto
                    //Q = quadratic Belzier curve
                    //T = smooth quadratic Belzier curveto
                    //Z = closepath
            };
            self._context = _.deepExtend(_context, (self._context || {}));
            arguments.callee.superclass.constructor.apply(self, arguments);
        };

        Base.creatClass(Path, Shape, {
            $watch: function(name, value, preValue) {
                if (name == "path") { //如果path有变动，需要自动计算新的pointList
                    this.__parsePathData = null;
                    this.context.pointList = [];
                }
            },
            _parsePathData: function(data) {
                if (this.__parsePathData) {
                    return this.__parsePathData;
                };
                if (!data) {
                    return [];
                };
                //分拆子分组
                this.__parsePathData = [];
                var paths = _.compact(data.replace(/[Mm]/g, "\\r$&").split('\\r'));
                var me = this;
                _.each(paths, function(pathStr) {
                    me.__parsePathData.push(me._parseChildPathData(pathStr));
                });
                return this.__parsePathData;
            },
            _parseChildPathData: function(data) {
                // command string
                var cs = data;
                // command chars
                var cc = [
                    'm', 'M', 'l', 'L', 'v', 'V', 'h', 'H', 'z', 'Z',
                    'c', 'C', 'q', 'Q', 't', 'T', 's', 'S', 'a', 'A'
                ];
                cs = cs.replace(/  /g, ' ');
                cs = cs.replace(/ /g, ',');
                //cs = cs.replace(/(.)-/g, "$1,-");
                cs = cs.replace(/(\d)-/g, '$1,-');
                cs = cs.replace(/,,/g, ',');
                var n;
                // create pipes so that we can split the data
                for (n = 0; n < cc.length; n++) {
                    cs = cs.replace(new RegExp(cc[n], 'g'), '|' + cc[n]);
                }
                // create array
                var arr = cs.split('|');
                var ca = [];
                // init context point
                var cpx = 0;
                var cpy = 0;
                for (n = 1; n < arr.length; n++) {
                    var str = arr[n];
                    var c = str.charAt(0);
                    str = str.slice(1);
                    str = str.replace(new RegExp('e,-', 'g'), 'e-');

                    //有的时候，比如“22，-22” 数据可能会经常的被写成22-22，那么需要手动修改
                    //str = str.replace(new RegExp('-', 'g'), ',-');
                    //str = str.replace(/(.)-/g, "$1,-")

                    var p = str.split(',');

                    if (p.length > 0 && p[0] === '') {
                        p.shift();
                    }

                    for (var i = 0; i < p.length; i++) {
                        p[i] = parseFloat(p[i]);
                    }
                    while (p.length > 0) {
                        if (isNaN(p[0])) {
                            break;
                        }
                        var cmd = null;
                        var points = [];

                        var ctlPtx;
                        var ctlPty;
                        var prevCmd;

                        var rx;
                        var ry;
                        var psi;
                        var fa;
                        var fs;

                        var x1 = cpx;
                        var y1 = cpy;

                        // convert l, H, h, V, and v to L
                        switch (c) {
                            case 'l':
                                cpx += p.shift();
                                cpy += p.shift();
                                cmd = 'L';
                                points.push(cpx, cpy);
                                break;
                            case 'L':
                                cpx = p.shift();
                                cpy = p.shift();
                                points.push(cpx, cpy);
                                break;
                            case 'm':
                                cpx += p.shift();
                                cpy += p.shift();
                                cmd = 'M';
                                points.push(cpx, cpy);
                                c = 'l';
                                break;
                            case 'M':
                                cpx = p.shift();
                                cpy = p.shift();
                                cmd = 'M';
                                points.push(cpx, cpy);
                                c = 'L';
                                break;

                            case 'h':
                                cpx += p.shift();
                                cmd = 'L';
                                points.push(cpx, cpy);
                                break;
                            case 'H':
                                cpx = p.shift();
                                cmd = 'L';
                                points.push(cpx, cpy);
                                break;
                            case 'v':
                                cpy += p.shift();
                                cmd = 'L';
                                points.push(cpx, cpy);
                                break;
                            case 'V':
                                cpy = p.shift();
                                cmd = 'L';
                                points.push(cpx, cpy);
                                break;
                            case 'C':
                                points.push(p.shift(), p.shift(), p.shift(), p.shift());
                                cpx = p.shift();
                                cpy = p.shift();
                                points.push(cpx, cpy);
                                break;
                            case 'c':
                                points.push(
                                    cpx + p.shift(), cpy + p.shift(),
                                    cpx + p.shift(), cpy + p.shift()
                                );
                                cpx += p.shift();
                                cpy += p.shift();
                                cmd = 'C';
                                points.push(cpx, cpy);
                                break;
                            case 'S':
                                ctlPtx = cpx;
                                ctlPty = cpy;
                                prevCmd = ca[ca.length - 1];
                                if (prevCmd.command === 'C') {
                                    ctlPtx = cpx + (cpx - prevCmd.points[2]);
                                    ctlPty = cpy + (cpy - prevCmd.points[3]);
                                }
                                points.push(ctlPtx, ctlPty, p.shift(), p.shift());
                                cpx = p.shift();
                                cpy = p.shift();
                                cmd = 'C';
                                points.push(cpx, cpy);
                                break;
                            case 's':
                                ctlPtx = cpx, ctlPty = cpy;
                                prevCmd = ca[ca.length - 1];
                                if (prevCmd.command === 'C') {
                                    ctlPtx = cpx + (cpx - prevCmd.points[2]);
                                    ctlPty = cpy + (cpy - prevCmd.points[3]);
                                }
                                points.push(
                                    ctlPtx, ctlPty,
                                    cpx + p.shift(), cpy + p.shift()
                                );
                                cpx += p.shift();
                                cpy += p.shift();
                                cmd = 'C';
                                points.push(cpx, cpy);
                                break;
                            case 'Q':
                                points.push(p.shift(), p.shift());
                                cpx = p.shift();
                                cpy = p.shift();
                                points.push(cpx, cpy);
                                break;
                            case 'q':
                                points.push(cpx + p.shift(), cpy + p.shift());
                                cpx += p.shift();
                                cpy += p.shift();
                                cmd = 'Q';
                                points.push(cpx, cpy);
                                break;
                            case 'T':
                                ctlPtx = cpx, ctlPty = cpy;
                                prevCmd = ca[ca.length - 1];
                                if (prevCmd.command === 'Q') {
                                    ctlPtx = cpx + (cpx - prevCmd.points[0]);
                                    ctlPty = cpy + (cpy - prevCmd.points[1]);
                                }
                                cpx = p.shift();
                                cpy = p.shift();
                                cmd = 'Q';
                                points.push(ctlPtx, ctlPty, cpx, cpy);
                                break;
                            case 't':
                                ctlPtx = cpx, ctlPty = cpy;
                                prevCmd = ca[ca.length - 1];
                                if (prevCmd.command === 'Q') {
                                    ctlPtx = cpx + (cpx - prevCmd.points[0]);
                                    ctlPty = cpy + (cpy - prevCmd.points[1]);
                                }
                                cpx += p.shift();
                                cpy += p.shift();
                                cmd = 'Q';
                                points.push(ctlPtx, ctlPty, cpx, cpy);
                                break;
                            case 'A':
                                rx = p.shift(); //x半径
                                ry = p.shift(); //y半径
                                psi = p.shift(); //旋转角度
                                fa = p.shift(); //角度大小 
                                fs = p.shift(); //时针方向

                                x1 = cpx, y1 = cpy;
                                cpx = p.shift(), cpy = p.shift();
                                cmd = 'A';
                                points = this._convertPoint(
                                    x1, y1, cpx, cpy, fa, fs, rx, ry, psi
                                );
                                break;
                            case 'a':
                                rx = p.shift();
                                ry = p.shift();
                                psi = p.shift();
                                fa = p.shift();
                                fs = p.shift();

                                x1 = cpx, y1 = cpy;
                                cpx += p.shift();
                                cpy += p.shift();
                                cmd = 'A';
                                points = this._convertPoint(
                                    x1, y1, cpx, cpy, fa, fs, rx, ry, psi
                                );
                                break;

                        }

                        ca.push({
                            command: cmd || c,
                            points: points
                        });
                    }

                    if (c === 'z' || c === 'Z') {
                        ca.push({
                            command: 'z',
                            points: []
                        });
                    }
                };
                return ca;
            },

            /*
             * @param x1 原点x
             * @param y1 原点y
             * @param x2 终点坐标 x
             * @param y2 终点坐标 y
             * @param fa 角度大小
             * @param fs 时针方向
             * @param rx x半径
             * @param ry y半径
             * @param psiDeg 旋转角度
             */
            _convertPoint: function(x1, y1, x2, y2, fa, fs, rx, ry, psiDeg) {

                var psi = psiDeg * (Math.PI / 180.0);
                var xp = Math.cos(psi) * (x1 - x2) / 2.0 + Math.sin(psi) * (y1 - y2) / 2.0;
                var yp = -1 * Math.sin(psi) * (x1 - x2) / 2.0 + Math.cos(psi) * (y1 - y2) / 2.0;

                var lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);

                if (lambda > 1) {
                    rx *= Math.sqrt(lambda);
                    ry *= Math.sqrt(lambda);
                }

                var f = Math.sqrt((((rx * rx) * (ry * ry)) - ((rx * rx) * (yp * yp)) - ((ry * ry) * (xp * xp))) / ((rx * rx) * (yp * yp) + (ry * ry) * (xp * xp)));

                if (fa === fs) {
                    f *= -1;
                }
                if (isNaN(f)) {
                    f = 0;
                }

                var cxp = f * rx * yp / ry;
                var cyp = f * -ry * xp / rx;

                var cx = (x1 + x2) / 2.0 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
                var cy = (y1 + y2) / 2.0 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;

                var vMag = function(v) {
                    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
                };
                var vRatio = function(u, v) {
                    return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
                };
                var vAngle = function(u, v) {
                    return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
                };
                var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
                var u = [(xp - cxp) / rx, (yp - cyp) / ry];
                var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
                var dTheta = vAngle(u, v);

                if (vRatio(u, v) <= -1) {
                    dTheta = Math.PI;
                }
                if (vRatio(u, v) >= 1) {
                    dTheta = 0;
                }
                if (fs === 0 && dTheta > 0) {
                    dTheta = dTheta - 2 * Math.PI;
                }
                if (fs === 1 && dTheta < 0) {
                    dTheta = dTheta + 2 * Math.PI;
                }
                return [cx, cy, rx, ry, theta, dTheta, psi, fs];
            },
            /*
             * 获取bezier上面的点列表
             * */
            _getBezierPoints: function(p) {
                var steps = Math.abs(Math.sqrt(Math.pow(p.slice(-1)[0] - p[1], 2) + Math.pow(p.slice(-2, -1)[0] - p[0], 2)));
                steps = Math.ceil(steps / 5);
                var parr = [];
                for (var i = 0; i <= steps; i++) {
                    var t = i / steps;
                    var tp = Bezier.getPointByTime(t, p);
                    parr.push(tp.x);
                    parr.push(tp.y);
                };
                return parr;
            },
            /*
             * 如果path中有A a ，要导出对应的points
             */
            _getArcPoints: function(p) {

                var cx = p[0];
                var cy = p[1];
                var rx = p[2];
                var ry = p[3];
                var theta = p[4];
                var dTheta = p[5];
                var psi = p[6];
                var fs = p[7];
                var r = (rx > ry) ? rx : ry;
                var scaleX = (rx > ry) ? 1 : rx / ry;
                var scaleY = (rx > ry) ? ry / rx : 1;

                var _transform = new Matrix();
                _transform.identity();
                _transform.scale(scaleX, scaleY);
                _transform.rotate(psi);
                _transform.translate(cx, cy);

                var cps = [];
                var steps = (360 - (!fs ? 1 : -1) * dTheta * 180 / Math.PI) % 360;

                steps = Math.ceil(Math.min(Math.abs(dTheta) * 180 / Math.PI, r * Math.abs(dTheta) / 8)); //间隔一个像素 所以 /2

                for (var i = 0; i <= steps; i++) {
                    var point = [Math.cos(theta + dTheta / steps * i) * r, Math.sin(theta + dTheta / steps * i) * r];
                    point = _transform.mulVector(point);
                    cps.push(point[0]);
                    cps.push(point[1]);
                };
                return cps;
            },

            draw: function(ctx, style) {
                this._draw(ctx, style);
            },
            /**
             *  ctx Canvas 2D上下文
             *  style 样式
             */
            _draw: function(ctx, style) {
                var path = style.path;
                var pathArray = this._parsePathData(path);
                this._setPointList(pathArray, style);
                for (var g = 0, gl = pathArray.length; g < gl; g++) {
                    for (var i = 0, l = pathArray[g].length; i < l; i++) {
                        var c = pathArray[g][i].command, p = pathArray[g][i].points;
                        switch (c) {
                            case 'L':
                                ctx.lineTo(p[0], p[1]);
                                break;
                            case 'M':
                                ctx.moveTo(p[0], p[1]);
                                break;
                            case 'C':
                                ctx.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                                break;
                            case 'Q':
                                ctx.quadraticCurveTo(p[0], p[1], p[2], p[3]);
                                break;
                            case 'A':
                                var cx = p[0];
                                var cy = p[1];
                                var rx = p[2];
                                var ry = p[3];
                                var theta = p[4];
                                var dTheta = p[5];
                                var psi = p[6];
                                var fs = p[7];
                                var r = (rx > ry) ? rx : ry;
                                var scaleX = (rx > ry) ? 1 : rx / ry;
                                var scaleY = (rx > ry) ? ry / rx : 1;
                                var _transform = new Matrix();
                                _transform.identity();
                                _transform.scale(scaleX, scaleY);
                                _transform.rotate(psi);
                                _transform.translate(cx, cy);
                                //运用矩阵开始变形
                                ctx.transform.apply(ctx, _transform.toArray());
                                ctx.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
                                //_transform.invert();
                                ctx.transform.apply(ctx, _transform.invert().toArray());
                                break;
                            case 'z':
                                ctx.closePath();
                                break;
                        }
                    }
                };
                return this;
            },
            _setPointList: function(pathArray, style) {
                if (style.pointList.length > 0) {
                    return;
                };

                // 记录边界点，用于判断inside
                var pointList = style.pointList = [];
                for (var g = 0, gl = pathArray.length; g < gl; g++) {

                    var singlePointList = [];

                    for (var i = 0, l = pathArray[g].length; i < l; i++) {
                        var p = pathArray[g][i].points;
                        var cmd = pathArray[g][i].command;

                        if (cmd.toUpperCase() == 'A') {
                            p = this._getArcPoints(p);
                            //A命令的话，外接矩形的检测必须转换为_points
                            pathArray[g][i]._points = p;
                        };

                        if (cmd.toUpperCase() == "C" || cmd.toUpperCase() == "Q") {
                            var cStart = [0, 0];
                            if (singlePointList.length > 0) {
                                cStart = singlePointList.slice(-1)[0];
                            } else if (i > 0) {
                                var prePoints = (pathArray[g][i - 1]._points || pathArray[g][i - 1].points);
                                if (prePoints.length >= 2) {
                                    cStart = prePoints.slice(-2);
                                }
                            };
                            p = this._getBezierPoints(cStart.concat(p));
                            pathArray[g][i]._points = p;
                        };

                        for (var j = 0, k = p.length; j < k; j += 2) {
                            var px = p[j];
                            var py = p[j + 1];
                            if ((!px && px!=0) || (!py && py!=0)) {
                                continue;
                            };
                            singlePointList.push([px, py]);
                        }
                    };
                    singlePointList.length > 0 && pointList.push(singlePointList);
                };
            },
            /**
             * 返回矩形区域，用于局部刷新和文字定位
             * style 样式
             */
            getRect: function(style) {
                
                var lineWidth;
                var style = style ? style : this.context;
                if (style.strokeStyle || style.fillStyle) {
                    lineWidth = style.lineWidth || 1;
                } else {
                    lineWidth = 0;
                }

                var minX = Number.MAX_VALUE;
                var maxX = -Number.MAX_VALUE;
                var minY = Number.MAX_VALUE;
                var maxY = -Number.MAX_VALUE;

                // 平移坐标
                var x = 0;
                var y = 0;

                var pathArray = this._parsePathData(style.path);
                this._setPointList(pathArray, style);
 
                for (var g = 0, gl = pathArray.length; g < gl; g++) {
                    for (var i = 0; i < pathArray[g].length; i++) {
                        var p = pathArray[g][i]._points || pathArray[g][i].points;

                        for (var j = 0; j < p.length; j++) {
                            if (j % 2 === 0) {
                                if (p[j] + x < minX) {
                                    minX = p[j] + x;
                                }
                                if (p[j] + x > maxX) {
                                    maxX = p[j] + x;
                                }
                            } else {
                                if (p[j] + y < minY) {
                                    minY = p[j] + y;
                                }
                                if (p[j] + y > maxY) {
                                    maxY = p[j] + y;
                                }
                            }
                        }
                    }
                };

                var rect;
                if (minX === Number.MAX_VALUE || maxX === Number.MIN_VALUE || minY === Number.MAX_VALUE || maxY === Number.MIN_VALUE) {
                    rect = {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0
                    };
                } else {
                    rect = {
                        x: Math.round(minX - lineWidth / 2),
                        y: Math.round(minY - lineWidth / 2),
                        width: maxX - minX + lineWidth,
                        height: maxY - minY + lineWidth
                    };
                }
                return rect;
            }

        });
        return Path;
    }
);;define(
    "canvax/shape/Polygon", [
        "canvax/core/Base",
        "canvax/shape/BrokenLine"
    ],
    function(Base, BrokenLine) {
        var Polygon = function(opt , atype) {
            var self = this;
            opt = Base.checkOpt(opt);

            if(atype !== "clone"){
                var start = opt.context.pointList[0];
                var end   = opt.context.pointList[ opt.context.pointList.length - 1 ];
                if( opt.context.smooth ){
                    opt.context.pointList.unshift( end );
                } else {
                    opt.context.pointList.push( start );
                }
            };
            
            arguments.callee.superclass.constructor.apply(this, arguments);

            if(atype !== "clone" && opt.context.smooth && end){

            };

            self._drawTypeOnly = null;
            self.type = "polygon";
        };
        Base.creatClass(Polygon, BrokenLine, {
            draw: function(ctx, context) {
                if (context.fillStyle) {
                    if (context.lineType == 'dashed' || context.lineType == 'dotted') {
                        var pointList = context.pointList;
                        //特殊处理，虚线围不成path，实线再build一次
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(pointList[0][0], pointList[0][1]);
                        for (var i = 1, l = pointList.length; i < l; i++) {
                            ctx.lineTo(pointList[i][0], pointList[i][1]);
                        };
                        ctx.closePath();
                        ctx.restore();
                        ctx.fill();
                        this._drawTypeOnly = "stroke";
                    };
                };
                //如果下面不加save restore，canvas会把下面的path和上面的path一起算作一条path。就会绘制了一条实现边框和一虚线边框。
                ctx.save();
                ctx.beginPath();
                this._draw(ctx, context);
                ctx.closePath();
                ctx.restore();
            }
        });
        return Polygon;
    }
);;define(
    "canvax/shape/Rect",
    [
        "canvax/display/Shape",
        "canvax/core/Base"
    ],
    function(Shape , Base){
        var Rect = function(opt){
            var self = this;
            self.type = "rect";
      
            opt = Base.checkOpt( opt );
            self._context = {
                 width         : opt.context.width || 0,//{number},  // 必须，宽度
                 height        : opt.context.height|| 0,//{number},  // 必须，高度
                 radius        : opt.context.radius|| []     //{array},   // 默认为[0]，圆角 
            }
            arguments.callee.superclass.constructor.apply(this, arguments);
        };
      
        Base.creatClass( Rect , Shape , {
            /**
             * 绘制圆角矩形
             * @param {Context2D} ctx Canvas 2D上下文
             * @param {Object} style 样式
             */
            _buildRadiusPath: function(ctx, style) {
                //左上、右上、右下、左下角的半径依次为r1、r2、r3、r4
                //r缩写为1         相当于 [1, 1, 1, 1]
                //r缩写为[1]       相当于 [1, 1, 1, 1]
                //r缩写为[1, 2]    相当于 [1, 2, 1, 2]
                //r缩写为[1, 2, 3] 相当于 [1, 2, 3, 2]
                var x = 0;
                var y = 0;
                var width = this.context.width;
                var height = this.context.height;
            
                var r = Base.getCssOrderArr(style.radius);
             
                ctx.moveTo( parseInt(x + r[0]), parseInt(y));
                ctx.lineTo( parseInt(x + width - r[1]), parseInt(y));
                r[1] !== 0 && ctx.quadraticCurveTo(
                        x + width, y, x + width, y + r[1]
                        );
                ctx.lineTo( parseInt(x + width), parseInt(y + height - r[2]));
                r[2] !== 0 && ctx.quadraticCurveTo(
                        x + width, y + height, x + width - r[2], y + height
                        );
                ctx.lineTo( parseInt(x + r[3]), parseInt(y + height));
                r[3] !== 0 && ctx.quadraticCurveTo(
                        x, y + height, x, y + height - r[3]
                        );
                ctx.lineTo( parseInt(x), parseInt(y + r[0]));
                r[0] !== 0 && ctx.quadraticCurveTo(x, y, x + r[0], y);
            },
            /**
             * 创建矩形路径
             * @param {Context2D} ctx Canvas 2D上下文
             * @param {Object} style 样式
             */
            draw : function(ctx, style) {
                if(!style.$model.radius.length) {
                    if(!!style.fillStyle){
                       ctx.fillRect( 0 , 0 ,this.context.width,this.context.height)
                    }
                    if(!!style.lineWidth){
                       ctx.strokeRect( 0 , 0 , this.context.width,this.context.height);
                    }
                } else {
                    this._buildRadiusPath(ctx, style);
                }
                return;
            },
      
            /**
             * 返回矩形区域，用于局部刷新和文字定位
             * @param {Object} style
             */
            getRect : function(style) {
                    var lineWidth;
                    var style = style ? style : this.context;
                    if (style.fillStyle || style.strokeStyle) {
                        lineWidth = style.lineWidth || 1;
                    }
                    else {
                        lineWidth = 0;
                    }
                    return {
                          x : Math.round(0 - lineWidth / 2),
                          y : Math.round(0 - lineWidth / 2),
                          width : this.context.width + lineWidth,
                          height : this.context.height + lineWidth
                    };
                }
      
        } );
        return Rect;
    } 
);
;define(
    "canvax/shape/Sector",
    [
        "canvax/display/Shape",
        "canvax/geom/Math",
        "canvax/core/Base"
    ],
    function(Shape , myMath , Base){
 
        var Sector = function(opt){
            var self  = this;
            self.type = "sector";
            self.regAngle  = [];
            self.isRing    = false;//是否为一个圆环
     
            opt = Base.checkOpt( opt );
            self._context  = {
                pointList  : [],//边界点的集合,私有，从下面的属性计算的来
                r0         : opt.context.r0         || 0,// 默认为0，内圆半径指定后将出现内弧，同时扇边长度 = r - r0
                r          : opt.context.r          || 0,//{number},  // 必须，外圆半径
                startAngle : opt.context.startAngle || 0,//{number},  // 必须，起始角度[0, 360)
                endAngle   : opt.context.endAngle   || 0, //{number},  // 必须，结束角度(0, 360]
                clockwise  : opt.context.clockwise  || false //是否顺时针，默认为false(顺时针)
            }
            arguments.callee.superclass.constructor.apply(this , arguments);
        };
     
        Base.creatClass(Sector , Shape , {
            draw : function(ctx, context) {
                // 形内半径[0,r)
                var r0 = typeof context.r0 == 'undefined' ? 0 : context.r0;
                var r  = context.r;                            // 扇形外半径(0,r]
                var startAngle = myMath.degreeTo360(context.startAngle);          // 起始角度[0,360)
                var endAngle   = myMath.degreeTo360(context.endAngle);              // 结束角度(0,360]
     
                //var isRing     = false;                       //是否为圆环

                //if( startAngle != endAngle && Math.abs(startAngle - endAngle) % 360 == 0 ) {
                if( startAngle == endAngle && context.startAngle != context.endAngle ) {
                    //如果两个角度相等，那么就认为是个圆环了
                    this.isRing     = true;
                    startAngle = 0 ;
                    endAngle   = 360;
                }
     
                startAngle = myMath.degreeToRadian(startAngle);
                endAngle   = myMath.degreeToRadian(endAngle);
             
                //处理下极小夹角的情况
                if( endAngle - startAngle < 0.025 ){
                    startAngle -= 0.003
                }

                ctx.arc( 0 , 0 , r, startAngle, endAngle, this.context.clockwise);
                if (r0 !== 0) {
                    if( this.isRing ){
                        //加上这个isRing的逻辑是为了兼容flashcanvas下绘制圆环的的问题
                        //不加这个逻辑flashcanvas会绘制一个大圆 ， 而不是圆环
                        ctx.moveTo( r0 , 0 );
                        ctx.arc( 0 , 0 , r0 , startAngle , endAngle , !this.context.clockwise);
                    } else {
                        ctx.arc( 0 , 0 , r0 , endAngle , startAngle , !this.context.clockwise);
                    }
                } else {
                    //TODO:在r0为0的时候，如果不加lineTo(0,0)来把路径闭合，会出现有搞笑的一个bug
                    //整个圆会出现一个以每个扇形两端为节点的镂空，我可能描述不清楚，反正这个加上就好了
                    ctx.lineTo(0,0);
                }
             },
             getRegAngle : function(){
                 this.regIn      = true;  //如果在start和end的数值中，end大于start而且是顺时针则regIn为true
                 var c           = this.context;
                 var startAngle = myMath.degreeTo360(c.startAngle);          // 起始角度[0,360)
                 var endAngle   = myMath.degreeTo360(c.endAngle);            // 结束角度(0,360]

                 if ( ( startAngle > endAngle && !c.clockwise ) || ( startAngle < endAngle && c.clockwise ) ) {
                     this.regIn  = false; //out
                 };
                 //度的范围，从小到大
                 this.regAngle   = [ 
                     Math.min( startAngle , endAngle ) , 
                     Math.max( startAngle , endAngle ) 
                 ];
             },
             getRect : function(context){
                 var context = context ? context : this.context;
                 var r0 = typeof context.r0 == 'undefined'     // 形内半径[0,r)
                     ? 0 : context.r0;
                 var r = context.r;                            // 扇形外半径(0,r]
                 
                 this.getRegAngle();

                 var startAngle = myMath.degreeTo360(context.startAngle);          // 起始角度[0,360)
                 var endAngle   = myMath.degreeTo360(context.endAngle);            // 结束角度(0,360]

                 /*
                 var isCircle = false;
                 if( Math.abs( startAngle - endAngle ) == 360 
                         || ( startAngle == endAngle && startAngle * endAngle != 0 ) ){
                     isCircle = true;
                 }
                 */
     
                 var pointList  = [];
     
                 var p4Direction= {
                     "90" : [ 0 , r ],
                     "180": [ -r, 0 ],
                     "270": [ 0 , -r],
                     "360": [ r , 0 ] 
                 };
     
                 for ( var d in p4Direction ){
                     var inAngleReg = parseInt(d) > this.regAngle[0] && parseInt(d) < this.regAngle[1];
                     if( this.isRing || (inAngleReg && this.regIn) || (!inAngleReg && !this.regIn) ){
                         pointList.push( p4Direction[ d ] );
                     }
                 }
     
                 if( !this.isRing ) {
                     startAngle = myMath.degreeToRadian( startAngle );
                     endAngle   = myMath.degreeToRadian( endAngle   );
     
                     pointList.push([
                             myMath.cos(startAngle) * r0 , myMath.sin(startAngle) * r0
                             ]);
     
                     pointList.push([
                             myMath.cos(startAngle) * r  , myMath.sin(startAngle) * r
                             ]);
     
                     pointList.push([
                             myMath.cos(endAngle)   * r  ,  myMath.sin(endAngle)  * r
                             ]);
     
                     pointList.push([
                             myMath.cos(endAngle)   * r0 ,  myMath.sin(endAngle)  * r0
                             ]);
                 }
     
                 context.pointList = pointList;
                 return this.getRectFormPointList( context );
             }
     
        });
     
        return Sector;
     
    }
);
;define(
    "canvax/index",
    [
        "canvax/core/Base",
        "canvax/animation/AnimationFrame",
        "canvax/event/EventHandler",
        "canvax/event/EventDispatcher",
        "canvax/event/EventManager",

        "canvax/display/DisplayObjectContainer",
        "canvax/display/Stage",
        "canvax/display/Sprite",
        "canvax/display/Shape",
        "canvax/display/Point",
        "canvax/display/Text",

        "canvax/animation/AnimationFrame"
    ]
    , 
    function( 
        Base , AnimationFrame , EventHandler ,  EventDispatcher , EventManager , 
        DisplayObjectContainer , 
        Stage , Sprite , Shape , Point , Text,
        AnimationFrame   
    ) {

    var Canvax = function( opt ){
        this.type = "canvax";
        this._cid = new Date().getTime() + "_" + Math.floor(Math.random()*100); 
        
        this._rootDom   = Base.getEl(opt.el);
        if( !this._rootDom ){
            //如果宿主对象不存在,那么，我也懒的画了
            return;
        }
        this.width      = parseInt("width"  in opt || this._rootDom.offsetWidth  , 10); 
        this.height     = parseInt("height" in opt || this._rootDom.offsetHeight , 10); 

        //是否阻止浏览器默认事件的执行
        this.preventDefault = true;
        if( opt.preventDefault === false ){
            this.preventDefault = false
        };
 
        //如果这个时候el里面已经有东西了。嗯，也许曾经这个el被canvax干过一次了。
        //那么要先清除这个el的所有内容。
        //默认的el是一个自己创建的div，因为要在这个div上面注册n多个事件 来 在整个canvax系统里面进行事件分发。
        //所以不能直接用配置传进来的el对象。因为可能会重复添加很多的事件在上面。导致很多内容无法释放。
        var htmlStr = "<div id='cc-"+this._cid+"' class='canvax-c' ";
            htmlStr+= "style='position:relative;width:" + this.width + "px;height:" + this.height +"px;'>";
            htmlStr+= "   <div id='cdc-"+this._cid+"' class='canvax-dom-container' ";
            htmlStr+= "   style='position:absolute;width:" + this.width + "px;height:" + this.height +"px;'>";
            htmlStr+= "   </div>";
            htmlStr+= "</div>";

        //var docfrag = document.createDocumentFragment();
        //docfrag.innerHTML = htmlStr

        this._rootDom.innerHTML = htmlStr;
 
        this.el = Base.getEl("cc-"+this._cid);
        
        this.rootOffset      = Base.getOffset(this.el); //this.el.offset();
        this.lastGetRO       = 0;//最后一次获取rootOffset的时间
 
        //每帧 由 心跳 上报的 需要重绘的stages 列表
        this.convertStages = {};
 
        this._heartBeat = false;//心跳，默认为false，即false的时候引擎处于静默状态 true则启动渲染
        
        //设置帧率
        this._preRenderTime = 0;

        //任务列表, 如果_taskList 不为空，那么主引擎就一直跑
        //为 含有__enterFrame 方法 DisplayObject 的对象列表
        //比如Movieclip的__enterFrame方法。
        this._taskList = [];
        
        this._hoverStage = null;
        
        this._isReady    = false;

        this.evt = null;
 
        arguments.callee.superclass.constructor.apply(this, arguments);
    };
    
    Base.creatClass(Canvax , DisplayObjectContainer , {
        init : function(){
            this.context.width  = this.width;
            this.context.height = this.height; 
 
            //然后创建一个用于绘制激活shape的 stage到activation
            this._creatHoverStage();
 
            //初始化事件委托到root元素上面
            this.evt = new EventHandler( this );
            this.evt.init();
 
            //创建一个如果要用像素检测的时候的容器
            this._createPixelContext();
            
            this._isReady = true;
        },
        resize : function( opt ){
            //重新设置坐标系统 高宽 等。
            this.width      = parseInt((opt && "width" in opt) || this._rootDom.offsetWidth  , 10); 
            this.height     = parseInt((opt && "height" in opt) || this._rootDom.offsetHeight , 10); 
 
            this.el.style.width  = this.width +"px";
            this.el.style.height = this.height+"px";
 
            this.rootOffset     = Base.getOffset(this.el);
            this._notWatch      = true;
            this.context.width  = this.width;
            this.context.height = this.height;
            this._notWatch      = false;
 
            var me = this;
            var reSizeCanvas    = function(ctx){
                var canvas = ctx.canvas;
                canvas.style.width = me.width + "px";
                canvas.style.height= me.height+ "px";
                canvas.setAttribute("width"  , me.width * Base._devicePixelRatio);
                canvas.setAttribute("height" , me.height* Base._devicePixelRatio);
 
                //如果是swf的话就还要调用这个方法。
                if (ctx.resize) {
                    ctx.resize(me.width , me.height);
                }
            }; 
            _.each(this.children , function(s , i){
                s._notWatch     = true;
                s.context.width = me.width;
                s.context.height= me.height;
                reSizeCanvas(s.context2D);
                s._notWatch     = false;
            });

            var canvaxDOMc = Base.getEl("cdc-"+this._cid);
            canvaxDOMc.style.width  = this.width  + "px";
            canvaxDOMc.style.height = this.height + "px";

            this.heartBeat();
 
        },
        getDomContainer  : function(){
            return Base.getEl("cdc-"+this._cid);
        },
        getHoverStage : function(){
            return this._hoverStage;
        },
        _creatHoverStage : function(){
            //TODO:创建stage的时候一定要传入width height  两个参数
            this._hoverStage = new Stage( {
                id : "activCanvas"+(new Date()).getTime(),
                context : {
                    width : this.context.width,
                    height: this.context.height
                }
            } );
            //该stage不参与事件检测
            this._hoverStage._eventEnabled = false;
            this.addChild( this._hoverStage );
        },
        /**
         * 用来检测文本width height 
         * @return {Object} 上下文
        */
        _createPixelContext : function() {
            var _pixelCanvas = Base.getEl("_pixelCanvas");
            if(!_pixelCanvas){
                _pixelCanvas = Base._createCanvas("_pixelCanvas" , 0 , 0); 
            } else {
                //如果又的话 就不需要在创建了
                return;
            };
            document.body.appendChild( _pixelCanvas );
            Base.initElement( _pixelCanvas );
            if( Base.canvasSupport() ){
                //canvas的话，哪怕是display:none的页可以用来左像素检测和measureText文本width检测
                _pixelCanvas.style.display    = "none";
            } else {
                //flashCanvas 的话，swf如果display:none了。就做不了measureText 文本宽度 检测了
                _pixelCanvas.style.zIndex     = -1;
                _pixelCanvas.style.position   = "absolute";
                _pixelCanvas.style.left       = - this.context.width  + "px";
                _pixelCanvas.style.top        = - this.context.height + "px";
                _pixelCanvas.style.visibility = "hidden";
            }
            Base._pixelCtx = _pixelCanvas.getContext('2d');
        },
        updateRootOffset : function(){
            var now = new Date().getTime();
            if( now - this.lastGetRO > 1000 ){
                //alert( this.lastGetRO )
                this.rootOffset      = Base.getOffset(this.el);
                this.lastGetRO       = now;
            }
        },
        //如果引擎处于静默状态的话，就会启动
        __startEnter : function(){
           var self = this;
           if( !self.requestAid ){
               self.requestAid = AnimationFrame.registFrame( {
                   id : "enterFrame", //同时肯定只有一个enterFrame的task
                   task : _.bind( self.__enterFrame , self)
               } );
           }
        },
        __enterFrame : function(){
            var self = this;
            //不管怎么样，__enterFrame执行了就要把
            //requestAid null 掉
            self.requestAid = null;
            Base.now = new Date().getTime();
            if( self._heartBeat ){
                _.each(_.values( self.convertStages ) , function(convertStage){
                   convertStage.stage._render( convertStage.stage.context2D );
                });
                self._heartBeat = false;
                self.convertStages = {};
                //渲染完了，打上最新时间挫
                self._preRenderTime = new Date().getTime();
            };
            //先跑任务队列,因为有可能再具体的hander中会把自己清除掉
            //所以跑任务和下面的length检测分开来
            if(self._taskList.length > 0){
               for(var i=0,l = self._taskList.length ; i < l ; i++ ){
                  var obj = self._taskList[i];
                  if(obj.__enterFrame){
                     obj.__enterFrame();
                  } else {
                     self.__taskList.splice(i-- , 1);
                  }
               }  
            };
            //如果依然还有任务。 就继续enterFrame.
            if(self._taskList.length > 0){
               self.__startEnter();
            };
        },
        _afterAddChild : function( stage , index ){
            var canvas;
 
            if(!stage.context2D){
                canvas = Base._createCanvas( stage.id , this.context.width , this.context.height );
            } else {
                canvas = stage.context2D.canvas;
            }

            var canvaxDOMc = Base.getEl("cdc-"+this._cid);

            if(this.children.length == 1){
                //this.el.append( canvas );
                this.el.insertBefore( canvas , canvaxDOMc );
            } else if(this.children.length>1) {
                if( index == undefined ) {
                    //如果没有指定位置，那么就放到_hoverStage的下面。
                    this.el.insertBefore( canvas , this._hoverStage.context2D.canvas);
                } else {
                    //如果有指定的位置，那么就指定的位置来
                    if( index >= this.children.length-1 ){
                       //this.el.append( canvas );
                       this.el.insertBefore( canvas , canvaxDOMc );
                    } else {
                       this.el.insertBefore( canvas , this.children[ index ].context2D.canvas );
                    }
                }
            };
 
            Base.initElement( canvas );
            stage.initStage( canvas.getContext("2d") , this.context.width , this.context.height ); 
        },
        _afterDelChild : function(stage){
            this.el.removeChild( stage.context2D.canvas );
        },
        _convertCanvax : function(opt){
            _.each( this.children , function(stage){
                stage.context[opt.name] = opt.value; 
            } );  
        },
        heartBeat : function( opt ){
            //displayList中某个属性改变了
            var self = this;
            if( opt ){
                //心跳包有两种，一种是某元素的可视属性改变了。一种是children有变动
                //分别对应convertType  为 context  and children
                if (opt.convertType == "context"){
                    var stage   = opt.stage;
                    var shape   = opt.shape;
                    var name    = opt.name;
                    var value   = opt.value;
                    var preValue= opt.preValue;
 
                    if (!self._isReady) {
                        //在还没初始化完毕的情况下，无需做任何处理
                        return;
                    };
 
                    if( shape.type == "canvax" ){
                        self._convertCanvax(opt)
                    } else {
                        if(!self.convertStages[stage.id]){
                            self.convertStages[stage.id]={
                                stage : stage,
                                convertShapes : {}
                            }
                        };
                        if(shape){
                            if (!self.convertStages[ stage.id ].convertShapes[ shape.id ]){
                                self.convertStages[ stage.id ].convertShapes[ shape.id ]={
                                    shape : shape,
                                    convertType : opt.convertType
                                }
                            } else {
                                //如果已经上报了该shape的心跳。
                                return;
                            }
                        }
                    };
                };
 
                if (opt.convertType == "children"){
                    //元素结构变化，比如addchild removeChild等
                    var target = opt.target;
                    var stage = opt.src.getStage();
                    if( stage || (target.type=="stage") ){
                        //如果操作的目标元素是Stage
                        stage = stage || target;
                        if(!self.convertStages[stage.id]) {
                            self.convertStages[stage.id]={
                                stage : stage,
                                convertShapes : {}
                            }
                        }
                    }
                }
 
                if(!opt.convertType){
                    //无条件要求刷新
                    var stage = opt.stage;
                    if(!self.convertStages[stage.id]) {
                        self.convertStages[stage.id]={
                            stage : stage ,
                            convertShapes : {}
                        }
                    }
                }
            } else {
                //无条件要求全部刷新，一般用在resize等。
                _.each( self.children , function( stage , i ){
                    self.convertStages[ stage.id ] = {
                        stage : stage,
                        convertShapes : {}
                    }
                } );
            };
            
            
            if (!self._heartBeat){
               //如果发现引擎在静默状态，那么就唤醒引擎
               self._heartBeat = true;
               self.__startEnter();
            } else {
               //否则智慧继续确认心跳
               self._heartBeat = true;
            }
        },
        toDataURL: function(){
        	var canvas = Base._createCanvas( "curr_base64_canvas" , this.context.width , this.context.height );
            var ctx = canvas.getContext("2d");

        	_.each( this.children , function( stage ){
                ctx.drawImage( stage.context2D.canvas , 0 , 0 );
        	} );
        	
        	return canvas.toDataURL();
        }
    } );
 
 
    Canvax.Display = {
        Stage  : Stage,
        Sprite : Sprite,
        Shape  : Shape,
        Point  : Point,
        Text   : Text
    }
 
    Canvax.Event = {
        EventDispatcher : EventDispatcher,
        EventManager    : EventManager
    }
 
    return Canvax;
});