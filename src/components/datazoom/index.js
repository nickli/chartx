import Component from "../component"
import Canvax from "canvax"
import { global,_ ,getDefaultProps} from "mmvis"
import Trigger from "../trigger"

const Line = Canvax.Shapes.Line;
const Rect = Canvax.Shapes.Rect;

class dataZoom extends Component
{
    static defaultProps(){
        return {
            position : {
                detail: '位置',
                default: 'bottom'
            },
            direction : {
                detail : '方向',
                default : 'h'
            },
            height : {
                detail : '高',
                default: 26
            },
            width : {
                detail: '宽',
                default: 100
            },
            color : {
                detail : '颜色',
                default: '#008ae6' 
            },
            range : { //propotion中，start 和 end代表的是数值的大小
                detail : '范围设置',
                propertys : {
                    start : {
                        detail : '开始位置',
                        default: 0
                    },
                    end : {
                        detail : '结束位置，默认为null，表示到最后',
                        default: null
                    },
                    max : {
                        detail : '可以外围控制智能在哪个区间拖动',
                        default: null
                    },
                    min : {
                        detail : '最少至少选中了几个数据',
                        default: 1
                    }
                }
            },
            left : {
                detail : '左边按钮',
                propertys : {
                    eventEnabled : {
                        detail : '是否响应事件',
                        default: true
                    },
                    fillStyle : {
                        detail : '颜色，默认取组件.color',
                        default: null
                    }
                }
            },
            right : {
                detail : '右边按钮',
                propertys : {
                    eventEnabled : {
                        detail : '是否响应事件',
                        default: true
                    },
                    fillStyle : {
                        detail : '颜色，默认取组件.color',
                        default: null
                    }
                }
            },
            center : {
                detail : '中间位置设置',
                propertys : {
                    eventEnabled : {
                        detail : '是否响应事件',
                        default: true
                    },
                    fillStyle : {
                        detail : '填充色',
                        default: '#000000'
                    },
                    alpha: {
                        detail : '透明度',
                        default: 0.015
                    }
                }
            },
            bg : {
                detail : '背景设置',
                propertys : {
                    enabled : {
                        detail : '是否开启',
                        default: true
                    },
                    fillStyle : {
                        detail : '填充色',
                        default: ''
                    },
                    strokeStyle: {
                        detail : '边框色',
                        default: '#e6e6e6'
                    },
                    lineWidth : {
                        detail : '线宽',
                        default: 1
                    }
                }
            },
            underline : {
                detail : 'underline',
                propertys : {
                    enabled : {
                        detail : '是否开启',
                        default: true
                    },
                    strokeStyle: {
                        detail : '线条色',
                        default: null
                    },
                    lineWidth : {
                        detail : '线宽',
                        default: 2
                    }
                }
            },
            btnOut : {
                detail : 'left,right按钮突出的大小',
                default: 6
            },
            btnHeight : {
                detail : 'left,right按钮高',
                default: 20,
                documentation : 'left,right按钮的高，不在left，right下面，统一在这个属性里， 以为要强制保持一致'
            },
            btnWidth: {
                detail : 'left,right按钮的宽',
                default: 8,
                documentation: 'left,right按钮的宽，不在left，right下面，统一在这个属性里， 以为要强制保持一致'
            }
    
        }
    }

