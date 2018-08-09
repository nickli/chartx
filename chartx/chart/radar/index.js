define(
    "chartx/chart/radar/index",
    [
        'chartx/chart/index',
        'chartx/utils/tools',
        './xaxis',
        'chartx/components/yaxis/yAxis',
        './back',
        './graphs',
        'canvax/geom/HitTestPoint',
        'chartx/utils/dataformat'
    ],
    function( Chart , Tools ,  xAxis, yAxis, Back, Graphs , HitTestPoint ,dataFormat){
        /*
         *@node chart在dom里的目标容器节点。
        */
        var Canvax = Chart.Canvax;
    
        return Chart.extend( {
    
            init:function(node , data , opts){
                this.r             = 0; 
    
                this._xAxis        = null;
                this._yAxis        = null;
                this._back         = null;
                this._graphs       = null;

                this._labelH       = 20; //预留给label的height
                
                _.deepExtend( this , opts );
                this.dataFrame = this._initData( data , this );
            },
            _initData : dataFormat,
            _getR : function(){
                var minWorH = Math.min( 
                    this.width - this.padding.left - this.padding.right,
                    this.height - this.padding.top - this.padding.bottom
                );
                if( !this.r ) {
                    this.r = minWorH / 2
                };
                if( this.r > minWorH / 2 ){
                     this.r = minWorH / 2
                };
                this.r -= this._labelH;
            },
            draw:function(){
                this.stageBg       = new Canvax.Display.Sprite({
                    id        : 'bg'
                });
                this.stageCore     = new Canvax.Display.Sprite({
                    id        : 'graph'
                });
    
                this.stage.addChild(this.stageBg);
                this.stage.addChild(this.stageCore);
    
                //计算一下半径
                this._getR();
    
                //初始化模块
                this._initModule( this , this.dataFrame );                        
    
                //开始绘图
                this._startDraw();
    
                //绘制结束，添加到舞台
                this._drawEnd();                           
    
                var me = this;

                this.stage.on("mouseover panstart" , function(e){
                    me._graphs.angOver( e , me._getCurrAng(e) );
                });
                this.stage.on("mousemove panmove" , function(e){
                    me._graphs.angMove( e , me._getCurrAng(e) );
                });
                this.stage.on("mouseout",function(e){
                    
                    //找到最外围的那个
                    var lastIsogon = me._back.sprite.getChildById("isogon_" + (me._yAxis.dataSection.length-1));
                    var origPoint  = me._getPointBack(e);
                    if( !lastIsogon || !HitTestPoint.isInside( lastIsogon , origPoint )){
                        me._graphs.angOut( );
                    }
                });
                this.stage.on("click tap" , function(e){
                    
                    e.eventInfo = {
                        field : _.isArray(me.yAxis.field) ? me.yAxis.field[e.groupInd] : me.yAxis.field
                    };
                    var itemInd = me._getCurrAng(e);

                    if( e.eventInfo.field ){
                        e.eventInfo.role = {
                            name : me._xAxis.dataSection[ itemInd ],
                            value: me._yAxis.dataOrg[e.groupInd][itemInd]
                        };
                    } else {
                        e.eventInfo.role = null
                    }
                    me._graphs.angOver(e , me._getCurrAng(e));
                    me.fire("click tap" , e);
                });

                this.inited = true;
            },
            _getCurrAng   : function(e){
                var origPoint = this._getPointBack(e);
    
                //该point对应的角度
                var angle = Math.atan2( origPoint.y , origPoint.x ) * 180 / Math.PI;
    
                //目前当前的r是 从-PI 到PI 的 值，所以转换过来的页是180 到 -180的范围值。
                //需要转换到0-360度
                //另外因为蜘蛛网的起始角度为-90度，所以还要+90 来把角度转换到对应的范围里面
                var itemAng = 360 / this._xAxis.dataSection.length;
    
                angle = ( 360 + angle + 90 + itemAng/2 ) % 360;
    
                var ind = parseInt(angle / itemAng);

                return ind;

            },
            _getPointBack : function(e){
                //先把point转换到_back的坐标系内
                //可能e.target会是 来自_graph的 polygon，
                //所以再这里把所有的point都转换到back上面。。。。。
                //方便得到该point所在的整个雷达上面的位置(角度，弧度)
                var origPoint  = this._back.sprite.globalToLocal( e.target.localToGlobal( e.point , this.sprite ) );
                origPoint.x   -= this.r;
                origPoint.y   -= this.r;
                return origPoint;
            },
            _initModule:function(opt , data){
                this._xAxis  = new xAxis(opt.xAxis , data.xAxis);
                this._yAxis  = new yAxis(opt.yAxis , data.yAxis);
                this._back   = new Back( opt.back );
                this._graphs = new Graphs( opt.graphs , opt.tips , this.canvax.getDomContainer());
            },
            _startDraw : function(){
                
                var r = this.r;
                var backAndGraphsOpt = {
                    r    : r,
                    yDataSection : this._yAxis.dataSection,
                    xDataSection : this._xAxis.dataSection
                };
                
                //绘制背景网格
                this._back.draw( backAndGraphsOpt );
            
                var backSpc = this._back.sprite.context;

                var backX   = ( this.width  - backSpc.width ) / 2;
                var backY   = this.padding.top + this._labelH;//( this.height - backSpc.height ) / 2;
    
                this._back.setPosition(backX , backY);
    
                //绘制雷达图形区域
                this._graphs.draw( this._yAxis.dataOrg , backAndGraphsOpt );
                this._graphs.setPosition(backX , backY);
    
                //绘制xAxis标注
                this._xAxis.draw({
                    r : r
                });
                this._xAxis.setPosition(backX , backY);
            },
            _drawEnd:function(){
                this.stageBg.addChild(this._back.sprite);
                this.stageCore.addChild(this._xAxis.sprite);
                this.stageCore.addChild(this._graphs.sprite);
            }
        });
        
    } 
);
