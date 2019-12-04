"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "canvax", "../index", "mmvis", "../../../layout/force/index"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("canvax"), require("../index"), require("mmvis"), require("../../../layout/force/index"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.canvax, global.index, global.mmvis, global.index);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _canvax, _index, _mmvis, _index3) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _canvax2 = _interopRequireDefault(_canvax);

  var _index2 = _interopRequireDefault(_index);

  var force = _interopRequireWildcard(_index3);

  function _getRequireWildcardCache() {
    if (typeof WeakMap !== "function") return null;
    var cache = new WeakMap();

    _getRequireWildcardCache = function () {
      return cache;
    };

    return cache;
  }

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    }

    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
      return {
        default: obj
      };
    }

    var cache = _getRequireWildcardCache();

    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }

    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }

    newObj.default = obj;

    if (cache) {
      cache.set(obj, newObj);
    }

    return newObj;
  }

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  var Rect = _canvax2["default"].Shapes.Rect;
  var Path = _canvax2["default"].Shapes.Path;
  var Arrow = _canvax2["default"].Shapes.Arrow;
  var Circle = _canvax2["default"].Shapes.Circle;

  var Force = function (_GraphsBase) {
    _inherits(Force, _GraphsBase);

    _createClass(Force, null, [{
      key: "defaultProps",
      value: function defaultProps() {
        return {
          keyField: {
            detail: 'key字段',
            "default": 'key'
          },
          valueField: {
            detail: 'value字段',
            "default": 'value'
          },
          node: {
            detail: '单个节点的配置',
            propertys: {
              shapeType: {
                detail: '节点图形',
                "default": 'circle'
              },
              maxWidth: {
                detail: '节点最大的width',
                "default": 200
              },
              width: {
                detail: '内容的width',
                "default": null
              },
              height: {
                detail: '内容的height',
                "default": null
              },
              radius: {
                detail: '圆角角度',
                "default": 6
              },
              fillStyle: {
                detail: '节点背景色',
                "default": '#e5e5e5'
              },
              strokeStyle: {
                detail: '描边颜色',
                "default": '#e5e5e5'
              },
              padding: {
                detail: 'node节点容器到内容的边距',
                "default": 10
              },
              content: {
                detail: '节点内容配置',
                propertys: {
                  field: {
                    detail: '内容字段',
                    documentation: '默认content字段',
                    "default": 'content'
                  },
                  fontColor: {
                    detail: '内容文本颜色',
                    "default": '#666'
                  },
                  format: {
                    detail: '内容格式化处理函数',
                    "default": null
                  },
                  textAlign: {
                    detail: "textAlign",
                    "default": "center"
                  },
                  textBaseline: {
                    detail: 'textBaseline',
                    "default": "middle"
                  }
                }
              }
            }
          },
          line: {
            detail: '两个节点连线配置',
            propertys: {
              lineWidth: {
                detail: '线宽',
                "default": 1
              },
              strokeStyle: {
                detail: '连线的颜色',
                "default": '#e5e5e5'
              },
              lineType: {
                detail: '连线样式（虚线等）',
                "default": 'solid'
              },
              arrow: {
                detail: '是否有箭头',
                "default": true
              }
            }
          },
          status: {
            detail: '一些开关配置',
            propertys: {
              transform: {
                detail: "是否启动拖拽缩放整个画布",
                propertys: {
                  fitView: {
                    detail: "自动缩放",
                    "default": '' //autoZoom

                  },
                  enabled: {
                    detail: "是否开启",
                    "default": true
                  },
                  scale: {
                    detail: "缩放值",
                    "default": 1
                  },
                  scaleOrigin: {
                    detail: "缩放原点",
                    "default": {
                      x: 0,
                      y: 0
                    }
                  }
                }
              }
            }
          }
        };
      }
    }]);

    function Force(opt, app) {
      var _this;

      _classCallCheck(this, Force);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Force).call(this, opt, app));
      _this.type = "force";

      _mmvis._.extend(true, _assertThisInitialized(_this), (0, _mmvis.getDefaultProps)(Force.defaultProps()), opt);

      _this.domContainer = app.canvax.domView;

      _this.init();

      return _this;
    }

    _createClass(Force, [{
      key: "init",
      value: function init() {
        this.nodesSp = new _canvax2["default"].Display.Sprite({
          id: "nodesSp"
        });
        this.edgesSp = new _canvax2["default"].Display.Sprite({
          id: "edgesSp"
        });
        this.graphsSp = new _canvax2["default"].Display.Sprite({
          id: "graphsSp"
        });
        this.graphsSp.addChild(this.edgesSp);
        this.graphsSp.addChild(this.nodesSp);
        this.sprite.addChild(this.graphsSp);
      }
    }, {
      key: "draw",
      value: function draw(opt) {
        !opt && (opt = {});

        _mmvis._.extend(true, this, opt);

        this.data = opt.data || this._initData();
        this.widget();
      }
    }, {
      key: "_initData",
      value: function _initData() {
        //和关系图那边保持data格式的统一
        var data = {
          nodes: [//{ type,key,content,ctype,width,height,x,y }
          ],
          edges: [//{ type,key[],content,ctype,width,height,x,y }
          ],
          size: {
            width: this.app.width,
            height: this.app.height
          }
        };
        var _nodeMap = {};

        for (var i = 0; i < this.dataFrame.length; i++) {
          var rowData = this.dataFrame.getRowDataAt(i);

          var fields = _mmvis._.flatten([(rowData[this.keyField] + "").split(",")]);

          var content = this._getContent(rowData);

          var key = fields.length == 1 ? fields[0] : fields;
          var node = {
            type: "force",
            iNode: i,
            rowData: rowData,
            key: key,
            content: content,
            ctype: this._checkHtml(content) ? 'html' : 'canvas',
            //下面三个属性在_setElementAndSize中设置
            element: new _canvax2["default"].Display.Sprite({
              id: "nodeSp_" + key
            }),
            //外面传的layout数据可能没有element，widget的时候要检测下
            width: null,
            height: null,
            radius: 1,
            //默认为1
            //这个在layout的时候设置
            x: null,
            y: null,
            shapeType: null,
            //如果是edge，要填写这两节点
            source: null,
            target: null
          }; //_.extend(node, this._getElementAndSize(node));

          if (fields.length == 1) {
            node.shapeType = this.getProp(this.node.shapeType, node);
            data.nodes.push(node);
            _nodeMap[node.key] = node;
          } else {
            node.shapeType = "line";
            data.edges.push(node);
          }

          ;
        }

        ; //然后给edge填写source 和 target

        _mmvis._.each(data.edges, function (edge) {
          var keys = edge.key;
          edge.source = _nodeMap[keys[0]];
          edge.target = _nodeMap[keys[1]];
        });

        return data;
      }
    }, {
      key: "widget",
      value: function widget() {
        var _this2 = this;

        var me = this;
        var keyField = this.keyField;
        var valField = this.valueField;
        var links = this.data.edges.map(function (d) {
          //source: "Napoleon", target: "Myriel", value: 1
          return {
            source: d.source[keyField],
            target: d.target[keyField],
            value: d.rowData[valField],
            nodeData: d
          };
        });
        var nodes = this.data.nodes.map(function (d) {
          var node = Object.create(d);
          node.id = d.key;
          node.nodeData = d;
          return node;
        });
        var simulation = force.forceSimulation(nodes).force("link", force.forceLink(links).id(function (d) {
          return d.id;
        })).force("charge", force.forceManyBody()).force("center", force.forceCenter(this.data.size.width / 2, this.data.size.height / 2));
        nodes.forEach(function (node) {
          var fillStyle = me.getProp(me.node.fillStyle, node);
          var strokeStyle = me.getProp(me.node.strokeStyle, node); //let radius = _.flatten([me.getProp(me.node.radius, node)]);

          var _elem = new Circle({
            context: {
              r: 5,
              fillStyle: fillStyle,
              strokeStyle: strokeStyle
            }
          });

          _this2.nodesSp.addChild(_elem);

          node.nodeData.element = _elem;
        });
        simulation.on("tick", function () {
          nodes.forEach(function (node) {
            debugger;
            var elemCtx = node.nodeData.element.context;

            if (elemCtx) {
              elemCtx.x = node.x;
              elemCtx.y = node.y;
            }

            ; //var lineWidth = me.getProp( me.line.lineWidth, edge );
            //var strokeStyle = me.getProp( me.line.strokeStyle, edge );
          });
        });
      }
    }, {
      key: "_checkHtml",
      value: function _checkHtml(str) {
        var reg = /<[^>]+>/g;
        return reg.test(str);
      }
    }, {
      key: "_getContent",
      value: function _getContent(rowData) {
        var me = this;

        var _c; //this.node.content;


        if (this._isField(this.node.content.field)) {
          _c = rowData[this.node.content.field];
        }

        ;

        if (me.node.content.format && _mmvis._.isFunction(me.node.content.format)) {
          _c = me.node.content.format.apply(this, [_c, rowData]);
        }

        ;
        return _c;
      }
    }, {
      key: "_isField",
      value: function _isField(str) {
        return ~this.dataFrame.fields.indexOf(str);
      }
    }, {
      key: "getNodesAt",
      value: function getNodesAt(index) {}
    }, {
      key: "getProp",
      value: function getProp(prop, nodeData) {
        var _prop = prop;

        if (this._isField(prop)) {
          _prop = nodeData.rowData[prop];
        } else {
          if (_mmvis._.isArray(prop)) {
            _prop = prop[nodeData.iNode];
          }

          ;

          if (_mmvis._.isFunction(prop)) {
            _prop = prop.apply(this, [nodeData]);
          }

          ;
        }

        ;
        return _prop;
      }
    }]);

    return Force;
  }(_index2["default"]);

  _mmvis.global.registerComponent(Force, 'graphs', 'force');

  exports["default"] = Force;
});