    constructor(opt, app)
	{
        super(opt, app);

        this.name = "dataZoom";

        this._cloneChart = null;
        
        this.count = 1; //把w 均为为多少个区间， 同样多节点的line 和  bar， 这个count相差一
        this.dataLen = 1; //总共有多少条数据 
        this.axisLayoutType = null; //和xAxis.layoutType 一一对应  peak rule proportion

        this.dragIng = function(){};
        this.dragEnd = function(){};
        
        this.disPart = {};

        this._btnLeft = null;
        this._btnRight = null;
        this._underline = null;

        this.sprite = new Canvax.Display.Sprite({
            id : "dataZoom",
            context: {
                x: this.pos.x,
                y: this.pos.y
            }
        });
        this.sprite.noSkip=true;
        this.dataZoomBg = new Canvax.Display.Sprite({
            id : "dataZoomBg"
        });
        this.dataZoomBtns = new Canvax.Display.Sprite({
            id : "dataZoomBtns"
        });
        this.sprite.addChild( this.dataZoomBg );
        this.sprite.addChild( this.dataZoomBtns );

        app.stage.addChild( this.sprite );

        //预设默认的opt.dataZoom
        _.extend( true, this, getDefaultProps( dataZoom.defaultProps() ) , opt);

        this.axis = null; //对应哪个轴
        
        this.layout();

	}

    
    //datazoom begin
    layout()
    {

        let app = this.app;
        if( this.position == "bottom" ){
            //目前dataZoom是固定在bottom位置的
            //_getDataZoomOpt中会矫正x
            this.pos.y = app.height - (this.height + app.padding.bottom + this.margin.bottom);
            app.padding.bottom += (this.height + this.margin.top + this.margin.bottom);
        };
        if( this.position == "top" ){
            this.pos.y = app.padding.top + this.margin.top;
            app.padding.top += (this.height + this.margin.top + this.margin.bottom);
        };
        
    }
 

    _getCloneChart() 
    {
        var me = this;
        var app = this.app;
        var _coord = app.getCoord();
        var chartConstructor = app.constructor;//(barConstructor || Bar);
        var cloneEl = app.el.cloneNode();
        cloneEl.innerHTML = "";
        cloneEl.id = app.el.id + "_currclone";
        cloneEl.style.position = "absolute";
        cloneEl.style.width = this.width + "px";
        cloneEl.style.height = this.btnHeight+"px"; //app.el.offsetHeight + "px";
        cloneEl.style.top = "10000px";
        document.body.appendChild(cloneEl);

        //var opt = _.extend(true, {}, me._opt);
        //_.extend(true, opt, me.getCloneChart() );

        //clone的chart只需要coord 和 graphs 配置就可以了
        //因为画出来后也只需要拿graphs得sprite去贴图
        var graphsOpt = [];
        _.each( app.getComponents({name:'graphs'}), function( _g ){
            var _field = _g.enabledField || _g.field;
            
            if( _.flatten([_field]).length ) {

                var _opt = _.extend( true, {} , _g._opt );
                
                _opt.field = _field;
                if( _g.type == "bar" ){
                    _.extend(true, _opt , {
                        node: {
                            fillStyle: "#ececec",
                            radius: 0
                        },
                        animation: false,
                        label: {
                            enabled: false
                        }
                    } )
                }
                if( _g.type == "line" ){
                    _.extend( true,  _opt , {
                        line: {
                            //lineWidth: 1,
                            strokeStyle: "#ececec"
                        },
                        node: {
                            enabled: false
                        },
                        area: {
                            alpha: 1,
                            fillStyle: "#ececec"
                        },
                        animation: false,
                        label: {
                            enabled: false
                        }
                    } )
                };

                
                var _h = _coord.height || app.el.offsetHeight;
                var radiusScale = (me.btnHeight / _h) || 1 ;
                if( _g.type == "scat" ){
                    _.extend( true, _opt, {
                        animation: false,
                        node : {
                            //fillStyle : "#ececec",
                            radiusScale : radiusScale,
                            fillAlpha : 0.4
                        },
                        label: {
                            enabled: false
                        }
                    } )
                }

                graphsOpt.push( _opt );
            }
        } );

        var opt = {
            coord : app._opt.coord,
            graphs : graphsOpt
        };

        if( opt.coord.horizontal ){
            delete opt.coord.horizontal;
        };

        opt.coord.enabled = false;
        opt.coord.padding = 0;

        var thumbChart = new chartConstructor(cloneEl, app._data, opt, app.componentModules);
        thumbChart.draw();

        return {
            thumbChart: thumbChart,
            cloneEl: cloneEl
        }
    }

