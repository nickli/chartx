define(
    "chartx/chart/bar/graphs", [
        "canvax/index",
        "canvax/shape/Rect",
        "chartx/utils/tools",
        "chartx/chart/theme",
        "canvax/animation/AnimationFrame",
        "canvax/shape/BrokenLine"
    ],
    function(Canvax, Rect, Tools, Theme, AnimationFrame, BrokenLine) {

        var Graphs = function(opt, root) {
            this.data = [];
            this.w = 0;
            this.h = 0;
            this.root = root;
            this._yAxisFieldsMap = {}; //{"uv":{index:0,fillStyle:"" , ...} ...}
            this._setyAxisFieldsMap();

            this.animation = true;

            this.pos = {
                x: 0,
                y: 0
            };

            this._colors = Theme.colors;

            this.bar = {
                width: 0,
                _width: 0,
                radius: 4,
                fillStyle : null,
                filter : function(){} //用来定制bar的样式
            };

            this.text = {
                enabled: false,
                fillStyle: '#999',
                fontSize: 12,
                format: null,
                lineWidth:1,
                strokeStyle: 'white'
            };

            this.average = {
                enabled: false,
                field: "average",
                fieldInd: -1,
                fillStyle: "#c4c9d6",
                data: null
            };

            this.checked = {
                enabled: false,
                fillStyle: '#00A8E6',
                strokeStyle: '#00A8E6',
                globalAlpha: 0.1,
                lineWidth: 2
            }

            this.sort = null;

            this._barsLen = 0;

            this.eventEnabled = true;

            this.sprite = null;
            this.txtsSp = null;
            this.checkedSp = null;

            this.yDataSectionLen = 0; //y轴方向有多少个section

            _.deepExtend(this, opt);

            this._initaverage();

            this.init();
        };

        Graphs.prototype = {
            init: function() {
                this.sprite = new Canvax.Display.Sprite({
                    id: "graphsEl"
                });
                this.barsSp = new Canvax.Display.Sprite({
                    id: "barsSp"
                });
                this.txtsSp = new Canvax.Display.Sprite({
                    id: "txtsSp",
                    context: {
                        //visible: false
                    }
                });
                this.checkedSp = new Canvax.Display.Sprite({
                    id: "checkedSp"
                });
            },
            setX: function($n) {
                this.sprite.context.x = $n
            },
            setY: function($n) {
                this.sprite.context.y = $n
            },
            getInfo: function(index) {
                //该index指当前
                return this._getInfoHandler({
                    iGroup: index
                })
            },
            _checked: function($o) {
                var me = this
                var index = $o.iNode
                var group = me.barsSp.getChildById('barGroup_' + index)
                if (!group) {
                    return
                }

                me.checkedSp.removeChildById('line_' + index)
                me.checkedSp.removeChildById('rect_' + index)
                var hoverRect = group.getChildAt(0)
                var x0 = hoverRect.context.x
                var x1 = hoverRect.context.x + hoverRect.context.width,
                    y = -me.h

                if ($o.checked) {
                    var rect = new Rect({
                        id: "rect_" + index,
                        pointChkPriority: false,
                        context: {
                            x: x0,
                            y: y,
                            width: hoverRect.context.width,
                            height: hoverRect.context.height,
                            fillStyle: me.checked.fillStyle,
                            globalAlpha: me.checked.globalAlpha
                        }
                    });
                    me.checkedSp.addChild(rect)

                    var line = new BrokenLine({
                        id: "line_" + index,
                        context: {
                            pointList: [
                                [x0, y],
                                [x1, y]
                            ],
                            strokeStyle: me.checked.strokeStyle,
                            lineWidth: me.checked.lineWidth
                        }
                    });
                    me.checkedSp.addChild(line)
                }
            },
            removeAllChecked: function() {
                var me = this
                me.checkedSp.removeAllChildren()
            },
            setBarStyle: function($o) {
                var me = this
                var index = $o.iNode
                var group = me.barsSp.getChildById('barGroup_' + index)
                
                var fillStyle = $o.fillStyle || me._getColor(me.bar.fillStyle)
                for (var a = 0, al = group.getNumChildren(); a < al; a++) {
                    var rectEl = group.getChildAt(a)
                    rectEl.context.fillStyle = fillStyle
                }
            },
            _setyAxisFieldsMap: function() {
                var me = this;
                _.each(_.flatten(this.root.dataFrame.yAxis.field), function(field, i) {
                    me._yAxisFieldsMap[field] = {
                        index: i
                    };
                });
            },
            _initaverage: function() {
                if (this.average.enabled) {
                    _.each(this.root.dataFraem, function(fd, i) {
                        if (fd.field == this.average.field) {
                            this.average.fieldInd = i;
                        }
                    });
                }
            },
            _getColor: function(c, groups, vLen, i, h, v, value, field) {
                var style = null;
                if (_.isString(c)) {
                    style = c
                };
                if (_.isArray(c)) {
                    style = _.flatten(c)[this._yAxisFieldsMap[field].index];
                };
                if (_.isFunction(c)) {
                    style = c.apply(this, [{
                        iGroup: i,
                        iNode: h,
                        iLay: v,
                        field: field,
                        value: value,
                        xAxis: {
                            field: this.root._xAxis.field,
                            value: this.root._xAxis.data[h].content
                        }
                    }]);
                };
                if (!style || style == "") {
                    style = this._colors[this._yAxisFieldsMap[field].index];
                };
                return style;
            },
            //只用到了i v。 i＝＝ 一级分组， v 二级分组
            _getFieldFromIHV : function( i , h , v ){
                var yField = this.root._yAxis.field;
                var field = null;
                if( _.isString(yField[i]) ){
                    field = yField[i];
                } else if( _.isArray(yField[i]) ){
                    field = yField[i][v];
                }
                return field;
            },
            checkBarW: function(xDis1, xDis2) {
                if (this.bar.width) {
                    if (_.isFunction(this.bar.width)) {
                        this.bar._width = this.bar.width(xDis1);
                    } else {
                        this.bar._width = this.bar.width;
                    }
                } else {
                    this.bar._width = parseInt(xDis2) - (parseInt(Math.max(1, xDis2 * 0.3)));

                    //这里的判断逻辑用意已经忘记了，先放着， 有问题在看
                    if (this.bar._width == 1 && xDis1 > 3) {
                        this.bar._width = parseInt(xDis1) - 2;
                    };
                };
                this.bar._width < 1 && (this.bar._width = 1);
            },
            resetData: function(data, opt) {
                this.draw(data.data, opt);
            },
            draw: function(data, opt) {
                _.deepExtend(this, opt);
                if (data.length == 0) {
                    return;
                };

                var preLen = 0;
                this.data[0] && (preLen = this.data[0][0].length);

                this.data = data;
                var me = this;
                var groups = data.length;
                var itemW = 0;

                _.each(data, function(h_group, i) {
                    /*
                    //h_group为横向的分组。如果yAxis.field = ["uv","pv"]的话，
                    //h_group就会为两组，一组代表uv 一组代表pv。
                    var spg = new Canvax.Display.Sprite({ id : "barGroup"+i });
                    */

                    //vLen 为一单元bar上面纵向堆叠的length
                    //比如yAxis.field = [?
                    //    ["uv","pv"],  vLen == 2
                    //    "click"       vLen == 1
                    //]

                    //if (h <= preLen - 1)的话说明本次绘制之前sprite里面已经有bar了。需要做特定的动画效果走过去

                    var vLen = h_group.length;
                    if (vLen == 0) return;
                    var hLen = h_group[0].length;

                    //itemW 还是要跟着xAxis的xDis保持一致
                    itemW = parseInt(me.w / hLen);

                    me._barsLen = hLen * groups;

                    for (h = 0; h < hLen; h++) {
                        var groupH;
                        if (i == 0) {
                            //横向的分组
                            if (h <= preLen - 1) {
                                groupH = me.barsSp.getChildById("barGroup_" + h);
                            } else {
                                groupH = new Canvax.Display.Sprite({
                                    id: "barGroup_" + h
                                });
                                me.barsSp.addChild(groupH);
                                groupH.iNode = h;
                                groupH.on("click dblclick mousedown mousemove mouseup", function(e) {
                                    if (!e.eventInfo) {
                                        e.eventInfo = me._getInfoHandler(this);
                                    };
                                });
                            };

                            if (me.eventEnabled) {
                                var hoverRect;
                                if (h <= preLen - 1) {
                                    hoverRect = groupH.getChildById("bhr_" + h);
                                    hoverRect.context.width = itemW;
                                    hoverRect.context.x = itemW * h;
                                } else {
                                    hoverRect = new Rect({
                                        id: "bhr_" + h,
                                        pointChkPriority: false,
                                        context: {
                                            x: itemW * h,
                                            y: (me.sort && me.sort == "desc") ? 0 : -me.h,
                                            width: itemW,
                                            height: me.h,
                                            fillStyle: "#ccc",
                                            globalAlpha: 0
                                        }
                                    });
                                    groupH.addChild(hoverRect);
                                    hoverRect.hover(function(e) {
                                        this.context.globalAlpha = 0.1;
                                    }, function(e) {
                                        this.context.globalAlpha = 0;
                                    });
                                    hoverRect.iGroup = -1, hoverRect.iNode = h, hoverRect.iLay = -1;
                                    hoverRect.on("panstart mouseover mousemove mouseout click", function(e) {
                                        e.eventInfo = me._getInfoHandler(this, e);
                                    });
                                }
                            };
                        } else {
                            groupH = me.barsSp.getChildById("barGroup_" + h);
                        };

                        //同上面，给txt做好分组
                        var txtGroupH;
                        if (i == 0) {
                            if (h <= preLen - 1) {
                                txtGroupH = me.txtsSp.getChildById("txtGroup_" + h);
                            } else {
                                txtGroupH = new Canvax.Display.Sprite({
                                    id: "txtGroup_" + h
                                });
                                me.txtsSp.addChild(txtGroupH);
                                txtGroupH.iGroup = i;
                            };
                        } else {
                            txtGroupH = me.txtsSp.getChildById("txtGroup_" + h);
                        };

                        for (v = 0; v < vLen; v++) {
                            //单个的bar，从纵向的底部开始堆叠矩形
                            var rectData = h_group[v][h];
                            rectData.iGroup = i, rectData.iNode = h, rectData.iLay = v
                            var rectH = parseInt(Math.abs(rectData.y));
                            if (v > 0) {
                                rectH = rectH - parseInt(Math.abs(h_group[v - 1][h].y));
                            };
                            var beginY = parseInt(rectData.y);

                            var fillStyle = me._getColor(me.bar.fillStyle, groups, vLen, i, h, v, rectData.value, rectData.field);

                            //根据第一行数据来配置下_yAxisFieldsMap中对应field的fillStyle
                            if (h == 0) {
                                var _yMap = me._yAxisFieldsMap[ me._getFieldFromIHV( i , h , v ) ];
                                if (!_yMap.fillStyle) {
                                    _yMap.fillStyle = fillStyle;
                                };
                            }

                            rectData.fillStyle = fillStyle;

                            var finalPos = {
                                x: Math.round(rectData.x - me.bar._width / 2),
                                y: beginY,
                                width: parseInt(me.bar._width),
                                height: rectH,
                                fillStyle: fillStyle,
                                scaleY: 1
                            };
                            var rectCxt = {
                                x: finalPos.x,
                                y: 0,
                                width: finalPos.width,
                                height: finalPos.height,
                                fillStyle: finalPos.fillStyle,
                                scaleY: 0
                            };
                            
                            if (!!me.bar.radius && v == vLen - 1) {
                                var radiusR = Math.min(me.bar._width / 2, rectH);
                                radiusR = Math.min(radiusR, me.bar.radius);
                                rectCxt.radius = [radiusR, radiusR, 0, 0];
                            };

                            if (!me.animation) {
                                delete rectCxt.scaleY;
                                rectCxt.y = finalPos.y;
                            };

                            var rectEl;
                            if (h <= preLen - 1) {
                                rectEl = groupH.getChildById("bar_" + i + "_" + h + "_" + v);
                                rectEl.context.fillStyle = fillStyle;
                            } else {
                                rectEl = new Rect({
                                    id: "bar_" + i + "_" + h + "_" + v,
                                    context: rectCxt
                                });
                                groupH.addChild(rectEl);
                            };

                            rectEl.finalPos = finalPos;

                            rectEl.iGroup = i, rectEl.iNode = h, rectEl.iLay = v;

                            me.bar.filter.apply( rectEl, [ rectData , me] );

                            if (me.eventEnabled) {
                                rectEl.on("panstart mouseover mousemove mouseout click dblclick", function(e) {
                                    e.eventInfo = me._getInfoHandler(this, e);
                                    if (e.type == "mouseover") {
                                        this.parent.getChildById("bhr_" + this.iNode).context.globalAlpha = 0.1;
                                    }
                                    if (e.type == "mouseout") {
                                        this.parent.getChildById("bhr_" + this.iNode).context.globalAlpha = 0;
                                    }
                                });
                            };

                            if (v == vLen - 1 && me.text.enabled) {
                                //文字
                                var contents = [rectData];

                                var infosp;
                                if (h <= preLen - 1) {
                                    infosp = txtGroupH.getChildById("infosp_" + i + "_" + h);
                                } else {
                                    infosp = new Canvax.Display.Sprite({
                                        id: "infosp_" + i + "_" + h,
                                        context: {
                                            visible: false
                                        }
                                    });
                                    infosp._hGroup = h;
                                    txtGroupH.addChild(infosp);
                                };

                                if (vLen > 1) {
                                    for (var c = vLen - 2; c >= 0; c--) {
                                        contents.unshift(h_group[c][h]);
                                    }
                                };

                                var infoWidth = 0;
                                var infoHeight = 0;
                                
                                _.each(contents, function(cdata, ci) {
                                    var content = cdata.value;
                                    if (_.isFunction(me.text.format)) {
                                        var _formatc = me.text.format.apply( self , [content , cdata]);
                                        if(!!_formatc || _formatc==="" || _formatc===0){
                                            content = _formatc
                                        }
                                    };
                                    if (!me.animation && _.isNumber(content)) {
                                        content = Tools.numAddSymbol(content);
                                    };

                                    if( content === "" ){
                                        return;
                                    };

                                    if (ci > 0 && infosp.children.length>0) {
                                        txt = new Canvax.Display.Text("/", {
                                            context: {
                                                x: infoWidth + 2,
                                                fillStyle: "#999"
                                            }
                                        });
                                        infoWidth += txt.getTextWidth() + 2;
                                        infosp.addChild(txt);
                                    };

                                    var txt;
                                    if (h <= preLen - 1) {
                                        txt = infosp.getChildById("info_txt_" + i + "_" + h + "_" + ci);
                                    } else {
                                        txt = new Canvax.Display.Text( content , {
                                            id: "info_txt_" + i + "_" + h + "_" + ci,
                                            context: {
                                                x: infoWidth + 2,
                                                fillStyle: cdata.fillStyle,
                                                fontSize: me.text.fontSize,
                                                lineWidth: me.text.lineWidth,
                                                strokeStyle: me.text.strokeStyle
                                            }
                                        });
                                        infosp.addChild(txt);
                                    };
                                    txt._text = cdata.value;
                                    txt._data = cdata;
                                    infoWidth += txt.getTextWidth() + 2;
                                    infoHeight = Math.max(infoHeight, txt.getTextHeight());

                                    if( me.animation ){
                                        txt.resetText(0);
                                    };
                                });

                                infosp._finalX = rectData.x - infoWidth / 2;
                                infosp._finalY = finalPos.y - infoHeight;
                                infosp._centerX = rectData.x;
                                infosp.context.width = infoWidth;
                                infosp.context.height = infoHeight;

                                if (!me.animation) {
                                    infosp.context.y = finalPos.y - infoHeight;
                                    infosp.context.x = rectData.x - infoWidth / 2;
                                    infosp.context.visible = true;
                                };
                            }
                        };
                    }
                });

                this.sprite.addChild(this.barsSp);

                this.sprite.addChild(this.checkedSp)

                if (this.text.enabled) {
                    this.sprite.addChild(this.txtsSp);
                };

                //如果有average模块配置。
                if (this.average.enabled && this.average.data) {
                    !this.averageSp && (this.averageSp = new Canvax.Display.Sprite({
                        id: "averageSp"
                    }));
                    _.each(this.average.layoutData, function(average, i) {
                        var averageRectC = {
                            x: itemW * i,
                            y: average.y,
                            fillStyle: me.average.fillStyle,
                            width: itemW,
                            height: 2
                        };
                        var averageLine;
                        if (i <= preLen - 1) {
                            averageLine = me.averageSp.getChildById("average_" + i);
                            averageLine.context.x = averageRectC.x;
                            averageLine.context.y = averageRectC.y;
                            averageLine.context.width = averageRectC.width;
                        } else {
                            averageLine = new Rect({
                                id: "average_" + i,
                                context: averageRectC
                            });
                            me.averageSp.addChild(averageLine);
                        };

                    });
                    this.sprite.addChild(me.averageSp);
                };

                this.sprite.context.x = this.pos.x;
                this.sprite.context.y = this.pos.y;

                if (this.sort && this.sort == "desc") {
                    this.sprite.context.y -= this.h;
                };
            },
            _updateInfoTextPos: function(el) {
                if (this.root.type == "horizontal") {
                    return;
                };
                var infoWidth = 0;
                var infoHeight = 0;
                var cl = el.children.length;
                _.each(el.children, function(c, i) {
                    if (c.getTextWidth) {
                        c.context.x = infoWidth;
                        infoWidth += c.getTextWidth() + (i < cl ? 2 : 0);
                        infoHeight = Math.max(infoHeight, c.getTextHeight());
                    };
                });
                el.context.x = el._centerX - infoWidth / 2 + 1;
                el.context.width = infoWidth;
                el.context.height = infoHeight;
            },
            /**
             * 生长动画
             */
            grow: function(callback, opt) {
                var self = this;
                if (!this.animation) {
                    callback && callback(self);
                    return;
                };
                var sy = 1;
                if (this.sort && this.sort == "desc") {
                    sy = -1;
                };

                //先把已经不在当前range范围内的元素destroy掉
                if ( self.data[0] && self.barsSp.children.length > self.data[0][0].length) {
                    for (var i = self.data[0][0].length, l = self.barsSp.children.length; i < l; i++) {
                        self.barsSp.getChildAt(i).destroy();
                        self.text.enabled && self.txtsSp.getChildAt(i).destroy();
                        self.averageSp && self.averageSp.getChildAt(i).destroy();
                        i--;
                        l--;
                    };
                };

                var options = _.extend({
                    delay: Math.min(1000 / this._barsLen, 80),
                    easing: "Back.Out",
                    duration: 500
                }, opt);

                _.each(self.data, function(h_group, g) {
                    var vLen = h_group.length;
                    if (vLen == 0) return;
                    var hLen = h_group[0].length;
                    for (h = 0; h < hLen; h++) {
                        for (v = 0; v < vLen; v++) {

                            var group = self.barsSp.getChildById("barGroup_" + h);

                            var bar = group.getChildById("bar_" + g + "_" + h + "_" + v);
                            //console.log("finalPos"+bar.finalPos.y)

                            if (options.duration == 0) {
                                bar.context.scaleY = sy;
                                bar.context.y = sy * sy * bar.finalPos.y;
                                bar.context.x = bar.finalPos.x;
                                bar.context.width = bar.finalPos.width;
                                bar.context.height = bar.finalPos.height;
                            } else {
                                if (bar._tweenObj) {
                                    AnimationFrame.destroyTween(bar._tweenObj);
                                };
                                bar._tweenObj = bar.animate({
                                    scaleY: sy,
                                    y: sy * bar.finalPos.y,
                                    x: bar.finalPos.x,
                                    width: bar.finalPos.width,
                                    height: bar.finalPos.height
                                }, {
                                    duration: options.duration,
                                    easing: options.easing,
                                    delay: h * options.delay,
                                    onUpdate: function(arg) {

                                    },
                                    onComplete: function(arg) {
                                        if (arg.width < 3) {
                                            this.context.radius = 0;
                                        }
                                    },
                                    id: bar.id
                                });
                            };

                        };

                        //txt grow
                        if (self.text.enabled) {
                            var txtGroupH = self.txtsSp.getChildById("txtGroup_" + h);

                            var infosp = txtGroupH.getChildById("infosp_" + g + "_" + h);

                            if (self.root.type == "horizontal") {
                                infosp.context.x = infosp._finalX;
                            };

                            infosp.animate({
                                y: infosp._finalY,
                                x: infosp._finalX
                            }, {
                                duration: options.duration,
                                easing: options.easing,
                                delay: h * options.delay,
                                onUpdate: function() {
                                    this.context.visible = true;
                                },
                                onComplete: function() {}
                            });

                            _.each(infosp.children, function(txt) {
                                if (txt._text || txt._text===0) {
                                    if (txt._tweenObj) {
                                        AnimationFrame.destroyTween(txt._tweenObj);
                                    };
                                    txt._tweenObj = AnimationFrame.registTween({
                                        from: {
                                            v: txt.text
                                        },
                                        to: {
                                            v: txt._text
                                        },
                                        duration: options.duration + 300,
                                        delay: h * options.delay,
                                        onUpdate: function() {
                                            var content = this.v;

                                            if (_.isFunction(self.text.format)) {
                                                var _formatc = self.text.format.apply( self , [content , txt._data]);
                                                if(!!_formatc || _formatc==="" || _formatc===0){
                                                    content = _formatc
                                                }
                                            } else if (_.isNumber(content)) {
                                                content = Tools.numAddSymbol(parseInt(content));
                                            };
                                            txt.resetText(content);
                                            if (txt.parent) {
                                                self._updateInfoTextPos(txt.parent);
                                            } else {
                                                txt.destroy();
                                            }
                                        }
                                    })
                                };
                            });
                        }
                    };
                });
                callback && callback(self);
                /*
                window.setTimeout(function() {
                    callback && callback(self);
                }, 300 * (this.barsSp.children.length - 1));
                */
            },
            _getInfoHandler: function(target) {
                var node = {
                    iGroup: target.iGroup,
                    iNode: target.iNode,
                    iLay: target.iLay,
                    nodesInfoList: this._getNodeInfo(target.iGroup, target.iNode, target.iLay)
                };
                return node;
            },
            _getNodeInfo: function(iGroup, iNode, iLay) {
                var arr = [];
                var me = this;
                var groups = me.data.length;

                iGroup == undefined && (iGroup = -1);
                iNode == undefined && (iNode = 0);
                iLay == undefined && (iLay = -1);

                _.each(me.data, function(h_group, i) {
                    var node;
                    var vLen = h_group.length;
                    if (vLen == 0) return;
                    var hLen = h_group[0].length;
                    for (h = 0; h < hLen; h++) {
                        if (h == iNode) {
                            for (v = 0; v < vLen; v++) {
                                if ((iGroup == i || iGroup == -1) && (iLay == v || iLay == -1)) {
                                    node = h_group[v][h]
                                    node.fillStyle = me._getColor(me.bar.fillStyle, groups, vLen, i, h, v, node.value, node.field);
                                    arr.push(node)
                                }
                            }
                        }
                    }
                });
                return arr;
            }
        };
        return Graphs;
    }
);

