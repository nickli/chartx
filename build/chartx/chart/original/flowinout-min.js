define("chartx/chart/original/flowinout",["chartx/chart/index","chartx/chart/original/flowinout/dataformat","chartx/chart/original/flowinout/layout","canvax/shape/Rect","canvax/shape/Path","chartx/components/tips/tip"],function(a,b,c,d,e,f){var g=a.Canvax;return a.extend({init:function(a,b,d){this.padding={top:10,right:10,bottom:10,left:10},this.graphs={w:this.width-this.padding.left-this.padding.right,h:this.height-this.padding.top-this.padding.bottom,node:{text:{format:function(a){},formatVal:function(a){return a},fillStyle:"white",fontSize:12,valFontSize:18}},edge:{}},_.deepExtend(this,d),this.layout=c(this._initData(b,d),this.graphs)},draw:function(){this._initModule(),this._widget(),this.inited=!0},_initModule:function(){this.edgeSprite=new g.Display.Sprite({id:"edgeSprite",context:{x:this.padding.left,y:this.padding.top}}),this.stage.addChild(this.edgeSprite),this.nodeSprite=new g.Display.Sprite({id:"nodeSprite",context:{x:this.padding.left,y:this.padding.top}}),this.stage.addChild(this.nodeSprite),this.txtSprite=new g.Display.Sprite({id:"txtSprite",context:{x:this.padding.left,y:this.padding.top}}),this.stage.addChild(this.txtSprite),this.stageTip=new g.Display.Sprite({id:"tip"}),this.stage.addChild(this.stageTip),this._tip=new f(this.tips,this.canvax.getDomContainer()),this._tip._getDefaultContent=this._getTipDefaultContent,this.stageTip.addChild(this._tip.sprite)},_getTipDefaultContent:function(a){var b=a.node,c=b.label||b.node;return c+"："+b.value},_initData:b,_widget:function(){var a=this;_.each(a.layout.nodes,function(b){if(0!=b.value){var c=new d({id:b.node,hoverClone:!1,context:{x:b.pos.x,y:b.pos.y,width:b.w,height:b.h,fillStyle:b.fillStyle,cursor:"pointer",radius:[2]}});c.node=b,c.hover(function(b){this.context.r++,a._setEventInfo(b,this),a._tip.show(b)},function(){this.context.r--,a._tip.hide()}),c.on("mousemove",function(b){a._setEventInfo(b,this),a._tip.move(b)}),c.on("click",function(b){b.node=this.node,a.fire("click",b)}),a.nodeSprite.addChild(c);var e=a.graphs.node.text,f=e.format(b.node)||b.label||b.node,h=new g.Display.Text(f,{context:{x:b.pos.x+10,y:b.pos.y+b.h/2,fillStyle:e.fillStyle,fontSize:e.fontSize,textAlign:"left",textBaseline:"middle"}});if(b.h>30){h.context.textBaseline="top",h.context.y=b.pos.y+3,h.context.fontSize=12;var i=new g.Display.Text(e.formatVal(b.value),{context:{x:b.pos.x+10,y:b.pos.y+Math.max(2*b.h/3,28),fillStyle:e.fillStyle,fontSize:e.valFontSize,textAlign:"left",textBaseline:"middle"}});a.txtSprite.addChild(i)}a.txtSprite.addChild(h)}}),_.each(a.layout.edges,function(b,c){if(b.from.value&&b.to.value){var d=new e({id:c,context:{path:b.path,fillStyle:b.to.fillStyle,globalAlpha:.3}});a.edgeSprite.addChild(d)}})},_setEventInfo:function(a,b){a.eventInfo={el:b,node:b.node}}})});