    _setDataZoomOpt()
    {

        var app = this.app;
        var coordInfo = app.getComponent({name:'coord'}).getSizeAndOrigin();
        var me = this;
        
        //初始化 datazoom 模块
        _.extend(true, this, {
            width: parseInt( coordInfo.width ),
            pos: {
                x: coordInfo.origin.x
            },
            dragIng: function(range) {
                var trigger;

                if( me.axisLayoutType == 'proportion' ){
                    trigger = new Trigger( me, {
                        min :  range.start,
                        max : range.end
                    } );
                    app.dataFrame.filters[ 'datazoom' ] = function( rowData ){
                        var val = rowData[ me.axis.field ];

                        //把range.start  range.end换算成axis上面对应的数值区间
                        var min = me.axis.getValOfPos( range.start );
                        var max = me.axis.getValOfPos( range.end );
                        
                        return val >= min && val <= max;
                    };
                } else {
                    trigger = new Trigger( me, {
                        left :  app.dataFrame.range.start - range.start,
                        right : range.end - app.dataFrame.range.end
                    } );
                    _.extend( app.dataFrame.range , range );
                };
                
                //不想要重新构造dataFrame，所以第一个参数为null
                app.resetData( null , trigger );
                app.fire("dataZoomDragIng");
            },
            dragEnd: function(range) {
                app.updateChecked && app.updateChecked();
                app.fire("dataZoomDragEnd");
            }
        });
    }
    //datazoom end

    draw()
    {

        this._setDataZoomOpt();
        
        this._cloneChart = this._getCloneChart();
        this.axis = this._cloneChart.thumbChart.getComponent({name:'coord'})._xAxis;
        this.axisLayoutType = this.axis.layoutType; //和line bar等得xAxis.layoutType 一一对应

        this._computeAttrs();

        //这个组件可以在init的时候就绘制好
        this.widget();
        this._setLines();
        this.setZoomBg();
        this.setPosition();
    }

    destroy()
    {
        this.sprite.destroy();
    }

    reset( opt , dataFrame )
    {
        
        !opt && ( opt = {} );

        var _preCount = this.count;
        var _preStart = this.range.start;
        var _preEnd = this.range.end;

        opt && _.extend(true, this, opt);
        this._cloneChart = this._getCloneChart()//cloneChart;
        this._computeAttrs(opt);

        if( 
            _preCount != this.count ||
            ( opt.range && ( opt.range.start != _preStart || opt.range.end != _preEnd ) )
        ){
            this.widget();
            this._setLines();
        };

        this.setZoomBg( );
    }

    //计算属性
    _computeAttrs()
    {
        var _cloneChart = this._cloneChart.thumbChart

        this.dataLen = _cloneChart.dataFrame.length;
        switch( this.axisLayoutType ){
            case "rule":
                this.count = this.dataLen-1;
                break;
            case "peak":
                this.count = this.dataLen;
                break;
            case "proportion":
                this.count = this.width;
                break;
        };
        
        if(!this.range.max || this.range.max > this.count){
            this.range.max = this.count - 1;
        };
        if( !this.range.end || this.range.end > this.dataLen - 1 ){
            this.range.end = this.dataLen - 1;
            if( this.axisLayoutType == "proportion" ){
                this.range.end = this.count - 1;
            };
        };

        //如果用户没有配置layoutType但是配置了position
        if( !this.direction && this.position ){
            if( this.position == "left" || this.position == "right" ){
                this.direction = 'v';
            } else {
                this.direction = 'h';
            };
        };
        
        this.disPart = this._getDisPart();
        this.btnHeight = this.height - this.btnOut;
    }
    _getDisPart()
    {
        var me = this;
        var min = Math.max( parseInt(me.range.min / 2 / me.count * me.width), 23 );
        var max = parseInt((me.range.max+1) / me.count * me.width);
        //柱状图用得这种x轴布局，不需要 /2
        if( this.axisLayoutType == "peak" ){
            min = Math.max( parseInt(me.range.min / me.count * me.width), 23 );
        };

        if( this.axisLayoutType == "proportion" ){
            //min = min;
            max = me.width;
        };

        return {
            min : min,
            max : max
        };
    }

