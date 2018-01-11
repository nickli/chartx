import Component from "../component"
import Canvax from "canvax2d"


const Line = Canvax.Shapes.Line;
const Rect = Canvax.Shapes.Rect;
const _ = Canvax._;

export default class dataZoom extends Component
{
	constructor(opt, cloneChart)
	{
        super(opt, cloneChart);
        
        this._cloneChart = cloneChart;

		//0-1
        this.range = {
            start: 0,
            end : null,
            max : null, //可以外围控制智能在哪个区间拖动
            min : 1  //最少至少选中了一个数据
        };
        
        this.count = 1; //把w 均为为多少个区间， 同样多节点的line 和  bar， 这个count相差一
        this.dataLen = 1;
        this.layoutType = cloneChart.thumbChart._coordinate._xAxis.layoutType; //和line bar等得xAxis.layoutType 一一对应

        this.pos = {
            x: 0,
            y: 0
        };
        this.left = {
            eventEnabled : true
        };
        this.right = {
            eventEnabled : true
        };
        this.center = {
            eventEnabled: true,
            fillStyle : '#ffffff',
            globalAlpha : 0
        };

        this.w = 0;
        this.h = 40;

        this.color = opt.color || "#008ae6";

        this.bg = {
            enabled : true,
            fillStyle : "",
            strokeStyle: "#e6e6e6",
            lineWidth : 1
        }

        this.underline = {
            enabled : true,
            strokeStyle : this.color,
            lineWidth : 2
        }

        this.dragIng = function(){};
        this.dragEnd = function(){};

        
        this.disPart = {};
        this.barAddH = 8;
        this.barH = this.h - this.barAddH;
        this.barY = 6 / 2;
        this.btnW = 8;
        this.btnFillStyle = this.color;
        this._btnLeft = null;
        this._btnRight = null;
        this._underline = null;

        this.zoomBg = null;

        opt && _.extend( true, this, opt);
        this._computeAttrs( opt );
        this.init(opt);
	}

	init(opt) 
	{
        var me = this;
        me.sprite = new Canvax.Display.Sprite({
            id : "dataZoom",
            context: {
                x: me.pos.x,
                y: me.pos.y
            }
        });
        me.sprite.noSkip=true;
        me.dataZoomBg = new Canvax.Display.Sprite({
            id : "dataZoomBg"
        });
        me.dataZoomBtns = new Canvax.Display.Sprite({
            id : "dataZoomBtns"
        });
        me.sprite.addChild( me.dataZoomBg );
        me.sprite.addChild( me.dataZoomBtns );

        me.widget();
        me._setLines();
        this.setZoomBg();
    }

    draw()
    {
        //这个组件可以在init的时候就绘制好
    }

    destroy()
    {
        this.sprite.destroy();
    }

    reset( opt , cloneChart )
    {
        
        !opt && ( opt = {} );

        var _preCount = this.count;
        var _preStart = this.range.start;
        var _preEnd = this.range.end;

        opt && _.extend(true, this, opt);
        this._cloneChart = cloneChart;
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
    _computeAttrs(opt)
    {
        var _cloneChart = this._cloneChart.thumbChart

        this.dataLen = _cloneChart._data.length - 1;
        this.count = this.layoutType == "rule" ? this.dataLen-1 : this.dataLen;
        
        if(!this.range.max || this.range.max > this.count){
            this.range.max = this.count;
        }
        if( !this.range.end || this.range.end > this.dataLen - 1 ){
            this.range.end = this.dataLen - 1;
        }
        
        this.disPart = this._getDisPart();
        this.barH = this.h - this.barAddH;
    }

    _getRangeEnd( end )
    {
        if( end === undefined ){
            end = this.range.end;
        }
        if( this.layoutType == "peak" ){
            end += 1;
        };
        return end
    }

    widget() 
    {
        var me = this;
        var setLines = function(){
            me._setLines.apply(me, arguments);
        };

        if(me.bg.enabled){
            var bgRectCtx = {
                x: 0,
                y: me.barY,
                width: me.w,
                height: me.barH,
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
                    x : me.range.start / me.count * me.w + me.btnW / 2,
                    y : me.barY + me.barH + 2
                },
                end : {
                    x : me._getRangeEnd() / me.count * me.w  - me.btnW / 2,
                    y : me.barY + me.barH + 2
                },
                lineWidth : me.underline.lineWidth,
                strokeStyle : me.underline.strokeStyle
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
            x: me.range.start / me.count * me.w,
            y: me.barY - me.barAddH / 2 + 1,
            width: me.btnW,
            height: me.barH + me.barAddH,
            fillStyle : me.btnFillStyle,
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
                
                this.context.y = me.barY - me.barAddH / 2 + 1
                if(this.context.x < 0){
                    this.context.x = 0;
                };
                if(this.context.x > (me._btnRight.context.x - me.btnW - 2)){
                    this.context.x = me._btnRight.context.x - me.btnW - 2
                };
                if(me._btnRight.context.x + me.btnW - this.context.x > me.disPart.max){
                    this.context.x = me._btnRight.context.x + me.btnW - me.disPart.max
                }
                if(me._btnRight.context.x + me.btnW - this.context.x < me.disPart.min){
                    this.context.x = me._btnRight.context.x + me.btnW - me.disPart.min
                }
                me.rangeRect.context.width = me._btnRight.context.x - this.context.x - me.btnW;
                me.rangeRect.context.x = this.context.x + me.btnW;

                me._setRange();

            });
            me._btnLeft.on("dragend" , function(e){
                me.dragEnd( me.range );
            });
            this.dataZoomBtns.addChild( this._btnLeft );
        };

