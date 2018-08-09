define(
    "chartx/chart/original/thermometer/graphs",
    [
        "canvax/index",
        "canvax/shape/Rect",
        "canvax/display/Text",
        "canvax/animation/Tween",
        "chartx/utils/tools"
    ],
    function(Canvax , Rect , Text , Tween , Tools ){
 
        var Graphs = function(opt,domRoot){

            this.domRoot = domRoot;
            this.w = 0;
            this.h = 0;

            this.org  = []                                 //原始数据(比例集合 | 实际数据集合) 

            this.data = []                                 //实际数据集合 如果一开始传入比例集合 那么会经过_counts得到实际数据

            this.turn = []                                 //记录文字坐标等信息的集合

            this.fillStyle = ['#0098d8','#ff633d','#7867b4','#f4c646' ]

            this.back = {
                fillStyle : ['#f3f3f5','#f3f3f5','#f3f3f5','#f3f3f5','#f3f3f5']
            }
            
            this.textData = []                             //文字集合

            this.text = {
                enabled   : true,
                format    : null,
                x         : 0,
                y         : 0,
                content   : '',
                fillStyle : '',
                fontSize  : 15,
                textAlign : 'center',
            };
            this.icon = {
                enabled : true,
                content : function(){}
            };

            this.disX      = 0                             //左右预留总距离
            this.disY      = 0                             //上下预留总距离
            this.items     = 0                             //有几个温度计
            this.itemDis   = 0                             //温度计之间的距离
            this.itemW     = 0                             //每个温度计的宽
            this.itemMaxW  = 50                            //每个温度计的最大宽
            this.itemTotal = 20                            //每个温度计的总刻度

            this.sDisXAndItemW   = 1                     //温度计之间的距离 几乎是温度计本身宽度的 80%
            this.sDisYAndSingleH = 0.5                     //温度计总高 / 温度计总刻度 * 50% = 每个温度计刻度高 ( 0 - 1) 值越高越粗

            this.sprite = null ;
    
            _.deepExtend(this , opt);

            this.init();
        };
    
        Graphs.prototype = {
            init : function(opt){
                _.deepExtend(this , opt);
                this.sprite = new Canvax.Display.Sprite({ id : "graphsEl" });
            },
            setX:function($n){
                this.sprite.context.x = $n
            },
            setY:function($n){
                this.sprite.context.y = $n
            },
            draw : function(opt){
                var me    = this;
                _.deepExtend(me , opt);

                me.org = me.data

                if(me.data.length > 0 && _.isArray(me.data[0])){     //如果是直接数据传入

                } else {                                               //如果传入的是比例集合
                    var o = me._counts()
                    me.disX = o.disX, me.disY = o.disY
                    me.data = o.data
                    me.turn = o.turn
                }

                me.sprite.context.x = me.pos.x + parseInt(me.disX / 2)
                me.sprite.context.y = me.pos.y + parseInt(me.disY / 2)

                _.each(me.data , function(o, i){                     //画多个温度计
                    var item = new Canvax.Display.Sprite({ id : 'item_' + i});
                    me.sprite.addChild(item)

                    var text = me._getText(i)

                    me._add({
                        domRoot: me.domRoot,
                        data   : o,
                        index  : i,
                        sprite : item,
                        text   : text,
                        icon   : me._getIcon(i),
                        pos    : {x:(me.itemW + me.itemDis) * i, y:0}
                    })
                })

                me._grow();
            },

            _counts:function(){                            //将多个比例集合实际对象集合
                var me = this
                var data = [], turn = []

                me.items = me.data.length

                //温度计之间的距离 几乎是温度计本身宽度的 80%
                me.itemW = parseInt(me.w / (me.items + (me.items - 1) * me.sDisXAndItemW ))

                me.itemW = Math.min(me.itemW, me.itemMaxW)
                
                me.itemDis = parseInt((me.w - (me.itemW * me.items)) / (me.items - 1))
                if(isNaN(me.itemDis))
                    me.itemDis = 0

                //左右两端预留距离
                var disY = 0
                var disX = this.w - (me.itemDis * (me.items - 1) + me.items * me.itemW)

                _.each(me.data, function(n, i){
                    var o = me._count({
                        index : i,
                        w     : me.itemW,
                        h     : me.h,
                        scale : me.data[i],
                        itemTotal : me.itemTotal
                    }) 

                    disY = o.disY
                    data.push(o.data)
                    turn.push(o.turn)
                })
                return {data:data, disX:disX, disY:disY, turn:turn}
            },
            _count:function($o){                           //换算单个比例到实际对象
                var index = $o.index
                var w     = $o.w
                var h     = $o.h
                var scale = $o.scale
                var itemTotal = $o.itemTotal

                var itemTurn = Math.ceil(scale / (100 / itemTotal))
 
                //单条高
                var singleH  = parseInt(h / itemTotal * this.sDisYAndSingleH)        
                //单条之间距离
                var signleDisY = parseInt((h - (singleH * itemTotal)) / (itemTotal - 1))
                //上下两端预留距离
                var disY = h - ((singleH * itemTotal) + (signleDisY * (itemTotal - 1)))
                
                var tmpData = [], initTurnY = 0, isTurn = false

                for(var a = 0, al = itemTotal; a < al; a++){

                    var fillStyle = this.back.fillStyle[index]
                    if(a >= (itemTotal - itemTurn)){
                        fillStyle = this.fillStyle[index]
                        if(!isTurn){
                            isTurn = true
                            initTurnY = a * (singleH + signleDisY)
                        }
                    }

                    var o = {
                        x         : 0,
                        y         : a * (singleH + signleDisY),
                        width     : w,
                        height    : singleH,
                        fillStyle : fillStyle,
                        backStyle : this.back.fillStyle[index]
                    }
                    tmpData.push(o)
                }
                return {data:tmpData, disY:disY, turn:{initY:initTurnY}}
            },

            _getText:function($index){
                var me = this
                var index = $index

                var text = me.textData[$index]
                if(_.isObject(text)){
                    return text
                }else{
                    text = _.clone(this.text)
                    text.x = parseInt(me.itemW / 2),  text.y = me.turn[index].initY
                    text.content = me.org[index] 
                    text.fillStyle = me.fillStyle[index]
                }
                return text
            },
            _getIcon:function($index){
                var me = this
                var index = $index
                var icon  = _.clone( me.icon );
                // icon.right  = me.w - (me.itemW + me.itemDis) * $index + 5,
                // icon.right  = me.w - (me.pos.x + parseInt(me.disX / 2) + (me.itemW + me.itemDis) * $index) + me.itemW
                icon.right = me.w - parseInt(me.disX / 2) - ((me.itemW + me.itemDis) * $index) + 3
                icon.fillStyle = me.fillStyle[index];
                icon.content   = me.icon.content( {
                    value  : me.org[index],
                    fillStyle : icon.fillStyle,
                    index  : index
                } );
                return icon; 
            },
            _grow : function(){
                var me  = this;
                var preCount = 0;
                _.each( this.sprite.children , function( group , i ){
                    var childLen = group.children.length - 1;
                    var activeLen = 0;
                    _.each( group.children , function( c ){
                        if( c.active ){
                            activeLen ++;
                        }
                    } );

                    var timer   = null;
                    var currInd = 0;
                                   
                    setTimeout(function(){
                        timer = setInterval(function(){
                            currInd ++;
                            if( currInd > activeLen ){
                                clearInterval(timer);
                                return
                            };
                            var index = Math.round( childLen - currInd );
                            var rect  = group.getChildAt( index );
                            rect.context.fillStyle = rect.fillStyle;
                        } , 30);
                    } , preCount*30 );

                    preCount += activeLen;


                } );
            },
            _add : function($o){                           //单个温度计
                //var me      = this
                var data    = $o.data
                var index   = $o.index
                var sprite  = $o.sprite 
                var text    = $o.text
                var pos     = $o.pos
                var icon    = $o.icon
                var domRoot = $o.domRoot

                _.each(data , function(o, i){              //矩形
                    var rect = new Rect({
                        id      : i,
                        context : {
                            x           : o.x || 0,
                            y           : o.y || 0,
                            width       : o.width  || 100,
                            height      : o.height || 20,
                            fillStyle   : o.backStyle,//o.fillStyle || '#7471b0',
                            radius      : o.radius || [o.height / 2, o.height / 2]
                        }
                    });
                    if( o.fillStyle != o.backStyle ){
                        rect.active = true;
                        rect.fillStyle = o.fillStyle;
                    }   
                    sprite.addChild(rect)
                });

                if(text.enabled){
                    var content = text.content
                    if( _.isFunction(text.format) ){
                        content = text.format({index:index, content:content});
                    } else {
                        content += "%"
                    }
                    var txt = new Text( content ,
                       {
                        context : {
                            fillStyle    : text.fillStyle,
                            fontSize     : text.fontSize,
                            textAlign    : text.textAlign
                       }
                    });

                    txt.context.x = text.x, txt.context.y = parseInt(text.y - txt.getTextHeight())

                    // if(text.y - txt.getTextHeight() / 2 < 4){
                        // txt.context.globalAlpha = 0
                    // }
            
                    sprite.addChild(txt)
                };

                if(icon.enabled){
                    var domel = document.createElement("div");
                    domel.style.cssText=";position:absolute;bottom:0;px;right:"+icon.right+"px;";
                    if(icon.content){
                        domel.innerHTML = icon.content;
                    }
                    domRoot.appendChild(domel);
                };

                sprite.context.x = pos.x;
                sprite.context.y = pos.y;
            }
        }; 
    
        return Graphs;
    } 
)