    _getRangeEnd( end )
    {
        if( end === undefined ){
            end = this.range.end;
        }
        if( this.axisLayoutType == "peak" ){
            end += 1;
        }
        if( this.axisLayoutType == "proportion" ){
            end += 1;
        }
     
        return end
    }

    widget()
    {
        var me = this;
        var setLines = function(){
            me._setLines.apply(me, arguments);
        };

        if( me.bg.enabled ){
            var bgRectCtx = {
                x: 0,
                y: 0,
                width: me.width,
                height: me.btnHeight,
                lineWidth: me.bg.lineWidth,
                strokeStyle: me.bg.strokeStyle,
                fillStyle: me.bg.fillStyle
            };
            if( me._bgRect ){
                me._bgRect.animate( bgRectCtx , {
                    onUpdate : setLines
                });
            } else {
                me._bgRect = new Rect({
                    context: bgRectCtx
                });
                me.dataZoomBg.addChild( me._bgRect );
            }
            
        }

        if(me.underline.enabled){
            var underlineCtx = {
                start : {
                    x : me.range.start / me.count * me.width + me.btnWidth / 2,
                    y : me.btnHeight
                },
                end : {
                    x : me._getRangeEnd() / me.count * me.width  - me.btnWidth / 2,
                    y : me.btnHeight
                },
                lineWidth : me.underline.lineWidth,
                strokeStyle : me.underline.strokeStyle || me.color
            };

            if( me._underline ){
                me._underline.animate( underlineCtx , {
                    onUpdate : setLines
                });
            } else {
                me._underline = me._addLine( underlineCtx )
                me.dataZoomBg.addChild(me._underline); 
            };
        }


        var btnLeftCtx = {
            x: me.range.start / me.count * me.width,
            y: - me.btnOut / 2 + 1,
            width: me.btnWidth,
            height: me.btnHeight + me.btnOut,
            fillStyle : me.left.fillStyle || me.color,
            cursor: me.left.eventEnabled && "move"
        }
        if(me._btnLeft){
            me._btnLeft.animate(btnLeftCtx,{
                onUpdate : setLines
            });
        } else {
            me._btnLeft = new Rect({
                id          : 'btnLeft',
                dragEnabled : me.left.eventEnabled,
                context: btnLeftCtx
            });
            me._btnLeft.on("draging" , function(e){
                
                this.context.y = - me.btnOut / 2 + 1
                if(this.context.x < 0){
                    this.context.x = 0;
                };
                if(this.context.x > (me._btnRight.context.x - me.btnWidth - 2)){
                    this.context.x = me._btnRight.context.x - me.btnWidth - 2
                };
                if(me._btnRight.context.x + me.btnWidth - this.context.x >= me.disPart.max){
                    this.context.x = me._btnRight.context.x + me.btnWidth - me.disPart.max
                }
                if(me._btnRight.context.x + me.btnWidth - this.context.x < me.disPart.min){
                    this.context.x = me._btnRight.context.x + me.btnWidth - me.disPart.min
                }
                me.rangeRect.context.width = me._btnRight.context.x - this.context.x - me.btnWidth;
                me.rangeRect.context.x = this.context.x + me.btnWidth;

                me._setRange();

            });
            me._btnLeft.on("dragend" , function(e){
                me.dragEnd( me.range );
            });
            this.dataZoomBtns.addChild( this._btnLeft );
        };

        
        var btnRightCtx = {
            x: me._getRangeEnd() / me.count * me.width - me.btnWidth,
            y: - me.btnOut / 2 + 1,
            width: me.btnWidth,
            height: me.btnHeight + me.btnOut ,
            fillStyle : me.right.fillStyle || me.color,
            cursor : me.right.eventEnabled && "move"
        };

        if( me._btnRight ){
            me._btnRight.animate(btnRightCtx, {
                onUpdate : setLines
            });
        } else {
            me._btnRight = new Rect({
                id          : 'btnRight',
                dragEnabled : me.right.eventEnabled,
                context: btnRightCtx
            });

            me._btnRight.on("draging" , function(e){
                
                this.context.y = - me.btnOut / 2 + 1
                if( this.context.x > me.width - me.btnWidth ){
                    this.context.x = me.width - me.btnWidth;
                };
                if( this.context.x + me.btnWidth - me._btnLeft.context.x >= me.disPart.max){
                    this.context.x = me.disPart.max - (me.btnWidth - me._btnLeft.context.x)
                };
                if( this.context.x + me.btnWidth - me._btnLeft.context.x < me.disPart.min){
                    this.context.x = me.disPart.min - me.btnWidth + me._btnLeft.context.x;
                };
                me.rangeRect.context.width = this.context.x - me._btnLeft.context.x - me.btnWidth;
                me._setRange();
            });
            me._btnRight.on("dragend" , function(e){
                me.dragEnd( me.range );
            });
            this.dataZoomBtns.addChild( this._btnRight );
        };


        var rangeRectCtx = {
            x : btnLeftCtx.x + me.btnWidth,
            y : 1,
            width : btnRightCtx.x - btnLeftCtx.x - me.btnWidth,
            height : this.btnHeight - 1,
            fillStyle : me.center.fillStyle,
            fillAlpha : me.center.alpha,
            cursor : "move"
        };
        if( this.rangeRect ){
            this.rangeRect.animate( rangeRectCtx , {
                onUpdate : setLines
            });
        } else {
            //中间矩形拖拽区域
            this.rangeRect = new Rect({
                id          : 'btnCenter',
                dragEnabled : true,
                context : rangeRectCtx
            });
            this.rangeRect.on("draging" , function(e){
                
                this.context.y = 1;
                if( this.context.x < me.btnWidth ){
                    this.context.x = me.btnWidth; 
                };
                if( this.context.x > me.width - this.context.width - me.btnWidth ){
                    this.context.x = me.width - this.context.width - me.btnWidth;
                };
                me._btnLeft.context.x  = this.context.x - me.btnWidth;
                me._btnRight.context.x = this.context.x + this.context.width;
                me._setRange( "btnCenter" );

            });
            this.rangeRect.on("dragend" , function(e){
                me.dragEnd( me.range );
            });
            this.dataZoomBtns.addChild( this.rangeRect );
        };

        if(!this.linesLeft){
            this.linesLeft = new Canvax.Display.Sprite({ id : "linesLeft" });
            if(this.left.eventEnabled){
                this._addLines({
                    sprite : this.linesLeft
                })
            };
            this.dataZoomBtns.addChild( this.linesLeft );
        };
        if(!this.linesRight){
            this.linesRight = new Canvax.Display.Sprite({ id : "linesRight" });
            if(this.right.eventEnabled){
                this._addLines({
                    sprite : this.linesRight
                })
            };
            this.dataZoomBtns.addChild( this.linesRight );
        };

        if(!this.linesCenter){
            this.linesCenter = new Canvax.Display.Sprite({ id : "linesCenter" });
            this._addLines({
                count  : 3,
                // dis    : 1,
                sprite : this.linesCenter,
                strokeStyle : this.color
            });
            this.dataZoomBtns.addChild( this.linesCenter );
        };
        
    }