        var btnRightCtx = {
            x: me._getRangeEnd() / me.count * me.w - me.btnW,
            y: me.barY - me.barAddH / 2 + 1,
            width: me.btnW,
            height: me.barH + me.barAddH ,
            fillStyle : me.btnFillStyle,
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
                
                this.context.y = me.barY - me.barAddH / 2 + 1
                if( this.context.x > me.w - me.btnW ){
                    this.context.x = me.w - me.btnW;
                };
                if( this.context.x + me.btnW - me._btnLeft.context.x > me.disPart.max){
                    this.context.x = me.disPart.max - (me.btnW - me._btnLeft.context.x)
                };
                if( this.context.x + me.btnW - me._btnLeft.context.x < me.disPart.min){
                    this.context.x = me.disPart.min - me.btnW + me._btnLeft.context.x;
                };
                me.rangeRect.context.width = this.context.x - me._btnLeft.context.x - me.btnW;
                me._setRange();
            });
            me._btnRight.on("dragend" , function(e){
                
                me.dragEnd( me.range );
            });
            this.dataZoomBtns.addChild( this._btnRight );
        };


        var rangeRectCtx = {
            x : btnLeftCtx.x + me.btnW,
            y : this.barY + 1,
            width : btnRightCtx.x - btnLeftCtx.x - me.btnW,
            height : this.barH - 1,
            fillStyle : me.center.fillStyle,
            globalAlpha : me.center.globalAlpha,
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
                
                this.context.y = me.barY + 1;
                if( this.context.x < me.btnW ){
                    this.context.x = me.btnW; 
                };
                if( this.context.x > me.w - this.context.width - me.btnW ){
                    this.context.x = me.w - this.context.width - me.btnW;
                };
                me._btnLeft.context.x  = this.context.x - me.btnW;
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
                strokeStyle : this.btnFillStyle
            });
            this.dataZoomBtns.addChild( this.linesCenter );
        };
        
    }

    _getDisPart()
    {
        var me = this;
        var min = Math.max( parseInt(me.range.min / 2 / me.count * me.w), 23 );
        //柱状图用得这种x轴布局，不需要 /2
        if( this.layoutType == "peak" ){
            min = Math.max( parseInt(me.range.min / me.count * me.w), 23 );
        };

        return {
            min : min,
            max : parseInt(me.range.max / me.count * me.w)
        }
    }

    _setRange( trigger )
    {
        var me = this;
        var _end = me._getRangeEnd();
        var _preDis = _end - me.range.start;

        var start = (me._btnLeft.context.x / me.w) * me.count;
        var end =  ((me._btnRight.context.x + me.btnW) / me.w) * me.count;

        if( this.layoutType == "peak" ){
            start = Math.round( start );
            end = Math.round( end );
        } else {
            start = parseInt(start);
            end = parseInt(end);
        }

        if( trigger == "btnCenter" ){
            //如果是拖动中间部分，那么要保持 end-start的总量一致
            if( (end - start) != _preDis ){
                end = start + _preDis;
            }
        };
        
        

        if( start != me.range.start || end != _end ){
            me.range.start = start;
            if( me.layoutType == "peak" ){
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
            me._underline.context.start.x = linesLeft.context.x + me.btnW / 2;
            me._underline.context.end.x =linesRight.context.x + me.btnW / 2;
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
        var _coor = this._cloneChart.thumbChart._coordinate;

        graphssp.id = graphssp.id + "_datazoomthumbChartbg"
        graphssp.context.x = -_coor.graphsX; //0;
        graphssp.context.y = this.barY;//this.barH + this.barY;
        graphssp.context.scaleY = this.barH / _coor.graphsHeight;
        graphssp.context.scaleX = this.w / _coor.graphsWidth;


        this.dataZoomBg.addChild( graphssp );

        this.__graphssp = graphssp;

        this._cloneChart.thumbChart.destroy();
        this._cloneChart.cloneEl.parentNode.removeChild( this._cloneChart.cloneEl );
    }

}