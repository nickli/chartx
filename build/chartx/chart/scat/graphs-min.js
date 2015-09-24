define("chartx/chart/scat/graphs",["canvax/index","canvax/shape/Circle","canvax/shape/Rect","canvax/animation/Tween"],function(a,b,c,d){var e=function(a,b){this.zAxis=b.zAxis,this.xAxis=b.xAxis,this.yAxis=b.yAxis,this.dataFrame=b,this.label=[],this.w=0,this.h=0,this.pos={x:0,y:0},this.circle={maxR:20,minR:3,r:null,normalR:10,fillStyle:function(){}},this._colors=["#6f8cb2","#c77029","#f15f60","#ecb44f","#ae833a","#896149"],this.sprite=null,this._circles=[],_.deepExtend(this,a),this.init()};return e.prototype={init:function(){this.sprite=new a.Display.Sprite({id:"graphsEl"})},setX:function(a){this.sprite.context.x=a},setY:function(a){this.sprite.context.y=a},_getLabel:function(a,b){var c=this.label[a];if(c){var d=null;return _.each(this.dataFrame.data,function(a,e){a.field==c&&(d=a.data[b])}),d}},_getCircleNode:function(a,b,c){var d={iGroup:a,iNode:b,xAxis:{field:this.xAxis.field[a],value:this.xAxis.org[a][b]},yAxis:{field:this.yAxis.field[a],value:c},label:this._getLabel(a,b),zAxis:null};return this.zAxis.field[a]&&(d.zAxis={field:this.zAxis.field[a],value:this.zAxis.org[a][b]}),d},getCircleFillStyle:function(a,b,c,d){var e=this.circle.fillStyle;return _.isArray(e)&&(e=e[b]),_.isFunction(e)&&(e=e(d)),e&&""!=e||(e=this._colors[b]),e},getR:function(a){var b=this.circle.r;return _.isFunction(b)?b(a):b},draw:function(d,e){var f=this;if(_.deepExtend(this,e),0!=d.length){f.data=d,this.induce=new c({id:"induce",context:{y:-this.h,width:this.w,height:this.h,fillStyle:"#000000",globalAlpha:0,cursor:"pointer"}}),this.sprite.addChild(this.induce),this.induce.on("panstart mouseover",function(a){a.eventInfo=null}),this.induce.on("panmove mousemove",function(a){a.eventInfo=null});var g=d[0].length,h=1;this.zAxis.field&&this.zAxis.field.length>0&&(h=_.max(_.flatten(this.zAxis.org)));for(var i=0;g>i;i++){for(var j=new a.Display.Sprite,k=0,l=d.length;l>k;k++){var m=d[k][i],n=this.zAxis.org[k]&&this.zAxis.org[k][i],o=this.getR(m)||(n?Math.max(this.circle.maxR*(n/h),this.circle.minR):this.circle.normalR),p=this._getCircleNode(k,i,m.value),q=this.getCircleFillStyle(i,k,m.value,p);if(null!=m.value&&void 0!=m.value&&""!==m.value){var r=new b({hoverClone:!1,context:{x:m.x,y:m.y,fillStyle:q,r:o,globalAlpha:0,cursor:"pointer"}});if(j.addChild(r),r.iGroup=k,r.iNode=i,r.r=o,r.label=p.label,n&&(r.zAxis={field:this.zAxis.field,value:n,org:this.zAxis.org}),r.on("panstart mouseover",function(a){a.eventInfo=f._getInfoHandler(a),this.context.globalAlpha=.9,this.context.r++}),r.on("panmove mousemove",function(a){a.eventInfo=f._getInfoHandler(a)}),r.on("panend mouseout",function(a){a.eventInfo={},this.context.globalAlpha=.7,this.context.r--}),r.on("tap click",function(a){a.eventInfo=f._getInfoHandler(a)}),this._circles.push(r),p.label&&""!=p.label){var s=m.y-o;s+this.h<=20&&(s=-(this.h-20));var t=new a.Display.Text(p.label,{context:{x:m.x,y:s,fillStyle:q,textAlign:"center",textBaseline:"bottom"}});2*r.context.r>t.getTextWidth()&&(t.context.y=m.y,t.context.textBaseline="middle"),j.addChild(t)}}}this.sprite.addChild(j)}this.setX(this.pos.x),this.setY(this.pos.y)}},_getInfoHandler:function(a){var b=a.target,c={iGroup:b.iGroup,iNode:b.iNode,label:b.label,nodesInfoList:this._getNodeInfo(b.iGroup,b.iNode)};return c},_getNodeInfo:function(a,b){var c=[];return c.push(this.data[a][b]),c},grow:function(){function a(){c=requestAnimationFrame(a),d.update()}var b=this,c=null,e=function(){new d.Tween({h:0}).to({h:100},500).onUpdate(function(){for(var a=0,c=b._circles.length;c>a;a++){var d=b._circles[a];d.context.globalAlpha=this.h/100*.7,d.context.r=this.h/100*d.r}}).onComplete(function(){cancelAnimationFrame(c)}).start();a()};e()}},e});