define(
    "chartx/chart/bar/yaxis",
    [
        "canvax/index",
        "chartx/components/yaxis/yAxis"
    ],
    function( Canvax , yAxisBase ){
        var yAxis = function( opt , data ){
            yAxis.superclass.constructor.apply( this , [ ( opt.bar ? opt.bar : opt ) , data ] );
        };
        Chartx.extend( yAxis , yAxisBase , {
            _setDataSection : function( data ){
                var arr = [];
                _.each( data.org , function( d , i ){
                    if( !d.length ){
                        return
                    };

                    //有数据的情况下 
                    if( !_.isArray(d[0]) ){
                        arr.push( d );
                        return;
                    };
                    
                    var varr = [];
                    var len  = d[0].length;
                    var vLen = d.length;
                    var min = 0;
                    for( var i = 0 ; i<len ; i++ ){
                        var count = 0;
                        for( var ii = 0 ; ii < vLen ; ii++ ){
                            count += d[ii][i];
                            min = Math.min( d[ii][i], min );
                        }
                        varr.push( count );
                    };
                    varr.push(min);
                    arr.push( varr );
                } );
                return _.flatten(arr);
            }
        } );
    
        return yAxis;
    } 
);


define(
    "chartx/chart/bar/index", [
        'chartx/chart/index',
        'chartx/utils/tools',
        'chartx/utils/datasection',
        'chartx/components/xaxis/xAxis',
        'chartx/chart/bar/yaxis',
        'chartx/components/back/Back',
        'chartx/chart/bar/graphs',
        'chartx/components/tips/tip',
        'chartx/utils/dataformat',
        'chartx/components/datazoom/index',
        'chartx/components/legend/index',
        'chartx/components/markline/index'
    ],
    function(Chart, Tools, DataSection, xAxis, yAxis, Back, Graphs, Tip, dataFormat, DataZoom, Legend, MarkLine) {
        /*
         *@node chart在dom里的目标容器节点。
         */
        var Canvax = Chart.Canvax;
        var Bar = Chart.extend({
            init: function(node, data, opts) {

                data = Tools.parse2MatrixData(data);

                this._xAxis = null;
                this.xAxis = {
                    layoutType: "peak" //波峰波谷布局模型
                };

                this._yAxis = null;
                this._back = null;
                this._graphs = null;
                this._tip = null;
                this._checkedList = []; //所有的选择对象
                this._currCheckedList = []; //当前的选择对象(根据dataZoom.start, dataZoom.end 过滤)

                this._node = node;
                this._data = data;
                this._opts = opts;

                this.dataZoom = {
                    enabled: false,
                    range: {
                        start: 0,
                        end: data.length - 1 //因为第一行是title
                    }
                };
                if (opts.dataZoom) {
                    this.dataZoom.enabled = true;
                    this.padding.bottom += (opts.dataZoom.height || 46);
                };

                if (opts.proportion) {
                    this.proportion = opts.proportion;
                    this._initProportion(node, data, opts);
                } else {
                    _.deepExtend(this, opts);
                };

                this.dataFrame = this._initData(data);

                this._setLegend();
                
                //吧原始的field转换为对应结构的显示树
                //["uv"] --> [{field:'uv',enabled:true , fillStyle: }]
                this._fieldsDisplayMap = this.__setFieldsDisplay( this._opts.yAxis.field || this._opts.yAxis.bar.field );
                
                //一些继承自该类的constructor 会拥有_init来做一些覆盖，比如横向柱状图
                this._init && this._init(node, data, opts);
            },
            /*
             * 如果只有数据改动的情况
             */
            resetData: function(data) {
                this._data = Tools.parse2MatrixData( data );

                this.dataFrame = this._initData(data, this);
                this._xAxis.reset({
                    animation: false
                } , this.dataFrame.xAxis);

                if (this.dataZoom.enabled) {
                    this.__cloneBar = this._getCloneBar();
                    this._yAxis.reset({
                        animation: false
                    } , this.__cloneBar.thumbBar.dataFrame.yAxis );
                    this._dataZoom.sprite.destroy();
                    this._initDataZoom();
                } else {
                    this._yAxis.reset( {
                        animation: false
                    } , this.dataFrame.yAxis);
                };
                this._graphs.resetData(this._trimGraphs());
                this._graphs.grow(function() {
                    //callback
                }, {
                    delay: 0
                });
                this.fire("_resetData");
            },
            getCheckedCurrList: function() {
                var me = this
                return _.filter(me._getCurrCheckedList(), function(o) {
                    return o
                })
            },
            getCheckedList: function() { //获取选择之后的对象列表 列表中不含空对象 [eventInfo,evnetInfo,....]
                var me = this
                return _.filter(me._checkedList, function(o) {
                    return o
                })
            },
            //和原始field结构保持一致，但是对应的field换成 {field: , enabled:}结构
            __setFieldsDisplay : function( fields ){
                if( _.isString(fields) ){
                    fields = [fields];
                };
                var clone_fields = _.clone( fields );
                for(var i = 0 , l=fields.length ; i<l ; i++) {
                    if( _.isString( fields[i] ) ){
                        clone_fields[i] = {
                            field : fields[i],
                            enabled : true
                        }
                    }
                    if( _.isArray( fields[i] ) ){
                        clone_fields[i] = this.__setFieldsDisplay( fields[i] );
                    }
                };
                return clone_fields;
            },
            _getFieldsOfDisplay: function( maps ){
                var fields = [];
                !maps && ( maps = this._fieldsDisplayMap );
                for( var i=0,l=maps.length ; i<l ; i++ ){
                    if( _.isArray(maps[i]) ){
                        var _fs = this._getFieldsOfDisplay( maps[i] );
                        _fs.length>0 && (fields[i] = _fs);
                    } else if( maps[i].field && maps[i].enabled ) {
                        fields[i] = maps[i].field;
                    };
                };
                return fields;
            },
            //设置_fieldsDisplayMap中对应field 的 enabled状态
            _setFieldDisplay: function( field ){
                var me = this;
                function set( maps ){
                    _.each( maps , function( map , i ){
                        if( _.isArray( map ) ){
                            set( map )
                        } else if( map.field && map.field == field ) {
                            map.enabled = !map.enabled;
                        }
                    } );
                }
                set( me._fieldsDisplayMap );
            },
            //TODO：bar中用来改变yAxis.field的临时 方案
            _resetOfLengend : function( field ){
                var me = this;
                
                me._setFieldDisplay( field );

                _.deepExtend(this, {
                    yAxis : {
                        field : me._getFieldsOfDisplay()
                    }
                });

                if( this.graphs && this.graphs.bar && _.isFunction( this.graphs.bar.fillStyle )){
                    var _fillStyle = this.graphs.bar.fillStyle;
                    this.graphs.bar.fillStyle = function( f ){
                        var res = _fillStyle( f );
                        if( !res ){
                            if( me._legend ){
                                res = me._legend.getStyle(f.field).fillStyle;
                            }
                        }
                        return res;
                    }
                } else {
                    _.deepExtend(this, {
                        graphs : {
                            bar : {
                                fillStyle : function( f ){
                
                                    if( me._legend ){
                                        return me._legend.getStyle(f.field).fillStyle;
                                    }
                                }
                            }
                        }
                    });
                }



                for (var i=0,l=this.canvax.children.length;i<l;i++){
                    var stage = this.canvax.getChildAt(i);
                    for( var s = 0 , sl=stage.children.length ; s<sl ; s++){
                        var sp = stage.getChildAt(s);
                        if(sp.id == "LegendSprite" || sp.id == "legend_tip"){
                            continue
                        }
                        stage.getChildAt(s).destroy();
                        s--;
                        sl--;
                    }
                };
                
                this.dataFrame = this._initData( this._data );
                this.draw();
            },
            _setLegend: function(){

                var me = this;
                if( !this.legend || (this.legend && "enabled" in this.legend && !this.legend.enabled) ) return;
                //设置legendOpt
                var legendOpt = _.deepExtend({
                    enabled:true,
                    label  : function( info ){
                       return info.field
                    },
                    onChecked : function( field ){
                       me._resetOfLengend( field );
                    },
                    onUnChecked : function( field ){
                       me._resetOfLengend( field );
                    }
                } , this._opts.legend);
                
                this._legend = new Legend( this._getLegendData() , legendOpt );
                this.stage.addChild( this._legend.sprite );
                this._legend.pos( {
                    x : 0,
                    y : this.padding.top
                } );

                this.padding.top += this._legend.height;
            },
            //只有field为多组数据的时候才需要legend
            _getLegendData : function(){
                var me   = this;
                var data = [];
                _.each( _.flatten(me.dataFrame.yAxis.field) , function( f , i ){
                    data.push({
                        field : f,
                        value : null,
                        fillStyle : null
                    });
                });
                return data;
            },
            checkAt: function(index) {
                var me = this
                var i = index - me.dataZoom.range.start
                var o = me._graphs.getInfo(i)

                me._checkedList[index] = o

                me._checkedBar({
                    iNode: i,
                    checked: true
                });
                me._checkedMiniBar({
                    iNode: index,
                    checked: true
                });

                o.iNode = index
            },
            uncheckAt: function(index) { //取消选择某个对象 index是全局index
                var me = this
                var i = index - me.dataZoom.range.start
                if (me._checkedList[index]) {
                    me._checked(me._graphs.getInfo(i))
                };
            },
            uncheckAll: function() {
                for (var i = 0, l = this._checkedList.length; i < l; i++) {
                    var obj = this._checkedList[i];
                    if (obj) {
                        this.uncheckAt(i);
                    }
                };
                this._checkedList = [];
                this._currCheckedList = [];
            },
            checkOf: function(xvalue) {
                this.checkAt(this._xAxis.getIndexOfVal(xvalue) + this.dataZoom.range.start);
            },
            uncheckOf: function(xvalue) {
                this.uncheckAt(this._xAxis.getIndexOfVal(xvalue) + this.dataZoom.range.start);
            },
            getGroupChecked: function(e) {
                var checked = false;
                _.each(this.getCheckedList(), function(obj) {
                    if (obj && obj.iNode == e.eventInfo.iNode) {
                        checked = true;
                    }
                });
                return checked
            },
            //如果为比例柱状图的话
            _initProportion: function(node, data, opts) {
                !opts.tips && (opts.tips = {});

                opts.tips = _.deepExtend({
                    content: function(info) {
                        var str = "<table style='border:none'>";
                        var self = this;
                        _.each(info.nodesInfoList, function(node, i) {
                            str += "<tr style='color:" + (node.color || node.fillStyle) + "'>";
                            var prefixName = self.prefix[i];
                            var tsStyle="style='border:none;white-space:nowrap;word-wrap:normal;'";
                            if (prefixName) {
                                str += "<td "+tsStyle+">" + prefixName + "：</td>";
                            } else {
                                if (node.field) {
                                    str += "<td "+tsStyle+">" + node.field + "：</td>";
                                }
                            };
                            str += "<td "+tsStyle+">" + Tools.numAddSymbol(node.value);
                            if( node.vCount ){
                                str += "（" + Math.round(node.value / node.vCount * 100) + "%）";
                            };
                            str +="</td></tr>";
                        });
                        str += "</table>";
                        return str;
                    }
                } , opts.tips );

                _.deepExtend(this, opts);
                _.deepExtend(this.yAxis, {
                    dataSection: [0, 20, 40, 60, 80, 100],
                    text: {
                        format: function(n) {
                            return n + "%"
                        }
                    }
                });

                !this.graphs && (this.graphs = {});
                _.deepExtend(this.graphs, {
                    bar: {
                        radius: 0
                    }
                });
            },
            _setStages: function() {
                this.core = new Canvax.Display.Sprite({
                    id: 'core'
                });
                this.stageBg = new Canvax.Display.Sprite({
                    id: 'bg'
                });
                this.stageTip = new Canvax.Display.Sprite({
                    id: 'tip'
                });

                this.stage.addChild(this.stageBg);
                this.stage.addChild(this.core);
                this.stage.addChild(this.stageTip);

                if (this.rotate) {
                    this._rotate(this.rotate);
                }
            },
            draw: function() {

                this._setStages();

                this._initModule(); //初始化模块  

                this._startDraw(); //开始绘图

                this._drawEnd(); //绘制结束，添加到舞台

                this.inited = true;

            },
            _initData: function(data, opt) {

                var d;
                if (this.dataZoom.enabled) {
                    var datas = [data[0]];
                    datas = datas.concat(data.slice(this.dataZoom.range.start + 1, this.dataZoom.range.end + 1 + 1));
                    d = dataFormat.apply(this, [datas, opt]);
                } else {
                    d = dataFormat.apply(this, arguments);
                };

                //var d = dataFormat.apply(this, arguments);

                _.each(d.yAxis.field, function(field, i) {
                    if (!_.isArray(field)) {
                        field = [field];
                        d.yAxis.org[i] = [d.yAxis.org[i]];
                    }
                });
                return d;
            },
            _getaverageData: function() {
                var averageData = [];
                var me = this;
                if (this._graphs && this._graphs.average && this._graphs.average.data) {
                    return this._graphs.average.data
                };
                if (this._graphs.average.enabled) {
                    _.each(this.dataFrame.data, function(fd, i) {
                        if (fd.field == me._graphs.average.field) {
                            averageData = fd.data;
                        }
                    });
                };
                this._graphs.average.data = averageData;
                return averageData;
            },
            _setaverageLayoutData: function() {
                var layoutData = [];
                var me = this;
                if (this._graphs.average.enabled) {
                    var maxYAxis = this._yAxis.dataSection[this._yAxis.dataSection.length - 1];
                    _.each(this._graphs.average.data, function(fd, i) {
                        layoutData.push({
                            value: fd,
                            y: -(fd - me._yAxis._bottomNumber) / Math.abs(maxYAxis - me._yAxis._bottomNumber) * me._yAxis.yGraphsHeight
                        });
                    });
                    this._graphs.average.layoutData = layoutData;
                };
            },
            _initModule: function() {
                //因为tips放在graphs中，so 要吧tips的conf传到graphs中
                this._graphs = new Graphs(
                    this.graphs,
                    this
                );

                this._xAxis = new xAxis(this.xAxis, this.dataFrame.xAxis);

                if( this._graphs.average.enabled ){
                    this.dataFrame.yAxis.org.push( [ this._getaverageData() ] );
                };
                if( this.markLine && this.markLine.y ){
                    this.dataFrame.yAxis.org.push( [ this.markLine.y ] );
                };

                this._yAxis = new yAxis(this.yAxis, this.dataFrame.yAxis);

                this._back = new Back(this.back);
                this._tip = new Tip(this.tips, this.canvax.getDomContainer());
            },
            _startDraw: function(opt) {
                var w = (opt && opt.w) || this.width;
                var h = (opt && opt.h) || this.height;
                var y = parseInt(h - this._xAxis.height);
                var graphsH = y - this.padding.top - this.padding.bottom;

                //绘制yAxis
                this._yAxis.draw({
                    pos: {
                        x: this.padding.left,
                        y: y - this.padding.bottom
                    },
                    yMaxHeight: graphsH
                });

                if (this.dataZoom.enabled) {
                    this.__cloneBar = this._getCloneBar();
                    this._yAxis.reset( {
                        animation: false
                    } , this.__cloneBar.thumbBar.dataFrame.yAxis );
                    this._yAxis.setX(this._yAxis.pos.x);
                };

                var _yAxisW = this._yAxis.width;

                //绘制x轴
                this._xAxis.draw({
                    graphh: h - this.padding.bottom,
                    graphw: w - this.padding.right,
                    yAxisW: _yAxisW
                });
                if (this._xAxis.yAxisW != _yAxisW) {
                    //说明在xaxis里面的时候被修改过了。那么要同步到yaxis
                    this._yAxis.resetWidth(this._xAxis.yAxisW);
                    _yAxisW = this._xAxis.yAxisW;
                };

                var _graphsH = this._yAxis.yGraphsHeight;
                //绘制背景网格
                this._back.draw({
                    w: this._xAxis.xGraphsWidth,
                    h: _graphsH,
                    xAxis: {
                        data: this._yAxis.layoutData
                    },
                    yAxis: {
                        data: this._xAxis.layoutData,
                        xDis: this._xAxis.xDis
                    },
                    pos: {
                        x: _yAxisW,
                        y: y - this.padding.bottom
                    }
                } , this);

                this._setaverageLayoutData();

                var o = this._trimGraphs();
                //绘制主图形区域
                this._graphs.draw(o.data, {
                    w: this._xAxis.xGraphsWidth,
                    h: this._yAxis.yGraphsHeight,
                    pos: {
                        x: _yAxisW,
                        y: y - this.padding.bottom
                    },
                    yDataSectionLen: this._yAxis.dataSection.length,
                    sort: this._yAxis.sort
                });


                if (this.dataZoom.enabled) {
                    this._initDataZoom();
                };

                //如果有legend，调整下位置,和设置下颜色
                if(this._legend && !this._legend.inited){
                    this._legend.pos( { x : _yAxisW } );

                    for( var f in this._graphs._yAxisFieldsMap ){
                        var ffill = this._graphs._yAxisFieldsMap[f].fillStyle;
                        this._legend.setStyle( f , {fillStyle : ffill} );
                    };
                    this._legend.inited = true;
                };
            },

            //把这个点位置对应的x轴数据和y轴数据存到tips的info里面
            //方便外部自定义 tip 是的content
            _setXaxisYaxisToTipsInfo: function(e) {
                if (!e.eventInfo) {
                    return;
                };

                e.eventInfo.xAxis = {
                    field: this.dataFrame.xAxis.field,
                    value: this.dataFrame.xAxis.org[0][e.eventInfo.iNode]
                };
                var me = this;

                _.each(e.eventInfo.nodesInfoList, function(node, i) {
                    //把这个group当前是否选中状态记录
                    if (me._checkedList[node.iNode + me.dataZoom.range.start]) {
                        node.checked = true;
                    } else {
                        node.checked = false;
                    };
                });

                e.eventInfo.dataZoom = me.dataZoom;

                e.eventInfo.rowData = this.dataFrame.getRowData(e.eventInfo.iNode);

                e.eventInfo.iNode += this.dataZoom.range.start;
            },
            _trimGraphs: function(_xAxis, _yAxis) {

                _xAxis || (_xAxis = this._xAxis);
                _yAxis || (_yAxis = this._yAxis);
                var xArr = _xAxis.data;
                var yArr = _yAxis.dataOrg;
                var hLen = _yAxis.field.length; //bar的横向分组length

                var xDis1 = _xAxis.xDis;
                //x方向的二维长度，就是一个bar分组里面可能有n个子bar柱子，那么要二次均分
                var xDis2 = xDis1 / (hLen + 1);

                //知道了xDis2 后 检测下 barW是否需要调整
                this._graphs.checkBarW && this._graphs.checkBarW(xDis1, xDis2);

                var maxYAxis = _yAxis.dataSection[_yAxis.dataSection.length - 1];
                var tmpData = [];
                var center = [],
                    yValueMaxs = [],
                    yLen = [];

                var me = this;
                
                for (var b = 0; b < hLen; b++) {
                    !tmpData[b] && (tmpData[b] = []);
                    yValueMaxs[b] = 0;
                    center[b] = {};
                    var yArrList = yArr[b];

                    _.each(yArrList, function(subv, v) {
                        !tmpData[b][v] && (tmpData[b][v] = []);

                        if (me.dataZoom.enabled) {
                            subv = subv.slice(me.dataZoom.range.start, me.dataZoom.range.end + 1);
                        };

                        _.each(subv, function(val, i) {

                            if (!xArr[i]) {
                                return;
                            };

                            var vCount = 0;
                            if (me.proportion) {
                                //先计算总量
                                _.each(yArrList, function(team, ti) {
                                    vCount += team[i]
                                });
                            };

                            //TODO：这里也是bar有自己计算x的公式， 要和line一样改造成调用xAxis的接口来计算
                            var x = xArr[i].x - xDis1 / 2 + xDis2 * (b + 1);

                            var y = 0;
                            if (me.proportion) {
                                y = -val / vCount * _yAxis.yGraphsHeight;
                            } else {
                                y = _yAxis.getYposFromVal( val );
                                //y = -(val - _yAxis._bottomNumber) / Math.abs(maxYAxis - _yAxis._bottomNumber) * _yAxis.yGraphsHeight;
                            };
                            if (v > 0) {
                                y += tmpData[b][v - 1][i].y;
                            };

                            //如果有排序的话
                            if (me._yAxis.sort && me._yAxis.sort == "desc") {
                                y = -(_yAxis.yGraphsHeight - Math.abs(y));
                            };

                            var node = {
                                value: val,
                                field: me._getTargetField(b, v, i, _yAxis.field),
                                x: x,
                                y: y,
                                xAxis: {
                                    field: me._xAxis.field,
                                    value: xArr[i].content,
                                    layoutText: xArr[i].layoutText
                                }
                            };

                            if (me.proportion) {
                                node.vCount = vCount;
                            };

                            tmpData[b][v].push(node);

                            yValueMaxs[b] += Number(val)
                            yLen = subv.length
                        });
                    });
                };

                for (var a = 0, al = yValueMaxs.length; a < al; a++) {
                    center[a].agValue = yValueMaxs[a] / yLen
                    center[a].agPosition = -(yValueMaxs[a] / yLen - _yAxis._bottomNumber) / (maxYAxis - _yAxis._bottomNumber) * _yAxis.yGraphsHeight
                };
                //均值
                this.dataFrame.yAxis.center = center;

                return {
                    data: tmpData
                };
            },
            _getTargetField: function(b, v, i, field) {
                if (!field) {
                    field = this._yAxis.field;
                };
                if (_.isString(field)) {
                    return field;
                } else if (_.isArray(field)) {
                    var res = field[b];
                    if (_.isString(res)) {
                        return res;
                    } else if (_.isArray(res)) {
                        return res[v];
                    };
                }
            },
            _drawEnd: function() {
                var me = this
                this.stageBg.addChild(this._back.sprite);

                this.core.addChild(this._xAxis.sprite);
                this.core.addChild(this._graphs.sprite);
                this.core.addChild(this._yAxis.sprite);

                this.stageTip.addChild(this._tip.sprite);

                //执行生长动画
                this._graphs.grow(function(g) {
                    if (me._opts.markLine) {
                        me._initMarkLine(g);
                    };
                    if (me._opts.markPoint) {
                        me._initMarkPoint(g);
                    };
                });

                this.bindEvent();
            },
            _initDataZoom: function() {
                var me = this;

                //require(["chartx/components/datazoom/index"], function(DataZoom) {
                //初始化 datazoom 模块

                var dataZoomOpt = _.deepExtend({
                    w: me._xAxis.xGraphsWidth,
                    count: me._data.length - 1,
                    //h : me._xAxis.height,
                    pos: {
                        x: me._xAxis.pos.x,
                        y: me._xAxis.pos.y + me._xAxis.height
                    },
                    dragIng: function(range) {
                        //if (me.dataZoom.range.end <= me.dataZoom.range.start) {
                        //    me.dataZoom.range.end = me.dataZoom.range.start + 1;
                        //};
                        if(
                         parseInt(me.dataZoom.range.start) == parseInt(range.start) 
                         && parseInt(me.dataZoom.range.end) == parseInt(range.end)
                        ) {
                            return;
                        };
                        
                        //console.log("start:"+me.dataZoom.range.start+"___end:"+me.dataZoom.range.end)
                        me.dataZoom.range.start = parseInt(range.start);
                        me.dataZoom.range.end = parseInt(range.end);
                        me.dataFrame = me._initData(me._data, me._opts);
                        me._xAxis.reset({
                            animation: false
                        } , me.dataFrame.xAxis );

                        me._graphs.average.data = null;
                        me._graphs.w = me._xAxis.xGraphsWidth;
                        me._getaverageData();
                        me._setaverageLayoutData();

                        me._graphs.resetData(me._trimGraphs());
                        me._graphs.grow(function() {
                            //callback
                        }, {
                            delay: 0,
                            easing: "Quadratic.Out",
                            duration: 300
                        });

                        me._removeChecked();

                        me.fire("_dataZoomDragIng");
                    },
                    dragEnd: function(range) {
                        me._updateChecked()
                    }
                }, me.dataZoom);

                //me._getCloneBar();

                me._dataZoom = new DataZoom(dataZoomOpt);

                var graphssp = this.__cloneBar.thumbBar._graphs.sprite;
                graphssp.id = graphssp.id + "_datazoomthumbbarbg"
                graphssp.context.x = 0;
                graphssp.context.y = me._dataZoom.barH + me._dataZoom.barY;

                graphssp.context.scaleY = me._dataZoom.barH / this.__cloneBar.thumbBar._graphs.h;

                me._dataZoom.dataZoomBg.addChild(graphssp);
                me.core.addChild(me._dataZoom.sprite);

                this.__cloneBar.thumbBar.destroy();
                this.__cloneBar.cloneEl.parentNode.removeChild(this.__cloneBar.cloneEl);
                //});
            },
            _getCloneBar: function() {
                var me = this;
                barConstructor = this.constructor;//(barConstructor || Bar);
                var cloneEl = me.el.cloneNode();
                cloneEl.innerHTML = "";
                cloneEl.id = me.el.id + "_currclone";
                cloneEl.style.position = "absolute";
                cloneEl.style.width = me.el.offsetWidth + "px";
                cloneEl.style.height = me.el.offsetHeight + "px";
                cloneEl.style.top = "10000px";
                document.body.appendChild(cloneEl);

                var opts = _.deepExtend({}, me._opts);
                _.deepExtend(opts, {
                    graphs: {
                        bar: {
                            fillStyle: me.dataZoom.normalColor || "#ececec"
                        },
                        animation: false,
                        eventEnabled: false,
                        text: {
                            enabled: false
                        },
                        average: {
                            enabled: false
                        }
                    },
                    dataZoom: {
                        enabled: false
                    },
                    xAxis: {
                        //enabled: false
                    },
                    yAxis: {
                        //enabled: false
                    }
                });

                var thumbBar = new barConstructor(cloneEl, me._data, opts);
                thumbBar.draw();
                return {
                    thumbBar: thumbBar,
                    cloneEl: cloneEl
                }
            },
            _initMarkLine: function(g) {
                var me = this;

                var _field = me.markLine.field || me.markLine.target;
            
                var yfieldFlat = _.flatten(me._yAxis.field);
                if( me.markLine.y === undefined ){
                    for (var a = 0, al = yfieldFlat.length; a < al; a++) {
                        var center = null;
                        //如果markline有 target 配置，那么只现在 target 配置里的字段的markline
                        var _yField = yfieldFlat[a];
                        
                        if( _field && !( ( _.isArray(_field) && _.indexOf( _field , _yField )>=0 ) || (_field === _yField) ) ){
                            continue;
                        };

                        if(!me.dataFrame.yAxis.center[a]){
                            continue
                        } else {
                            center = me.dataFrame.yAxis.center[a].agPosition
                        };

                        var strokeStyle = g._yAxisFieldsMap[ yfieldFlat[a] ].fillStyle; //g.sprite.children[0] ? g.sprite.children[0].children[a + 1].context.fillStyle : '#000000'

                        var content = me.dataFrame.yAxis.field[a] + '均值：'+me.dataFrame.yAxis.center[a].agValue
                        if (me.markLine.text && me.markLine.text.enabled) {
                            if (_.isFunction(me.markLine.text.format)) {
                                var o = {
                                    iGroup: a,
                                    value : me.dataFrame.yAxis.center[a].agValue
                                }
                                content = me.markLine.text.format(o)
                            }
                        };

                        var _y = center;
                    
                        //如果 markline 有自己预设的y值
                        if( me.markLine.y != undefined ){
                            var _y = me.markLine.y;
                            if(_.isFunction(_y)){
                                _y = _y( yfieldFlat[a] );
                            };

                            if(_.isArray( _y )){
                                _y = _y[ a ];
                            };

                            if( _y != undefined ){
                                _y = me._yAxis.getYposFromVal(_y);
                            };
                        };

                        var o = {
                            w: me._xAxis.xGraphsWidth,
                            h: me._yAxis.yGraphsHeight,
                            origin: {
                                x: me._back.pos.x,
                                y: me._back.pos.y
                            },
                            field: _.isArray(me._yAxis.field[a]) ? me._yAxis.field[a][0] : me._yAxis.field[a],
                            line: {
                                y: _y,
                                list: [
                                    [0, 0],
                                    [me._xAxis.xGraphsWidth, 0]
                                ],
                                strokeStyle: strokeStyle
                            },
                            text: {
                                content: content,
                                fillStyle: strokeStyle
                            }
                        };

                        new MarkLine(_.deepExtend(o, me._opts.markLine)).done(function() {
                            me.core.addChild(this.sprite)
                        });
                    }
                } else {
                    //如果没有配置field的话，就根据me.markLine.y来生成对应的markline实例
                    var _mly = me.markLine.y;
                    if( !_.isArray(_mly) ){
                        _mly = [ _mly ];
                    };
                    function getProp( obj , p , i , def){
                        if( obj == undefined ) return def;
                        if( obj[p] == undefined ) return def;
                        if( !_.isArray(obj[p]) ) return obj[p];
                        return obj[p][i] == undefined ? def : obj[p][i] 
                    };
                    _.each( _mly , function( y , i ){
                        var o = {
                            w: me._xAxis.xGraphsWidth,
                            h: me._yAxis.yGraphsHeight,
                            origin: {
                                x: me._back.pos.x,
                                y: me._back.pos.y
                            },
                            line: {
                                y: me._yAxis.getYposFromVal(y),
                                list: [
                                    [0, 0],
                                    [me._xAxis.xGraphsWidth, 0]
                                ],
                                strokeStyle: getProp( me.markLine.line, "strokeStyle" , i , "#999" )
                            },
                            text: {
                                content: "markLine：" + y,
                                fillStyle: getProp( me.markLine.text, "fillStyle" , i , "#999" )
                            }
                        };
                        new MarkLine(_.deepExtend( me._opts.markLine , o )).done(function() {
                            me.core.addChild(this.sprite)
                        });
                    } );
                }
            },
            _initMarkPoint: function(g) {
                var me = this;
                var gOrigin = {
                    x: g.sprite.context.x,
                    y: g.sprite.context.y
                };

                require(["chartx/components/markpoint/index"], function(MarkPoint) {
                    _.each(g.data, function(group, i) {
                        var vLen = group.length;

                        _.each(group, function(hgroup) {
                            _.each(hgroup, function(bar) {
                                var barObj = _.clone(bar);
                                barObj.x += gOrigin.x;
                                barObj.y += gOrigin.y;
                                var mpCtx = {
                                    value: barObj.value,
                                    shapeType: "droplet",
                                    markTarget: barObj.field,
                                    //注意，这里视觉上面的分组和数据上面的分组不一样，所以inode 和 iNode 给出去的时候要反过来
                                    iGroup: barObj.iGroup,
                                    iNode: barObj.iNode,
                                    iLay: barObj.iLay,
                                    point: {
                                        x: barObj.x,
                                        y: barObj.y
                                    }
                                };
                                new MarkPoint(me._opts, mpCtx).done(function() {
                                    me.core.addChild(this.sprite);
                                    var mp = this;
                                    this.shape.hover(function(e) {
                                        this.context.hr++;
                                        this.context.cursor = "pointer";
                                        e.stopPropagation();
                                    }, function(e) {
                                        this.context.hr--;
                                        e.stopPropagation();
                                    });
                                    this.shape.on("mousemove", function(e) {
                                        e.stopPropagation();
                                    });
                                    this.shape.on("tap click", function(e) {
                                        e.stopPropagation();
                                        e.eventInfo = mp;
                                        me.fire("markpointclick", e);
                                    });
                                });
                            });
                        });
                    });
                });
            },

            _removeChecked: function() {
                this._graphs.removeAllChecked()
            },
            _updateChecked: function() {
                var me = this
                me._currCheckedList = me._getCurrCheckedList()
                for (var a = 0, al = me._currCheckedList.length; a < al; a++) {
                    var o = me._currCheckedList[a]
                    me._checkedBar({
                        iNode: o.iNode - me.dataZoom.range.start,
                        checked: true,
                    })
                }
            },

            _getCurrCheckedList: function() {
                var me = this
                return _.filter(me._checkedList, function(o) {
                    if (o) {
                        if (o.iNode >= me.dataZoom.range.start && o.iNode <= me.dataZoom.range.end) {
                            return o
                        }
                    }
                })
            },
            _checked: function(eventInfo) { //当点击graphs时 触发选中状态
                var me = this
                if (!me._graphs.checked.enabled) {
                    return
                }
                var i = eventInfo.iNode + me.dataZoom.range.start

                var checked = true
                if (me._checkedList[i]) { //如果已经选中
                    me._checkedList[i] = null
                    checked = false
                } else { //如果没选中                           
                    me._checkedList[i] = eventInfo
                }
                me._checkedBar({
                    iNode: eventInfo.iNode,
                    checked: checked
                })
                me._checkedMiniBar({
                    iNode: i,
                    checked: checked
                })

                eventInfo.iNode = i
            },
            _checkedBar: function($o) { //选择bar
                var me = this
                var graphs = me._graphs
                graphs._checked($o)
            },
            _checkedMiniBar: function($o) { //选择缩略的bar
                if (this.dataZoom.enabled) {
                    var me = this
                    var graphs = me.__cloneBar.thumbBar._graphs
                    var fillStyle = ''
                    if ($o.checked) {
                        fillStyle = (me._opts.dataZoom.checked && me._opts.dataZoom.checked.fillStyle) || fillStyle
                    }
                    graphs.setBarStyle({
                        iNode: $o.iNode,
                        fillStyle: fillStyle
                    })
                }
            },

            bindEvent: function() {
                var me = this;
                this._graphs.sprite.on("panstart mouseover", function(e) {
                    me._setXaxisYaxisToTipsInfo(e);
                    me._tip.show(e);
                    me.fire(e.type, e);
                });
                this._graphs.sprite.on("panmove mousemove", function(e) {
                    me._setXaxisYaxisToTipsInfo(e);
                    me._tip.move(e);
                    me.fire(e.type, e);
                });
                this._graphs.sprite.on("panend mouseout", function(e) {
                    me._tip.hide(e);
                    me.fire(e.type, e);
                });
                this._graphs.sprite.on("tap click dblclick mousedown mouseup", function(e) {
                    if (e.type == 'click') {
                        me.fire('checkedBefor');
                        me._checked(_.clone(e.eventInfo));
                    };
                    me._setXaxisYaxisToTipsInfo(e);
                    me.fire(e.type, e);
                });
            }
        });
        return Bar;
    }
);