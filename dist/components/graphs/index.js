"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _component = _interopRequireDefault(require("../component"));

var _canvax = _interopRequireDefault(require("canvax"));

var _tools = require("../../utils/tools");

var AnimationFrame = _canvax["default"].AnimationFrame;
var _ = _canvax["default"]._;

var GraphsBase =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(GraphsBase, _Component);
  (0, _createClass2["default"])(GraphsBase, null, [{
    key: "defaultProps",
    value: function defaultProps() {
      return {
        type: {
          detail: '绘图组件',
          "default": "",
          insertText: "type: ",
          values: ["bar", "line", "pie", "scat"] //具体的在index中批量设置，

        },
        animation: {
          detail: '是否开启入场动画',
          "default": true
        },
        aniDuration: {
          detail: '动画时长',
          "default": 500
        }
      };
    }
  }]);

  function GraphsBase(opt, app) {
    var _this;

    (0, _classCallCheck2["default"])(this, GraphsBase);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(GraphsBase).call(this, opt, app)); //这里不能把opt个extend进this

    _.extend(true, (0, _assertThisInitialized2["default"])(_this), (0, _tools.getDefaultProps)(GraphsBase.defaultProps()));

    _this.name = "graphs"; //这里所有的opts都要透传给 group

    _this._opt = opt || {};
    _this.app = app;
    _this.ctx = app.stage.canvas.getContext("2d");
    _this.dataFrame = app.dataFrame; //app.dataFrame的引用

    _this.data = null; //没个graphs中自己_trimGraphs的数据

    _this.width = 0;
    _this.height = 0;
    _this.origin = {
      x: 0,
      y: 0
    };
    _this.inited = false;
    _this.sprite = new _canvax["default"].Display.Sprite({
      name: "graphs_" + opt.type
    });

    _this.app.graphsSprite.addChild(_this.sprite);

    _this._growTween = null;
    var me = (0, _assertThisInitialized2["default"])(_this);

    _this.sprite.on("destroy", function () {
      if (me._growTween) {
        AnimationFrame.destroyTween(me._growTween);
        me._growTween = null;
      }

      ;
    });

    return _this;
  }

  (0, _createClass2["default"])(GraphsBase, [{
    key: "tipsPointerOf",
    value: function tipsPointerOf(e) {}
  }, {
    key: "tipsPointerHideOf",
    value: function tipsPointerHideOf(e) {}
  }, {
    key: "focusAt",
    value: function focusAt(ind, field) {}
  }, {
    key: "unfocusAt",
    value: function unfocusAt(ind, field) {}
  }, {
    key: "selectAt",
    value: function selectAt(ind, field) {}
  }, {
    key: "unselectAt",
    value: function unselectAt(ind, field) {} //获取选中的 数据点

  }, {
    key: "getSelectedList",
    value: function getSelectedList() {
      return [];
    } //获取选中的 列数据, 比如柱状图中的多分组，选中一列数据，则包函了这分组内的所有柱子

  }, {
    key: "getSelectedRowList",
    value: function getSelectedRowList() {
      return [];
    }
  }, {
    key: "hide",
    value: function hide(field) {}
  }, {
    key: "show",
    value: function show(field) {}
  }, {
    key: "getLegendData",
    value: function getLegendData() {} //触发事件, 事件处理函数中的this都指向对应的graphs对象。

  }, {
    key: "triggerEvent",
    value: function triggerEvent(e) {
      var trigger = e.eventInfo.trigger || this;
      var fn = trigger["on" + e.type];

      if (fn && _.isFunction(fn)) {
        //如果有在pie的配置上面注册对应的事件，则触发
        if (e.eventInfo && e.eventInfo.nodes && e.eventInfo.nodes.length) {
          //完整的nodes数据在e.eventInfo中有，但是添加第二个参数，如果nodes只有一个数据就返回单个，多个则数组
          if (e.eventInfo.nodes.length == 1) {
            fn.apply(this, [e, e.eventInfo.nodes[0]]);
          } else {
            fn.apply(this, [e, e.eventInfo.nodes]);
          }

          ;
        } else {
          /*
          let _arr = [];
          _.each( arguments, function(item, i){
              if( !!i ){
                  _arr.push( item );
              }
          } );
          */
          fn.apply(this, arguments);
        }
      }

      ;
    } //所有graphs默认的grow

  }, {
    key: "grow",
    value: function grow(callback, opt) {
      !opt && (opt = {});
      var me = this;
      var duration = this.aniDuration;

      if (!this.animation) {
        duration = 0;
      }

      ;
      var from = 0;
      var to = 1;
      if ("from" in opt) from = opt.from;
      if ("to" in opt) to = opt.to;
      this._growTween = AnimationFrame.registTween({
        from: {
          process: from
        },
        to: {
          process: to
        },
        duration: duration,
        onUpdate: function onUpdate(status) {
          _.isFunction(callback) && callback(status.process);
        },
        onComplete: function onComplete() {
          this._growTween = null;
          me.fire("complete");
        }
      });
    }
  }]);
  return GraphsBase;
}(_component["default"]);

exports["default"] = GraphsBase;