    _setRange( trigger )
    {
        var me = this;
        var _end = me._getRangeEnd();
        var _preDis = _end - me.range.start;

        var start = (me._btnLeft.context.x / me.width) * me.count;
        var end =  ((me._btnRight.context.x + me.btnWidth) / me.width) * me.count;
       
        //console.log( (me._btnRight.context.x + me.btnWidth)+"|"+ me.width + "|" + me.count )
        if( this.axisLayoutType == "peak" ){
            start = Math.round( start );
            end = Math.round( end );
        } else if( this.axisLayoutType == "rule" ) {
            start = parseInt( start );
            end = parseInt( end );
        } else {
            start = parseInt( start );
            end = parseInt( end );;
        };

        if( trigger == "btnCenter" ){
            //如果是拖动中间部分，那么要保持 end-start的总量一致
            if( (end - start) != _preDis ){
                end = start + _preDis;
            }
        };
        
        if( start != me.range.start || end != _end ){
            me.range.start = start;
            if( me.axisLayoutType == "peak" ){
                end -= 1;
            };
            me.range.end = end;
            me.dragIng( me.range );
        };

        me._setLines();
    }

    _setLines()
    {
        
        var me = this
        var linesLeft  = this.linesLeft;
        var linesRight = this.linesRight;
        var linesCenter = this.linesCenter;
        
        var btnLeft    = this._btnLeft;
        var btnRight   = this._btnRight;
        var btnCenter  = this.rangeRect;
        
        linesLeft.context.x = btnLeft.context.x + (btnLeft.context.width - linesLeft.context.width ) / 2
        linesLeft.context.y = btnLeft.context.y + (btnLeft.context.height - linesLeft.context.height ) / 2

        linesRight.context.x = btnRight.context.x + (btnRight.context.width - linesRight.context.width ) / 2
        linesRight.context.y = btnRight.context.y + (btnRight.context.height - linesRight.context.height ) / 2

        linesCenter.context.x = btnCenter.context.x + (btnCenter.context.width - linesCenter.context.width ) / 2
        linesCenter.context.y = btnCenter.context.y + (btnCenter.context.height - linesCenter.context.height ) / 2

        if( me.underline.enabled ){
            me._underline.context.start.x = linesLeft.context.x + me.btnWidth / 2;
            me._underline.context.end.x =linesRight.context.x + me.btnWidth / 2;
        }
    }

