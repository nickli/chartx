define("chartx/chart/bar/3d/graphs",["canvax/index","canvax/shape/Rect","chartx/utils/tools","chartx/chart/theme","canvax/animation/AnimationFrame","canvax/shape/BrokenLine","canvax/shape/Shapes","chartx/utils/math3d/vec3","chartx/utils/colorformat","canvax/animation/AnimationFrame"],function(a,b,c,d,e,f,g,i,j,e){var k=function(a){var b=a.graphs;this.root=a,this.data=[],this.w=0,this.h=0,this.depth=50,this._yAxisFieldsMap={},this._setyAxisFieldsMap(),this.animation=!0,this.pos={x:0,y:0},this._colors=d.colors,this.bar={width:0,_width:0,radius:4},this.text={enabled:!1,fillStyle:"#999",fontSize:12,format:null,lineWidth:1,strokeStyle:"white"},this.average={enabled:!1,field:"average",fieldInd:-1,fillStyle:"#c4c9d6",data:null},this.checked={enabled:!1,fillStyle:"#00A8E6",strokeStyle:"#00A8E6",globalAlpha:.1,lineWidth:2},this.sort=null,this._barsLen=0,this.eventEnabled=!0,this.sprite=null,this.txtsSp=null,this.checkedSp=null,this.yDataSectionLen=0,this.globalAlpha=1,_.deepExtend(this,b),this._initaverage(),this.init()};return k.prototype={init:function(){this.sprite=new a.Display.Sprite({id:"graphsEl"}),this.barsSp=new a.Display.Sprite({id:"barsSp"}),this.txtsSp=new a.Display.Sprite({id:"txtsSp",context:{}}),this.checkedSp=new a.Display.Sprite({id:"checkedSp"})},setX:function(a){this.sprite.context.x=a},setY:function(a){this.sprite.context.y=a},getInfo:function(a){return this._getInfoHandler({iGroup:a})},_checked:function(a){var c=this,d=a.iNode,e=c.barsSp.getChildById("barGroup_"+d);if(e){c.checkedSp.removeChildById("line_"+d),c.checkedSp.removeChildById("rect_"+d);var g=e.getChildAt(0),h=g.context.x,i=g.context.x+g.context.width,j=-c.h;if(a.checked){var k=new b({id:"rect_"+d,pointChkPriority:!1,context:{x:h,y:j,width:g.context.width,height:g.context.height,fillStyle:c.checked.fillStyle,globalAlpha:c.checked.globalAlpha}});c.checkedSp.addChild(k);var l=new f({id:"line_"+d,context:{pointList:[[h,j],[i,j]],strokeStyle:c.checked.strokeStyle,lineWidth:c.checked.lineWidth}});c.checkedSp.addChild(l)}}},removeAllChecked:function(){var a=this;a.checkedSp.removeAllChildren()},setBarStyle:function(a){for(var b=this,c=a.iNode,d=b.barsSp.getChildById("barGroup_"+c),e=a.fillStyle||b._getColor(b.bar.fillStyle),f=0,g=d.getNumChildren();g>f;f++){var h=d.getChildAt(f);h.context.fillStyle=e}},_setyAxisFieldsMap:function(){var a=this;_.each(_.flatten(this.root.dataFrame.yAxis.field),function(b,c){a._yAxisFieldsMap[b]={index:c}})},_initaverage:function(){this.average.enabled&&_.each(this.root.dataFraem,function(a,b){a.field==this.average.field&&(this.average.fieldInd=b)})},_getColor:function(a,b,c,d,e,f,g,h){var i=null;return _.isString(a)&&(i=a),_.isArray(a)&&(i=_.flatten(a)[this._yAxisFieldsMap[h].index]),_.isFunction(a)&&(i=a.apply(this,[{iGroup:d,iNode:e,iLay:f,field:h,value:g,xAxis:{field:this.root._xAxis.field,value:this.root._xAxis.data[e].content}}])),i&&""!=i||(i=this._colors[this._yAxisFieldsMap[h].index]),i},_getFieldFromIHV:function(a,b,c){var d=this.root._yAxis.field,e=null;return _.isString(d[a])?e=d[a]:_.isArray(d[a])&&(e=d[a][c]),e},checkBarW:function(a,b){this.bar.width?_.isFunction(this.bar.width)?this.bar._width=this.bar.width(a):this.bar._width=this.bar.width:(this.bar._width=parseInt(b)-parseInt(Math.max(1,.3*b)),1==this.bar._width&&a>3&&(this.bar._width=parseInt(a)-2)),this.bar._width<1&&(this.bar._width=1)},resetData:function(a,b){this._setyAxisFieldsMap(),this.draw(a.data,b)},draw:function(d,e){if(_.deepExtend(this,e),0!=d.length){var f=0;this.data[0]&&(f=this.data[0][0].length),this.data=d;var g=this,i=d.length,j=0;_.each(d,function(b,d){var e=b.length;if(0!=e){var k=b[0].length;for(j=g.w/k,g._barsLen=k*i,h=0;h<k;h++){var l;if(0==d){if(h<=f-1?l=g.barsSp.getChildById("barGroup_"+h):(l=g.barsSp.getChildById("barGroup_"+h)||new a.Display.Sprite({id:"barGroup_"+h}),g.barsSp.addChild(l),l.iNode=h,l.on("click dblclick mousedown mousemove mouseup",function(a){a.eventInfo||(a.eventInfo=g._getInfoHandler(this))})),g.eventEnabled){var m,n=j*h,o=n+j,p=g.sort&&"desc"==g.sort?0:-g.h,q=p+g.h,r=g.root._back._depth;m=l.getChildById("bhr_polygon_"+h)||new a.Display.Sprite({id:"bhr_polygon_"+h}),g.drawHoverCube(m,n,o,p,q,r),l.addChild(m),m.iGroup=-1,m.iNode=h,m.iLay=-1,m.on("panstart mouseover mousemove mouseout click",function(a){a.eventInfo=g._getInfoHandler(this,a)})}}else l=g.barsSp.getChildById("barGroup_"+h);var s;for(0==d?h<=f-1?s=g.txtsSp.getChildById("txtGroup_"+h):(s=g.txtsSp.getChildById("txtGroup_"+h)||new a.Display.Sprite({id:"txtGroup_"+h}),g.txtsSp.addChild(s),s.iGroup=d):s=g.txtsSp.getChildById("txtGroup_"+h),v=0;v<e;v++){var t=b[v][h];t.iGroup=d,t.iNode=h,t.iLay=v;var u=parseInt(Math.abs(t.y));v>0&&(u-=parseInt(Math.abs(b[v-1][h].y)));var w=parseInt(t.y),x=g._getColor(g.bar.fillStyle,i,e,d,h,v,t.value,t.field);if(0==h){var y=g._yAxisFieldsMap[g._getFieldFromIHV(d,h,v)];y.fillStyle||(y.fillStyle=x)}t.fillStyle=x;var z={x:Math.round(t.x-g.bar._width/2),y:w,width:parseInt(g.bar._width),height:u,fillStyle:x,scaleY:1},A={x:z.x,y:0,width:z.width,height:0,fillStyle:z.fillStyle,scaleY:0};if(g.bar.radius&&v==e-1){var B=Math.min(g.bar._width/2,u);B=Math.min(B,g.bar.radius),A.radius=[B,B,0,0]}g.animation||(delete A.scaleY,A.y=z.y,A.height=z.height);var C=l.getChildById("bar_"+d+"_"+h+"_"+v)||new a.Display.Sprite({id:"bar_"+d+"_"+h+"_"+v});if(g.drawCube(C,A),l.addChild(C),C.finalPos=z,C.iGroup=d,C.iNode=h,C.iLay=v,g.eventEnabled&&C.on("panstart mouseover mousemove mouseout click dblclick",function(a){a.eventInfo=g._getInfoHandler(this,a),"mouseover"==a.type&&(this.parent.getChildById("bhr_"+this.iNode).context.globalAlpha=.1),"mouseout"==a.type&&(this.parent.getChildById("bhr_"+this.iNode).context.globalAlpha=0)}),v==e-1&&g.text.enabled){var D,E=[t];if(h<=f-1?D=s.getChildById("infosp_"+d+"_"+h):(D=s.getChildById("infosp_"+d+"_"+h)||new a.Display.Sprite({id:"infosp_"+d+"_"+h,context:{visible:!1}}),D._hGroup=h,s.addChild(D)),D.noSkip=!0,e>1)for(var F=e-2;F>=0;F--)E.unshift(b[F][h]);var G=0,H=0;_.each(E,function(b,i){var j=b.value;!g.animation&&_.isFunction(g.text.format)&&(j=g.text.format(b.value)),!g.animation&&_.isNumber(j)&&(j=c.numAddSymbol(j));var k;h<=f-1?k=D.getChildById("info_txt_"+d+"_"+h+"_"+i):(k=new a.Display.Text(j,{id:"info_txt_"+d+"_"+h+"_"+i,context:{x:G+2,fillStyle:b.fillStyle,fontSize:g.text.fontSize,lineWidth:g.text.lineWidth,strokeStyle:g.text.strokeStyle}}),k.z=.5*-g.depth,D.addChild(k)),k._text=j,G+=k.getTextWidth()+2,H=Math.max(H,k.getTextHeight()),g.animation&&k.resetText(0),e-2>=i&&(k=new a.Display.Text("/",{context:{x:G+2,fillStyle:"#999"}}),k.z=.5*-g.depth,G+=k.getTextWidth()+2,D.addChild(k))}),D._finalX=t.x-G/2,D._finalY=z.y-H,D._centerX=t.x,D.context.width=G,D.context.height=H,D.context.x=t.x-G/2,g.animation||(D.context.y=z.y-H-15,D.context.visible=!0)}}}}}),this.sprite.addChild(this.barsSp),this.sprite.addChild(this.checkedSp),this.text.enabled&&this.sprite.addChild(this.txtsSp),this.average.enabled&&this.average.data&&(!this.averageSp&&(this.averageSp=new a.Display.Sprite({id:"averageSp"})),_.each(this.average.layoutData,function(a,c){var d,e={x:j*c,y:a.y,fillStyle:g.average.fillStyle,width:j,height:2};f-1>=c?(d=g.averageSp.getChildById("average_"+c),d.context.x=e.x,d.context.y=e.y,d.context.width=e.width):(d=new b({id:"average_"+c,context:e}),g.averageSp.addChild(d))}),this.sprite.addChild(g.averageSp)),this.sprite.context.x=this.pos.x,this.sprite.context.y=this.pos.y,this.sort&&"desc"==this.sort&&(this.sprite.context.y-=this.h)}},_updateInfoTextPos:function(a,b){if("horizontal"!=this.root.type){var c=0,d=0,e=a.children.length;_.each(a.children,function(a,b){a.getTextWidth&&(a.context.x=c,c+=a.getTextWidth()+(e>b?2:0),d=Math.max(d,a.getTextHeight()))}),a.context.width=c,a.context.height=d,0===b&&this.root._to3d(a)}},grow:function(a,b){var d=this;if(!this.animation)return void(a&&a(d));var f=1;if(this.sort&&"desc"==this.sort&&(f=-1),d.data[0]&&d.barsSp.children.length>d.data[0][0].length)for(var g=d.data[0][0].length,i=d.barsSp.children.length;i>g;g++)d.barsSp.getChildAt(g).destroy(),d.text.enabled&&d.txtsSp.getChildAt(g).destroy(),d.averageSp&&d.averageSp.getChildAt(g).destroy(),g--,i--;var j=_.extend({delay:Math.min(1e3/this._barsLen,200),easing:"Back.Out",duration:500},b);_.each(d.data,function(a,b){var g=a.length;if(0!=g){var i=a[0].length;for(h=0;h<i;h++){for(v=0;v<g;v++){var k=d.barsSp.getChildById("barGroup_"+h),l=k.getChildById("bar_"+b+"_"+h+"_"+v);if(0==j.duration)l.context.scaleY=f,l.context.y=f*f*l.finalPos.y,l.context.x=l.finalPos.x,l.context.width=l.finalPos.width,l.context.height=l.finalPos.height;else{l._tweenObj&&e.destroyTween(l._tweenObj);var m={from:{y:0,height:0},to:{y:l.finalPos.y,height:l.finalPos.height},onUpdate:function(a,b){var c=a;return function(a){b.drawCube(c,{x:c.finalPos.x,y:this.y,width:c.finalPos.width,height:this.height}),b.root._to3d(c)}}(l,d),onComplete:function(){},id:l.id,duration:j.duration,easing:j.easing,delay:h*j.delay};l._tweenObj=e.registTween(m)}}if(d.text.enabled){var n=d.txtsSp.getChildById("txtGroup_"+h),o=n.getChildById("infosp_"+b+"_"+h);"horizontal"==d.root.type&&(o.context.x=o._finalX),o.animate({y:o._finalY-15,x:o._finalX},{duration:j.duration,easing:j.easing,delay:h*j.delay,onUpdate:function(){this.context.visible=!0},onComplete:function(){}}),_.each(o.children,function(a,b){a._text&&(a._tweenObj&&e.destroyTween(a._tweenObj),a._tweenObj=e.registTween({from:{v:a.text},to:{v:a._text},duration:j.duration,delay:h*j.delay,onUpdate:function(a,b){return function(){var e=this.v;_.isFunction(d.text.format)?e=d.text.format(e):_.isNumber(e)&&(e=c.numAddSymbol(parseInt(e))),a.resetText(e),a.parent?d._updateInfoTextPos(a.parent,b):a.destroy()}}(a,b)}))})}}}}),window.setTimeout(function(){a&&a(d)},300*(this.barsSp.children.length-1))},_getInfoHandler:function(a){var b={iGroup:a.iGroup,iNode:a.iNode,iLay:a.iLay,nodesInfoList:this._getNodeInfo(a.iGroup,a.iNode,a.iLay)};return b},_getNodeInfo:function(a,b,c){var d=[],e=this,f=e.data.length;return void 0==a&&(a=-1),void 0==b&&(b=0),void 0==c&&(c=-1),_.each(e.data,function(g,i){var j,k=g.length;if(0!=k){var l=g[0].length;for(h=0;h<l;h++)if(h==b)for(v=0;v<k;v++)a!=i&&-1!=a||c!=v&&-1!=c||(j=g[v][h],j.fillStyle=e._getColor(e.bar.fillStyle,f,k,i,h,v,j.value,j.field),d.push(j))}}),d},drawHoverCube:function(a,b,c,d,e,f){var g=this,h=null,i="#ccc",j="#ccc",k="#ccc",l=.3,m=g.root.drawFace,n=[[b,d,0],[b,d,f],[b,e,f],[b,e,0]],o=m("bhr_polygon_left",n,k,h,0,a),n=[[b,d,0],[c,d,0],[c,e,0],[b,e,0]],p=m("bhr_polygon_front",n,i,h,0,a),n=[[c,d,0],[c,d,f],[c,e,f],[c,e,0]],q=m("bhr_polygon_right",n,k,h,0,a),n=[[b,d,0],[c,d,0],[c,d,f],[b,d,f]],r=m("bhr_polygon_top",n,j,h,0,a),s=function(a){o.context.globalAlpha=l,p.context.globalAlpha=l,q.context.globalAlpha=l,r.context.globalAlpha=l},t=function(a){o.context.globalAlpha=0,p.context.globalAlpha=0,q.context.globalAlpha=0,r.context.globalAlpha=0};p.hover(s,t),a.addChild(o),a.addChild(p),a.addChild(q),a.addChild(r)},drawCube:function(a,b){var c=this,d=b.x,e=d+b.width,f=b.y,g=f+b.height,h=-1*c.depth,i=b.fillStyle,k=b.fillStyle,l=j.colorBrightness(b.fillStyle,.2),m=j.colorBrightness(b.fillStyle,-.2),n=c.root.drawFace,o=c.globalAlpha,p=[[d,f,0],[d,f,h],[d,g,h],[d,g,0]],q=n("polygon_left",p,m,i,o,a),p=[[d,f,0],[e,f,0],[e,g,0],[d,g,0]],r=n("polygon_front",p,k,i,o,a),p=[[e,f,0],[e,f,h],[e,g,h],[e,g,0]],s=n("polygon_right",p,m,i,o,a),p=[[d,f,0],[e,f,0],[e,f,h],[d,f,h]],t=n("polygon_top",p,l,i,o,a);a.addChild(q),a.addChild(r),a.addChild(s),a.addChild(t)}},k});