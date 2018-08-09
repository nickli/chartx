define('chartx/chart/bar/3d/yaxis',
    [
        "canvax/index",
        "canvax/core/Base",
        "canvax/shape/Line",
        "chartx/utils/tools",
        "chartx/utils/datasection"
    ],
    function (Canvax, CanvaxBase, Line, Tools, DataSection) {
        var yAxis = function (root) {

            var opt = root.yAxis,
                data = root.dataFrame.yAxis,
                data1 = root._getaverageData();

            this.root = root;

            this.w = 0;
            this.enabled = 1; //true false 1,0都可以
            this.dis = 6; //线到文本的距离
            this.maxW = 0; //最大文本的width
            this.field = null; //这个 轴 上面的 field

            this.label = "";
            this._label = null; //label的text对象

            this.line = {
                enabled: 1, //是否有line
                width: 4,
                lineWidth: 1,
                strokeStyle: '#cccccc'
            };

            this.text = {
                fillStyle: '#999',
                fontSize: 12,
                format: null,
                rotation: 0
            };
            this.pos = {
                x: 0,
                y: 0
            };
            this.place = "left"; //yAxis轴默认是再左边，但是再双轴的情况下，可能会right
            this.biaxial = false; //是否是双轴中的一份
            this.layoutData = []; //dataSection 对应的layout数据{y:-100, content:'1000'}
            this.dataSection = []; //从原数据 dataOrg 中 结果 datasection 重新计算后的数据

            //默认的 dataSectionGroup = [ dataSection ], dataSection 其实就是 dataSectionGroup 去重后的一维版本
            this.dataSectionGroup = []; 

            //如果middleweight有设置的话 dataSectionGroup 为被middleweight分割出来的n个数组>..[ [0,50 , 100],[100,500,1000] ]
            this.middleweight = null; 

            this.dataOrg = []; //源数据

            this.sprite = null;
            //this.x           = 0;
            //this.y           = 0;
            this.disYAxisTopLine = 6; //y轴顶端预留的最小值
            this.yMaxHeight = 0; //y轴最大高
            this.yGraphsHeight = 0; //y轴第一条线到原点的高

            this.baseNumber = null;
            this.basePoint = null; //value为baseNumber的point {x,y}

            //过滤器，可以用来过滤哪些yaxis 的 节点是否显示已经颜色之类的
            //@params params包括 dataSection , 索引index，txt(canvax element) ，line(canvax element) 等属性
            this.filter = null; //function(params){};

            this.isH = false; //是否横向

            this.animation = true;
            this.resize = false;

            this.sort = null; //"asc" //排序，默认从小到大, desc为从大到小，之所以不设置默认值为asc，是要用null来判断用户是否进行了配置

            this.init(opt, data , data1);
        };

        yAxis.prototype = {
            init: function (opt, data, data1) {
                _.deepExtend(this, opt);

                if (this.text.rotation != 0 && this.text.rotation % 90 == 0) {
                    this.isH = true;
                }
                ;

                this._initData(data , data1);
                this.sprite = new Canvax.Display.Sprite();
            },
            setX: function($n) {
                this.sprite.context.x = $n + (this.place == "left" ? this.maxW : 0);
                this.pos.x = $n;
            },
            setY: function($n) {
                this.sprite.context.y = $n;
                this.pos.y = $n;
            },
            setAllStyle: function (sty) {
                _.each(this.sprite.children, function (s) {
                    _.each(s.children, function (cel) {
                        if (cel.type == "text") {
                            cel.context.fillStyle = sty;
                        } else if (cel.type == "line") {
                            cel.context.strokeStyle = sty;
                        }
                    });
                });
            },
            //数据变化，配置没变的情况
            resetData: function (data, opt) {
                //先在field里面删除一个字段，然后重新计算
                if (opt) {
                    _.deepExtend(this, opt);
                }
                ;
                this.sprite.removeAllChildren();
                this.dataSection = [];
                this.dataSectionGroup = [];
                //_.deepExtend( this , opt );
                this._initData(data);
                this._trimYAxis();
                this._widget();
                //this.draw();
            },
            //配置和数据变化
            update: function (opt, data) {
                //先在field里面删除一个字段，然后重新计算
                this.sprite.removeAllChildren();
                this.dataSection = [];
                this.dataSectionGroup = [];
                _.deepExtend(this, opt);
                this._initData(data);
                this._trimYAxis();
                this._widget();
                //this.draw();
            },
            _getLabel: function () {
                if (this.label && this.label != "") {
                    this._label =this.sprite.getChildById('yAxis_label_'+this.label)||
                    new Canvax.Display.Text(this.label, {
                        id:'yAxis_label_'+this.label,
                        context: {

                            fontSize: this.text.fontSize,
                            textAlign: "left",
                            textBaseline: this.isH ? "top" : "bottom",
                            fillStyle: this.text.fillStyle,
                            rotation: this.isH ? -90 : 0
                        }
                    });
                }
            },
            draw: function (opt) {
                this.sprite.removeAllChildren();
                opt && _.deepExtend(this, opt);
                this._getLabel();
                this.yGraphsHeight = this.yMaxHeight - this._getYAxisDisLine();

                if (this._label) {
                    if (this.isH) {
                        this.yGraphsHeight -= this._label.getTextWidth();
                    } else {
                        this.yGraphsHeight -= this._label.getTextHeight();
                    }
                    this._label.context.y = -this.yGraphsHeight - 5;
                };

                this._trimYAxis();
                this._widget();

                this.setX(this.pos.x);
                this.setY(this.pos.y);


                this.resize = false;
            },
            //更具y轴的值来输出对应的在y轴上面的位置
            getYposFromVal : function( val ){
                var y = 0;
                var dsgLen = this.dataSectionGroup.length;
                var yGroupHeight = this.yGraphsHeight / dsgLen ;

                for( var i=0,l=dsgLen ; i<l ; i++ ){
                    var ds = this.dataSectionGroup[i];
                    var min = _.min(ds);
                    var max = _.max(ds);
                    var bottom = ds[0];
                    var top = ds.slice(-1)[0];
                    if( 
                        (val > min && val <= max) || 
                        ( this.sort == "desc" && val >= min && val < max )
                    ){
                        var y = -((val - bottom) / (top - bottom) * yGroupHeight + i*yGroupHeight) ;
                        break;
                    }
                };
                y = isNaN(y) ? 0 : parseInt(y);
                return y;
                
                /*
                var max = this.dataSection[this.dataSection.length - 1];
                var y = -(val - this._bottomNumber) / (max - this._bottomNumber) * this.yGraphsHeight;
                y = isNaN(y) ? 0 : parseInt(y);
                return y;
                */
            },
            _trimYAxis: function() {
                var max = this.dataSection[this.dataSection.length - 1];
                var tmpData = [];
                for (var a = 0, al = this.dataSection.length; a < al; a++) {

                    tmpData[a] = {
                        content: this.dataSection[a],
                        y: this.getYposFromVal( this.dataSection[a] )
                    };
                }

                this.layoutData = tmpData;

                //设置basePoint
                var basePy = -(this.baseNumber - this._bottomNumber) / (max - this._bottomNumber) * this.yGraphsHeight;
                basePy = isNaN(basePy) ? 0 : parseInt(basePy);
                this.basePoint = {
                    content: this.baseNumber,
                    y: basePy
                }
            },
            _getYAxisDisLine: function() { //获取y轴顶高到第一条线之间的距离
                var disMin = this.disYAxisTopLine
                var disMax = 2 * disMin
                var dis = disMin
                dis = disMin + this.yMaxHeight % this.dataSection.length;
                dis = dis > disMax ? disMax : dis
                return dis
            },
            _setDataSection: function (data, data1) {
                //var arr = [];
                //var d = (data.org || data.data || data);
                //if( data1 && _.isArray(data1) ){
                //    d = d.concat(data1);
                //}
                //if (!this.biaxial) {
                //    arr = _.flatten( d ); //_.flatten( data.org );
                //} else {
                //    if (this.place == "left") {
                //        arr = _.flatten(d[0]);
                //        this.field = _.flatten([this.field[0]]);
                //    } else {
                //        arr = _.flatten(d[1]);
                //        this.field = _.flatten([this.field[1]]);
                //    }
                //};
                //for( var i = 0, il=arr.length; i<il ; i++ ){
                //    arr[i] =  arr[i] || 0;
                //};
                //return arr;

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
            },
            //data1 == [1,2,3,4]
            _initData: function(data , data1) {
                var arr = this._setDataSection(data , data1);
                this.dataOrg = (data.org || data.data); //这里必须是data.org
                if (this.dataSection.length == 0) {
                    this.dataSection = DataSection.section(arr, 3);
                };

                //如果还是0
                if (this.dataSection.length == 0) {
                    this.dataSection = [0]
                };   
                this.dataSectionGroup = [ _.clone(this.dataSection) ];

                this._sort();
                this._setBottomAndBaseNumber();

                this._middleweight(); //如果有middleweight配置，需要根据配置来重新矫正下datasection
            },
            _sort: function(){
                if (this.sort) {
                    var sort = "asc";
                    if (_.isString(this.sort)) {
                        sort = this.sort;
                    }
                    if (_.isArray(this.sort)) {
                        var i = 0;
                        if (this.place == "right") {
                            i = 1;
                        };
                        if (this.sort[i]) {
                            sort = this.sort[i];
                        };
                    };
                    if (sort == "desc") {
                        this.dataSection.reverse();

                        //dataSectionGroup 从里到外全部都要做一次 reverse， 这样就可以对应上 dataSection.reverse()
                        _.each( this.dataSectionGroup , function( dsg , i ){
                            dsg.reverse();
                        } );
                        this.dataSectionGroup.reverse();
                        //dataSectionGroup reverse end
                    };
                };
            },
            _setBottomAndBaseNumber : function(){
                this._bottomNumber = this.dataSection[0];
                if (this.baseNumber == null) {
                    var min = _.min( this.dataSection );
                    this.baseNumber = min > 0 ? min : 0;
                }
            },
            _middleweight : function(){
                if( this.middleweight ){
                    //支持多个量级的设置
                    //量级的设置只支持非sort的柱状图场景，否则这里修改过的datasection会和 _initData 中sort过的逻辑有冲突
                    if( !_.isArray( this.middleweight ) ){
                        this.middleweight = [ this.middleweight ];
                    };

                    //拿到dataSection中的min和max后，用middleweight数据重新设置一遍dataSection
                    var dMin = _.min( this.dataSection );
                    var dMax = _.max( this.dataSection );
                    var newDS = [ dMin ];
                    var newDSG = [];

                    for( var i=0,l=this.middleweight.length ; i<l ; i++ ){
                        var preMiddleweight = dMin;
                        if( i > 0 ){
                            preMiddleweight = this.middleweight[ i-1 ];
                        };
                        var middleVal = preMiddleweight + parseInt( (this.middleweight[i] - preMiddleweight) / 2 );

                        newDS.push( middleVal );
                        newDS.push( this.middleweight[i] );

                        newDSG.push([
                            preMiddleweight,
                            middleVal,
                            this.middleweight[i]
                        ]);
                    };
                    var lastMW = parseInt( this.middleweight.slice(-1)[0] );
                    newDS.push( lastMW + parseInt( (dMax - lastMW) / 2 ) );
                    newDS.push( dMax );

                    newDSG.push([
                        lastMW,
                        lastMW + parseInt( (dMax - lastMW) / 2 ),
                        dMax
                    ]);

                    //好了。 到这里用简单的规则重新拼接好了新的 dataSection
                    this.dataSection = newDS;
                    this.dataSectionGroup = newDSG;

                    //因为重新设置过了 dataSection 所以要重新排序和设置bottom and base 值
                    this._sort();
                    this._setBottomAndBaseNumber();
                };                
            },
            resetWidth: function (w) {
                var self = this;
                self.w = w;
                if (self.line.enabled) {
                    self.sprite.context.x = w - self.dis - self.line.width;
                } else {
                    self.sprite.context.x = w - self.dis;
                }
            },
            _widget: function() {
                var self = this;
                if (!self.enabled) {
                    self.w = 0;
                    return;
                }
                var arr = this.layoutData;
                self.maxW = 0;
                self._label && self.sprite.addChild(self._label);
                for (var a = 0, al = arr.length; a < al; a++) {
                    var o = arr[a];
                    var x = 0,
                        y = o.y;
                    var content = o.content
                    if (_.isFunction(self.text.format)) {
                        content = self.text.format(content, self);
                    };
                    if( content === undefined || content === null ){
                        content = Tools.numAddSymbol( o.content );
                    };

                    var yNode = self.sprite.getChildById("yNode" + a) ||
                        new Canvax.Display.Sprite({
                        id: "yNode" + a
                    });


                    var textAlign = (self.place == "left" ? "right" : "left");
                    //为横向图表把y轴反转后的 逻辑
                    if (self.text.rotation == 90 || self.text.rotation == -90) {
                        textAlign = "center";
                        if (a == arr.length - 1) {
                            textAlign = "right";
                        }
                    };
                    var posy = y + (a == 0 ? -3 : 0) + (a == arr.length - 1 ? 3 : 0);
                    //为横向图表把y轴反转后的 逻辑
                    if (self.text.rotation == 90 || self.text.rotation == -90) {
                        if (a == arr.length - 1) {
                            posy = y - 2;
                        }
                        if (a == 0) {
                            posy = y;
                        }
                    };

                    //文字
                    var txt = yNode.getChildById("yAxis_txt_" + a) ||
                        new Canvax.Display.Text(content, {
                            id: "yAxis_txt_" + a,
                        context: {
                            fillStyle: self.text.fillStyle,
                            fontSize: self.text.fontSize,
                            rotation: -Math.abs(this.text.rotation),
                            textAlign: textAlign,
                            textBaseline: "middle",
                            globalAlpha: 0
                        }
                    });
                    txt.context.x = x + (self.place == "left" ? -5 : 5);
                    txt.context.y = posy + 20;
                    yNode.addChild(txt);

                    self.maxW = Math.max(self.maxW, txt.getTextWidth());
                    if (self.text.rotation == 90 || self.text.rotation == -90) {
                        self.maxW = Math.max(self.maxW, txt.getTextHeight());
                    }

                    if (self.line.enabled) {
                        //线条
                        var line = yNode.getChildById("yAxis_line_" + a) ||
                            new Line({
                                id: "yAxis_line_" + a,
                            context: {
                                lineWidth: self.line.lineWidth,
                                strokeStyle: self.line.strokeStyle
                            }
                        });
                        line.context.x = 0 + (self.place == "left" ? +1 : -1) * self.dis - 2;
                        line.context.y = y;
                        line.context.xEnd = self.line.width;
                        line.context.yEnd = 0;
                        yNode.addChild(line);
                    }
                    ;
                    //这里可以由用户来自定义过滤 来 决定 该node的样式
                    _.isFunction(self.filter) && self.filter({
                        layoutData: self.layoutData,
                        index: a,
                        txt: txt,
                        line: line
                    });

                    self.sprite.addChild(yNode);

                    //如果是resize的话也不要处理动画
                    if (false && self.animation && !self.resize) {
                        txt.animate({
                            globalAlpha: 1,
                            y: txt.context.y - 20
                        }, {
                            duration: 500,
                            easing: 'Back.Out', //Tween.Easing.Elastic.InOut
                            delay: a * 80,
                            id: txt.id
                        });
                    } else {
                        txt.context.y = txt.context.y - 20;
                        txt.context.globalAlpha = 1;
                    }
                };

                self.maxW += self.dis;

                //self.sprite.context.x = self.maxW + self.pos.x;
                //self.pos.x = self.maxW + self.pos.x;
                if (self.line.enabled) {
                    self.w = self.maxW + self.dis + self.line.width + self.pos.x;
                } else {
                    self.w = self.maxW + self.dis + self.pos.x;
                }
            }
        };

        return yAxis;

    });