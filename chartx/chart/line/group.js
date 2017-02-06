define(
    "chartx/chart/line/group", [
        "canvax/index",
        "canvax/shape/BrokenLine",
        "canvax/shape/Circle",
        "canvax/shape/Path",
        "chartx/utils/tools",
        "chartx/utils/colorformat",
        "canvax/animation/Tween",
        "chartx/chart/theme",
        "canvax/animation/AnimationFrame"
    ],
    function(Canvax, BrokenLine, Circle, Path, Tools, ColorFormat, Tween, Theme, AnimationFrame) {
        window.Canvax = Canvax
        var Group = function(field, a, opt, ctx, sort, yAxis, h, w) {
            this.field = field; //_groupInd 在yAxis.field中对应的值
            this._groupInd = a;
            this._nodeInd = -1;
            this._yAxis = yAxis;
            this.sort = sort;
            this.ctx = ctx;
            this.w = w;
            this.h = h;
            this.y = 0;

            this.animation = true;
            this.resize = false;

            this.colors = Theme.colors;

            this.line = { //线
                enabled: 1,
                strokeStyle: this.colors[this._groupInd],
                lineWidth: 2,
                lineType: "solid",
                smooth: true
            };

            this.node = { //节点 
                enabled: 1, //是否有
                corner: false, //模式[false || 0 = 都有节点 | true || 1 = 拐角才有节点]
                r: 2, //半径 node 圆点的半径
                fillStyle: '#ffffff',
                strokeStyle: null,
                lineWidth: 4
            };

            this.text = {
                enabled : 0,
                fillStyle: null,
                strokeStyle: null,
                fontSize: 13,
                format: null,

            };

            this.fill = { //填充
                fillStyle: null,
                alpha: 0.05
            };

            this.dataOrg = []; //data的原始数据
            this.data = []; //data会在wight中过滤一遍，把两边的空节点剔除
            this.sprite = null;

            this._pointList = []; //brokenline最终的状态
            this._currPointList = []; //brokenline 动画中的当前状态
            this._bline = null;


            //从配置里面转换后的一些私有属性
            this.__lineStrokeStyle = null;

            this.init(opt)
        };

        Group.prototype = {
            init: function(opt) {
                _.deepExtend(this, opt);

                //如果opt中没有 node fill的设置，那么要把fill node 的style和line做同步
                //!this.node.strokeStyle && (this.node.strokeStyle = this._getLineStrokeStyle());
                //!this.fill.fillStyle && (this.fill.fillStyle = this._getLineStrokeStyle());

                this.sprite = new Canvax.Display.Sprite();
                var me = this;
                this.sprite.on("destroy" , function(){
                    if(me._growTween){
                        AnimationFrame.destroyTween( me._growTween );
                    }
                });
            },
            draw: function(opt) {
                _.deepExtend(this, opt);
                this._widget();
            },
            update: function(opt) {
                if(!this._bline){
                    return;
                };
                _.deepExtend(this, opt);
                if( opt.data ){
                    this._pointList = this._getPointList(this.data);
                    this._grow();
                };
                if( opt._groupInd !== undefined ){
                    var _strokeStyle = this._getLineStrokeStyle();
                    this._bline.context.strokeStyle = _strokeStyle;
                    this._fill.context.fillStyle = (this._getFillStyle() || _strokeStyle);
                    this._setNodesStyle();
                };
            },
            //自我销毁
            destroy: function() {
                var me = this;
                me.sprite.animate({
                    globalAlpha : 0
                } , {
                    duration: 300,
                    complate: function(){
                        me.sprite.remove();
                    }
                });
            },
            //styleType , normals , groupInd
            _getColor: function(s) {
                var color = this._getProp(s);
                if (!color || color == "") {
                    color = this.colors[this._groupInd];
                };
                return color;
            },
            _getProp: function(s) {
                if (_.isArray(s)) {
                    return s[this._groupInd]
                }
                if (_.isFunction(s)) {
                    var obj = {
                        iGroup: this._groupInd,
                        iNode: this._nodeInd,
                        field: this.field
                    };
                    if( this._nodeInd >= 0 ){
                        obj.value = this.data[ this._nodeInd ].value;
                    };

                    return s.apply( this , [obj] );
                }
                return s
            },

            //这个是tips需要用到的 
            getNodeInfoAt: function($index) {
                var self = this;
                self._nodeInd = $index;
                var o = _.clone(self.dataOrg[$index]);
                if (o && o.value != null && o.value != undefined && o.value !== "") {
                    o.r = self._getProp(self.node.r);
                    o.fillStyle = self._getProp(self.node.fillStyle) || "#ffffff";
                    o.strokeStyle = self._getProp(self.node.strokeStyle) || self._getLineStrokeStyle();
                    o.color = o.strokeStyle;
                    o.lineWidth = self._getProp(self.node.lineWidth) || 2;
                    o.alpha = self._getProp(self.fill.alpha);
                    o.field = self.field;
                    o._groupInd = self._groupInd;
                    // o.fillStyle = '#cc3300'
                    return o
                } else {
                    return null
                }
            },
            resetData: function(opt) {
                var self = this;
                self._pointList = this._getPointList(opt.data);
                var plen = self._pointList.length;
                var cplen = self._currPointList.length;
                if (plen < cplen) {
                    for (var i = plen, l = cplen; i < l; i++) {
                        self._circles && self._circles.removeChildAt(i);
                        self._texts && self._texts.removeChildAt(i);
                        l--;
                        i--;
                    };
                    self._currPointList.length = plen;
                };

                if (plen > cplen) {
                    diffLen = plen - cplen;
                    for (var i = 0; i < diffLen; i++) {
                        self._currPointList.push(_.clone(self._currPointList[cplen - 1]));
                    }
                };

                self._circles && self._circles.removeAllChildren();
                self._texts && self._texts.removeAllChildren();
                self._createNodes();
                self._createTexts();
                self._grow();
            },
            _grow: function(callback) {
            
                var self = this;
                if (!self.animation || self.resize) {
                    callback && callback(self);
                }
                if (self._currPointList.length == 0) {
                    return;
                };

                function _update( list ){
                    var _strokeStyle = self._getLineStrokeStyle();
                    self._bline.context.pointList = _.clone( list );
                    self._bline.context.strokeStyle = _strokeStyle;

                    self._fill.context.path = self._fillLine(self._bline);
                    self._fill.context.fillStyle = self._getFillStyle() || _strokeStyle;
                    self._circles && _.each(self._circles.children, function(circle, i) {
                        var ind = parseInt(circle.id.split("_")[1]);
                        circle.context.y = list[ind][1];
                        circle.context.x = list[ind][0];
                    });

                    self._texts && _.each(self._texts.children, function(text, i) {
                        var ind = parseInt(text.id.split("_")[1]);
                        text.context.y = list[ind][1] - 3;
                        text.context.x = list[ind][0];
                        self._checkTextPos( text , i );
                    });
                };

                this._growTween = AnimationFrame.registTween({
                    from: self._getPointPosStr(self._currPointList),
                    to: self._getPointPosStr(self._pointList),
                    desc: self.field + ' animation',
                    onUpdate: function() {
                        for (var p in this) {
                            var ind = parseInt(p.split("_")[2]);
                            var xory = parseInt(p.split("_")[1]);
                            self._currPointList[ind] && (self._currPointList[ind][xory] = this[p]); //p_1_n中间的1代表x or y
                        };
                        _update( self._currPointList );
                    },
                    onComplete: function() {
                        self._growTween = null;
                        //在动画结束后强制把目标状态绘制一次。
                        //解决在onUpdate中可能出现的异常会导致绘制有问题。
                        //这样的话，至少最后的结果会是对的。
                        _update( self._pointList );
                        callback && callback(self);
                    }
                });
            },
            _getPointPosStr: function(list) {
                var obj = {};
                _.each(list, function(p, i) {
                    obj["p_1_" + i] = p[1]; //p_y==p_1
                    obj["p_0_" + i] = p[0]; //p_x==p_0
                });
                return obj;
            },
            _isNotNum: function(val) {
                return val === undefined || isNaN(val) || val === null || val === ""
            },
            _filterEmptyValue: function(list) {

                //从左边开始 删除 value为非number的item
                for (var i = 0, l = list.length; i < l; i++) {
                    if (this._isNotNum(list[i].value)) {
                        list.shift();
                        l--;
                        i--;
                    } else {
                        break;
                    }
                };

                //从右边开始删除 value为非number的item
                for (var i = list.length - 1; i > 0; i--) {
                    if (this._isNotNum(list[i].value)) {
                        list.pop();
                    } else {
                        break;
                    }
                };
            },
            _getPointList: function(data) {
            
                var self = this;

                self.dataOrg = _.clone(data);
                self._filterEmptyValue(data);

                var list = [];
                for (var a = 0, al = data.length; a < al; a++) {
                    var o = data[a];
                    list.push([
                        o.x,
                        o.y
                    ]);
                };
                return list;
            },
            _widget: function(){
                var me = this;
                
                me._pointList = this._getPointList(me.data);

                if (me._pointList.length == 0) {
                    //filter后，data可能length==0
                    return;
                };
                var list = [];
                if (me.animation && !me.resize) {
                    for (var a = 0, al = me.data.length; a < al; a++) {
                        var o = me.data[a];
                        var sourceInd = 0;
                        //如果是属于双轴中的右轴。
                        if (me._yAxis.place == "right") {
                            sourceInd = al - 1;
                        };
                        list.push([
                            o.x,
                            me.data[sourceInd].y
                        ]);
                    };
                } else {
                    list = me._pointList;
                };
                
                me._currPointList = list;

                var bline = new BrokenLine({ //线条
                    context: {
                        pointList: list,
                        //strokeStyle: me._getLineStrokeStyle(),
                        lineWidth: me.line.lineWidth,
                        y: me.y,
                        smooth: me.line.smooth,
                        lineType: me._getProp(me.line.lineType),
                        //smooth为true的话，折线图需要对折线做一些纠正，不能超过底部
                        smoothFilter: function(rp) {
                            if (rp[1] > 0) {
                                rp[1] = 0;
                            } else if( Math.abs(rp[1]) > me.h ) {
                                rp[1] = -me.h;
                            }
                        }
                    }
                });
                if (!this.line.enabled) {
                    bline.context.visible = false
                };
                me.sprite.addChild(bline);
                me._bline = bline;
                
                var _strokeStyle = me._getLineStrokeStyle();
                bline.context.strokeStyle = _strokeStyle;

                var fill = new Path({ //填充
                    context: {
                        path: me._fillLine(bline),
                        fillStyle: me._getFillStyle() || _strokeStyle, //fill_gradient || me._getColor(me.fill.fillStyle),
                        globalAlpha: _.isArray(me.fill.alpha) ? 1 : me.fill.alpha //me._getProp( me.fill.alpha )
                    }
                });
                me.sprite.addChild(fill);
                me._fill = fill;
                me._createNodes();
                me._createTexts();
            },
            _getFillStyle: function( ) {

                var self = this;
            
                var fill_gradient = null;
                var _fillStyle = self.fill.fillStyle;

                if( !_fillStyle ){
                    //如果没有配置的fillStyle，那么就取对应的line.strokeStyle
                    _fillStyle = self._getLineStrokeStyle("fillStyle")
                }

                _fillStyle && (_fillStyle = self._getColor(self.fill.fillStyle));

                if (_.isArray(self.fill.alpha) && !(_fillStyle instanceof CanvasGradient)) {
                    //alpha如果是数组，那么就是渐变背景，那么就至少要有两个值
                    //如果拿回来的style已经是个gradient了，那么就不管了
                    self.fill.alpha.length = 2;
                    if (self.fill.alpha[0] == undefined) {
                        self.fill.alpha[0] = 0;
                    };
                    if (self.fill.alpha[1] == undefined) {
                        self.fill.alpha[1] = 0;
                    };

                    //从bline中找到最高的点
                    var topP = _.min(self._bline.context.pointList, function(p) {
                        return p[1]
                    });
                    //创建一个线性渐变
                    fill_gradient = self.ctx.createLinearGradient(topP[0], topP[1], topP[0], 0);

                    var rgb = ColorFormat.colorRgb( _fillStyle );
                    var rgba0 = rgb.replace(')', ', ' + self._getProp(self.fill.alpha[0]) + ')').replace('RGB', 'RGBA');
                    fill_gradient.addColorStop(0, rgba0);

                    var rgba1 = rgb.replace(')', ', ' + self.fill.alpha[1] + ')').replace('RGB', 'RGBA');
                    fill_gradient.addColorStop(1, rgba1);

                    _fillStyle = fill_gradient;
                };
            
                return _fillStyle;
            },
            _getLineStrokeStyle: function( from ) {
                var self = this;
                
                if( this.line.strokeStyle.lineargradient ){
                    //如果填充是一个线性渐变
                    //从bline中找到最高的点
                    var topP = _.min(self._bline.context.pointList, function(p) {
                        return p[1]
                    });
                    var bottomP = _.max(self._bline.context.pointList, function(p) {
                        return p[1]
                    });
                    if( from == "fillStyle" ){
                        bottomP = [ 0 , 0 ];
                    };
                    //var bottomP = [ 0 , 0 ];
                    //创建一个线性渐变
                    this.__lineStrokeStyle = self.ctx.createLinearGradient(topP[0], topP[1], topP[0], bottomP[1]);

                    if( !_.isArray( this.line.strokeStyle.lineargradient ) ){
                        this.line.strokeStyle.lineargradient = [this.line.strokeStyle.lineargradient];
                    };

                    _.each(this.line.strokeStyle.lineargradient , function( item , i ){
                        self.__lineStrokeStyle.addColorStop( item.position , item.color);
                    });

                } else {
                    this.__lineStrokeStyle = this._getColor(this.line.strokeStyle);
                }
                return this.__lineStrokeStyle;
            },
            _setNodesStyle: function(){
                var self = this;
                var list = self._currPointList;
                if ((self.node.enabled || list.length == 1) && !!self.line.lineWidth) { //拐角的圆点
                    for (var a = 0, al = list.length; a < al; a++) {
                        self._nodeInd = a;
                        var nodeEl = self._circles.getChildAt( a );
                        var strokeStyle = self._getProp(self.node.strokeStyle) || self._getLineStrokeStyle(); 
                        nodeEl.context.fillStyle = list.length == 1 ? strokeStyle : self._getProp(self.node.fillStyle) || "#ffffff";
                        nodeEl.context.strokeStyle = strokeStyle;

                        self._nodeInd = -1;
                    }
                }
            },
            _createNodes: function() {
                var self = this;
                var list = self._currPointList;

                if ((self.node.enabled || list.length == 1) && !!self.line.lineWidth) { //拐角的圆点
                    this._circles = new Canvax.Display.Sprite({});
                    this.sprite.addChild(this._circles);
                    for (var a = 0, al = list.length; a < al; a++) {
                        var context = {
                            x: self._currPointList[a][0],
                            y: self._currPointList[a][1],
                            r: self._getProp(self.node.r),
                            lineWidth: self._getProp(self.node.lineWidth) || 2
                        };

                        var circle = new Circle({
                            id: "circle_"+a,
                            context: context
                        });

                        if (self.node.corner) { //拐角才有节点
                            var y = self._pointList[a][1];
                            var pre = self._pointList[a - 1];
                            var next = self._pointList[a + 1];
                            if (pre && next) {
                                if (y == pre[1] && y == next[1]) {
                                    circle.context.visible = false;
                                }
                            }
                        };
                        self._circles.addChild(circle);
                    }
                };
                this._setNodesStyle();
            },
            _createTexts: function() {
                
                var self = this;
                var list = self._currPointList;

                if ( self.text.enabled ) { //节点上面的文本info
                    this._texts = new Canvax.Display.Sprite({});
                    this.sprite.addChild(this._texts);
                    
                    for (var a = 0, al = list.length; a < al; a++) {
                        self._nodeInd = a;
                        var fontFillStyle = self._getProp(self.text.fillStyle) || self._getProp(self.node.strokeStyle) || self._getLineStrokeStyle();
                        self._nodeInd = -1;
                        var context = {
                            x: self._currPointList[a][0],
                            y: self._currPointList[a][1] - 3,
                            fontSize: this.text.fontSize,
                            textAlign: "center",
                            textBaseline: "bottom",
                            fillStyle: fontFillStyle,
                            lineWidth:1,
                            strokeStyle:"#ffffff"
                        };

                        var content = self.data[ a ].value;
                        if (_.isFunction(self.text.format)) {
                            content = (self.text.format.apply( self , [content , a]) || content );
                        };

                        var text =  new Canvax.Display.Text( content , {
                            id: "text_"+a,
                            context: context
                        });

                        self._texts.addChild(text);
                        self._checkTextPos( text , a );

                    }
                };
                this._setNodesStyle();
            },
            _checkTextPos : function( text , ind ){
                var self = this;
                var list = self._currPointList;
                var pre = list[ ind - 1 ];
                var next = list[ ind + 1 ];
                if( ind == 0 ){
                    text.context.textAlign = "left"
                }; 
                if( ind == list.length-1 ){
                    text.context.textAlign = "right"
                };

                if( 
                    pre && next &&
                    ( pre[1] < text.context.y && next[1] < text.context.y )
                 ){
                    text.context.y += 7;
                    text.context.textBaseline = "top"
                }
              
            },
            _fillLine: function(bline) { //填充直线
                var fillPath = _.clone(bline.context.pointList);
                if( fillPath.length == 0 ){
                    return "";
                }
                var baseY = 0;
                if (this.sort == "desc") {
                    baseY = -this.h;
                }
                fillPath.push(
                    [fillPath[fillPath.length - 1][0], baseY], [fillPath[0][0], baseY], [fillPath[0][0], fillPath[0][1]]
                );
                return Tools.getPath(fillPath);
            }
        };
        return Group;
    }
)