import Canvax from "canvax2d"
import { getEl,parse2MatrixData } from "../utils/tools"

const _ = Canvax._;

export default class Chart extends Canvax.Event.EventDispatcher
{
    constructor( node, data, opts )
    {

        super( node, data, opts );

        this.Canvax = Canvax;

        this._node = node;
        //不管传入的是data = [ ['xfield','yfield'] , ['2016', 111]]
        //还是 data = [ {xfiled, 2016, yfield: 1111} ]，这样的格式，
        //通过parse2MatrixData最终转换的是data = [ ['xfield','yfield'] , ['2016', 111]] 这样 chartx的数据格式
        //后面有些地方比如 一些graphs中会使用dataFrame.org，， 那么这个dataFrame.org和_data的区别是，
        //_data是全量数据， dataFrame.org是_data经过dataZoom运算过后的子集
        this._data = parse2MatrixData(data);
        this._opts = opts;

        this.el = getEl(node) //chart 在页面里面的容器节点，也就是要把这个chart放在哪个节点里
        this.width = parseInt(this.el.offsetWidth) //图表区域宽
        this.height = parseInt(this.el.offsetHeight) //图表区域高

        this.padding = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        };

        //Canvax实例
		this.canvax = new Canvax.App({
		    el : this.el,
		    webGL : false
		});
		this.canvax.registEvent();
		this.stage = new Canvax.Display.Stage({
		    id: "main-chart-stage" + new Date().getTime()
		});
		this.canvax.addChild( this.stage );


        //组件管理机制
        this.plugs = [];

        this.inited = false;
        this.dataFrame = null; //每个图表的数据集合 都 存放在dataFrame中。

        this.init.apply(this, arguments);
        
        var me = this;
        if( opts.waterMark ){
            //添加水印的临时解决方案
            setTimeout( function(){
                me._initWaterMark( opts.waterMark );
            } , 50);
        }
    }

    init()
    {
    }

   
    draw()
    {
    }

    initData()
    {
    }

    /*
     * chart的销毁
     */
    destroy() 
    {
        this.clean();
        if(this.el){
            this.el.innerHTML = "";
            this.el = null;
        };
        this._destroy && this._destroy();
        this.fire("destroy");
    }

    /*
     * 清除整个图表
     **/
    clean()
    {
        for (var i=0,l=this.canvax.children.length;i<l;i++){
            var stage = this.canvax.getChildAt(i);
            for( var s = 0 , sl=stage.children.length ; s<sl ; s++){
                stage.getChildAt(s).destroy();
                s--;
                sl--;
            }
        };
    }

    /**
     * 容器的尺寸改变重新绘制
     */
    resize()
    {
        var _w = parseInt(this.el.offsetWidth);
        var _h = parseInt(this.el.offsetHeight);
        if( _w == this.width && _h == this.height ) return;
        this.clean();
        this.width = _w;
        this.height = _h;
        this.canvax.resize();
        this.inited = false;

        this.reset();

        this.inited = true;
    }

    /**
     * reset 其实就是重新绘制整个图表，不再做详细的拆分opts中有哪些变化，来做对应的细致的变化，简单粗暴的全部重新创立
     */
    reset(opts, data)
    {
        !opts && (opts={});

        _.extend(true, this._opts, opts);
        //和上面的不同this._opts存储的都是用户设置的配置
        //而下面的这个extend到this上面， this上面的属性都有包含默认配置的情况
        _.extend(true, this , opts);

        if(data) {
            this._data = parse2MatrixData(data);
        };

        this.dataFrame = this.initData( this._data );

        this.plugs = [];
        this.clean();
        this.canvax.domView.innerHTML = "";

        //padding数据也要重置为起始值
        this.padding = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        };
        this._init && this._init(this._node, this._data, this._opts);
        this.draw();

        if( opts.waterMark ){
            //添加水印的临时解决方案
            setTimeout( function(){
                me._initWaterMark( opts.waterMark );
            } , 50);
        };
    }


    /*
     * 只响应数据的变化，不涉及配置变化
     */
    resetData(data , e)
    {
        this._data = parse2MatrixData( data );
        this.dataFrame = this.initData( this._data );
        if( e ){
            //e一般是触发这个data reset的一些场景数据，比如如果是 datazoom触发的， 就会有 trigger数据{ name:'datazoom', left:1,right:1 }
            _.extend( this.dataFrame, e );
        };
        this._resetData && this._resetData( e );
        this.fire("resetData");
    }

    _rotate(angle)
    {
        var currW = this.width;
        var currH = this.height;
        this.width = currH;
        this.height = currW;

        var self = this;
        _.each(self.stage.children, function(sprite) {
            sprite.context.rotation = angle || -90;
            sprite.context.x = (currW - currH) / 2;
            sprite.context.y = (currH - currW) / 2;
            sprite.context.rotateOrigin.x = self.width * sprite.context.$model.scaleX / 2;
            sprite.context.rotateOrigin.y = self.height * sprite.context.$model.scaleY / 2;
        });
    }

    //默认每个chart都要内部实现一个_initData
    _initData(data)
    {
        return data;
    }


    //插件管理相关代码begin
    initPlugsModules( opt )
    {

    }

    //所有plug触发更新
    plugsReset(opt , e)
    {

    }

    drawPlugs()
    {
        /*
        do {
            var p = this.plugs.shift();
            p && p.plug && p.plug.draw && p.plug.draw();
        } while ( this.plugs.length > 0 ); 
        */
        for( var i=0,l=this.plugs.length; i<l; i++ ){
            var p = this.plugs[i];
            p.plug && p.plug.draw && p.plug.draw();
            if( p.type == "once" ){
                this.plugs.splice( i, 1 );
                i--;
            }

            //p.plug.draw() 可能有新的plug被push进来
            l=this.plugs.length;
        }
    }

    //插件相关代码end

    //添加水印
    _initWaterMark( waterMarkOpt )
    {
        var text = waterMarkOpt.content || "waterMark";
        var sp = new Canvax.Display.Sprite({
            id : "watermark"
        });
        var textEl = new Canvax.Display.Text( text , {
            context: {
                fontSize: waterMarkOpt.fontSize || 20,
                strokeStyle : waterMarkOpt.strokeStyle || "#ccc",
                lineWidth : waterMarkOpt.lineWidth || 2
            }
        });

        var textW = textEl.getTextWidth();
        var textH = textEl.getTextHeight();

        var rowCount = parseInt(this.height / (textH*5)) +1;
        var coluCount = parseInt(this.width / (textW*1.5)) +1;

        for( var r=0; r< rowCount; r++){
            for( var c=0; c< coluCount; c++){
                //TODO:text 的 clone有问题
                //var cloneText = textEl.clone();
                var _textEl = new Canvax.Display.Text( text , {
                    context: {
                        rotation : 45,
                        fontSize: waterMarkOpt.fontSize || 25,
                        strokeStyle : waterMarkOpt.strokeStyle || "#ccc",
                        lineWidth : waterMarkOpt.lineWidth || 0,
                        fillStyle : waterMarkOpt.fillStyle || "#ccc",
                        globalAlpha: waterMarkOpt.globalAlpha || 0.1
                    }
                });
                _textEl.context.x = textW*1.5*c + textW*.25;
                _textEl.context.y = textH*5*r ;
                sp.addChild( _textEl );
            }
        }

        this.stage.addChild( sp );
    }

}