    _addLines($o)
    {
        var me = this
        var count  = $o.count || 2
        var sprite = $o.sprite
        var dis    = $o.dis || 2
        for(var a = 0, al = count; a < al; a++){
            sprite.addChild(me._addLine({
                x : a * dis,
                strokeStyle : $o.strokeStyle || ''
            }))
        }
        sprite.context.width = a * dis - 1, sprite.context.height = 6
    }

    _addLine($o)
    {
        var o = $o || {}
        var line = new Line({
            id     : o.id || '',
            context: {
                x: o.x || 0,
                y: o.y || 0,
                start : {
                    x : o.start ? o.start.x : 0,
                    y : o.start ? o.start.y : 0
                },
                end : {
                    x : o.end ? o.end.x : 0,
                    y : o.end ? o.end.y : 6
                },
                lineWidth: o.lineWidth || 1,
                strokeStyle: o.strokeStyle || '#ffffff'
            }
        });
        return line
    }

    setZoomBg()
    {
        //这里不是直接获取_graphs.sprite 而是获取 _graphs.core，切记切记
        
        if( this.__graphssp ){
            this.__graphssp.destroy();
        };

        var graphssp = this._cloneChart.thumbChart.graphsSprite;
        graphssp.setEventEnable(false);
        
        var _coor = this._cloneChart.thumbChart.getComponent({name:'coord'});

        graphssp.id = graphssp.id + "_datazoomthumbChartbg"
        graphssp.context.x = -_coor.origin.x; //0;


        //缩放到横条范围内
        graphssp.context.scaleY = this.btnHeight / _coor.height;
        graphssp.context.scaleX = this.width / _coor.width;

        this.dataZoomBg.addChild( graphssp , 0);

        this.__graphssp = graphssp;

        this._cloneChart.thumbChart.destroy();
        this._cloneChart.cloneEl.parentNode.removeChild( this._cloneChart.cloneEl );
    }

}

global.registerComponent( dataZoom, 'dataZoom' );

export default dataZoom;