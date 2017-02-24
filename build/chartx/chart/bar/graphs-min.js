define("chartx/chart/bar/graphs",["canvax/index","canvax/shape/Rect","chartx/utils/tools","chartx/chart/theme","canvax/animation/AnimationFrame","canvax/shape/BrokenLine"],function(a,b,c,d,e,f){var g=function(a,b){this.data=[],this.w=0,this.h=0,this.root=b,this._yAxisFieldsMap={},this._setyAxisFieldsMap(),this.animation=!0,this.pos={x:0,y:0},this._colors=d.colors,this.bar={width:0,_width:0,radius:4,fillStyle:null,filter:function(){}},this.text={enabled:!1,fillStyle:"#999",fontSize:12,format:null,lineWidth:1,strokeStyle:"white"},this.average={enabled:!1,field:"average",fieldInd:-1,fillStyle:"#c4c9d6",data:null},this.checked={enabled:!1,fillStyle:"#00A8E6",strokeStyle:"#00A8E6",globalAlpha:.1,lineWidth:2},this.sort=null,this._barsLen=0,this.eventEnabled=!0,this.sprite=null,this.txtsSp=null,this.checkedSp=null,this.yDataSectionLen=0,_.deepExtend(this,a),this._initaverage(),this.init()};return g.prototype={init:function(){this.sprite=new a.Display.Sprite({id:"graphsEl"}),this.barsSp=new a.Display.Sprite({id:"barsSp"}),this.txtsSp=new a.Display.Sprite({id:"txtsSp",context:{}}),this.checkedSp=new a.Display.Sprite({id:"checkedSp"})},setX:function(a){this.sprite.context.x=a},setY:function(a){this.sprite.context.y=a},getInfo:function(a){return this._getInfoHandler({iGroup:a})},_checked:function(a){var c=this,d=a.iNode,e=c.barsSp.getChildById("barGroup_"+d);if(e){c.checkedSp.removeChildById("line_"+d),c.checkedSp.removeChildById("rect_"+d);var g=e.getChildAt(0),h=g.context.x,i=g.context.x+g.context.width,j=-c.h;if(a.checked){var k=new b({id:"rect_"+d,pointChkPriority:!1,context:{x:h,y:j,width:g.context.width,height:g.context.height,fillStyle:c.checked.fillStyle,globalAlpha:c.checked.globalAlpha}});c.checkedSp.addChild(k);var l=new f({id:"line_"+d,context:{pointList:[[h,j],[i,j]],strokeStyle:c.checked.strokeStyle,lineWidth:c.checked.lineWidth}});c.checkedSp.addChild(l)}}},removeAllChecked:function(){var a=this;a.checkedSp.removeAllChildren()},setBarStyle:function(a){for(var b=this,c=a.iNode,d=b.barsSp.getChildById("barGroup_"+c),e=a.fillStyle||b._getColor(b.bar.fillStyle),f=0,g=d.getNumChildren();g>f;f++){var h=d.getChildAt(f);h.context.fillStyle=e}},_setyAxisFieldsMap:function(){var a=this;_.each(_.flatten(this.root.dataFrame.yAxis.field),function(b,c){a._yAxisFieldsMap[b]={index:c}})},_initaverage:function(){this.average.enabled&&_.each(this.root.dataFraem,function(a,b){a.field==this.average.field&&(this.average.fieldInd=b)})},_getColor:function(a,b,c,d,e,f,g,h){var i=null;return _.isString(a)&&(i=a),_.isArray(a)&&(i=_.flatten(a)[this._yAxisFieldsMap[h].index]),_.isFunction(a)&&(i=a.apply(this,[{iGroup:d,iNode:e,iLay:f,field:h,value:g,xAxis:{field:this.root._xAxis.field,value:this.root._xAxis.data[e].content}}])),i&&""!=i||(i=this._colors[this._yAxisFieldsMap[h].index]),i},_getFieldFromIHV:function(a,b,c){var d=this.root._yAxis.field,e=null;return _.isString(d[a])?e=d[a]:_.isArray(d[a])&&(e=d[a][c]),e},checkBarW:function(a,b){this.bar.width?_.isFunction(this.bar.width)?this.bar._width=this.bar.width(a):this.bar._width=this.bar.width:(this.bar._width=parseInt(b)-parseInt(Math.max(1,.3*b)),1==this.bar._width&&a>3&&(this.bar._width=parseInt(a)-2)),this.bar._width<1&&(this.bar._width=1)},resetData:function(a,b){this.draw(a.data,b)},draw:function(d,e){if(_.deepExtend(this,e),0!=d.length){var f=0;this.data[0]&&(f=this.data[0][0].length),this.data=d;var g=this,i=d.length,j=0;_.each(d,function(d,e){var k=d.length;if(0!=k){var l=d[0].length;for(j=parseInt(g.w/l),g._barsLen=l*i,h=0;h<l;h++){var m;if(0==e){if(h<=f-1?m=g.barsSp.getChildById("barGroup_"+h):(m=new a.Display.Sprite({id:"barGroup_"+h}),g.barsSp.addChild(m),m.iNode=h,m.on("click dblclick mousedown mousemove mouseup",function(a){a.eventInfo||(a.eventInfo=g._getInfoHandler(this))})),g.eventEnabled){var n;h<=f-1?(n=m.getChildById("bhr_"+h),n.context.width=j,n.context.x=j*h):(n=new b({id:"bhr_"+h,pointChkPriority:!1,context:{x:j*h,y:g.sort&&"desc"==g.sort?0:-g.h,width:j,height:g.h,fillStyle:"#ccc",globalAlpha:0}}),m.addChild(n),n.hover(function(a){this.context.globalAlpha=.1},function(a){this.context.globalAlpha=0}),n.iGroup=-1,n.iNode=h,n.iLay=-1,n.on("panstart mouseover mousemove mouseout click",function(a){a.eventInfo=g._getInfoHandler(this,a)}))}}else m=g.barsSp.getChildById("barGroup_"+h);var o;for(0==e?h<=f-1?o=g.txtsSp.getChildById("txtGroup_"+h):(o=new a.Display.Sprite({id:"txtGroup_"+h}),g.txtsSp.addChild(o),o.iGroup=e):o=g.txtsSp.getChildById("txtGroup_"+h),v=0;v<k;v++){var p=d[v][h];p.iGroup=e,p.iNode=h,p.iLay=v;var q=parseInt(Math.abs(p.y));v>0&&(q-=parseInt(Math.abs(d[v-1][h].y)));var r=parseInt(p.y),s=g._getColor(g.bar.fillStyle,i,k,e,h,v,p.value,p.field);if(0==h){var t=g._yAxisFieldsMap[g._getFieldFromIHV(e,h,v)];t.fillStyle||(t.fillStyle=s)}p.fillStyle=s;var u={x:Math.round(p.x-g.bar._width/2),y:r,width:parseInt(g.bar._width),height:q,fillStyle:s,scaleY:1},w={x:u.x,y:0,width:u.width,height:u.height,fillStyle:u.fillStyle,scaleY:0};if(g.bar.radius&&v==k-1){var x=Math.min(g.bar._width/2,q);x=Math.min(x,g.bar.radius),w.radius=[x,x,0,0]}g.animation||(delete w.scaleY,w.y=u.y);var y;if(h<=f-1?(y=m.getChildById("bar_"+e+"_"+h+"_"+v),y.context.fillStyle=s):(y=new b({id:"bar_"+e+"_"+h+"_"+v,context:w}),m.addChild(y)),y.finalPos=u,y.iGroup=e,y.iNode=h,y.iLay=v,g.bar.filter.apply(y,[p,g]),g.eventEnabled&&y.on("panstart mouseover mousemove mouseout click dblclick",function(a){a.eventInfo=g._getInfoHandler(this,a),"mouseover"==a.type&&(this.parent.getChildById("bhr_"+this.iNode).context.globalAlpha=.1),"mouseout"==a.type&&(this.parent.getChildById("bhr_"+this.iNode).context.globalAlpha=0)}),v==k-1&&g.text.enabled){var z,A=[p];if(h<=f-1?z=o.getChildById("infosp_"+e+"_"+h):(z=new a.Display.Sprite({id:"infosp_"+e+"_"+h,context:{visible:!1}}),z._hGroup=h,o.addChild(z)),k>1)for(var B=k-2;B>=0;B--)A.unshift(d[B][h]);var C=0,D=0;_.each(A,function(b,d){var i=b.value;if(_.isFunction(g.text.format)){var j=g.text.format.apply(self,[i,b]);(j||""==j)&&(i=j)}if(!g.animation&&_.isNumber(i)&&(i=c.numAddSymbol(i)),i){d>0&&z.children.length>0&&(k=new a.Display.Text("/",{context:{x:C+2,fillStyle:"#999"}}),C+=k.getTextWidth()+2,z.addChild(k));var k;h<=f-1?k=z.getChildById("info_txt_"+e+"_"+h+"_"+d):(k=new a.Display.Text(i,{id:"info_txt_"+e+"_"+h+"_"+d,context:{x:C+2,fillStyle:b.fillStyle,fontSize:g.text.fontSize,lineWidth:g.text.lineWidth,strokeStyle:g.text.strokeStyle}}),z.addChild(k)),k._text=b.value,k._data=b,C+=k.getTextWidth()+2,D=Math.max(D,k.getTextHeight()),g.animation&&k.resetText(0)}}),z._finalX=p.x-C/2,z._finalY=u.y-D,z._centerX=p.x,z.context.width=C,z.context.height=D,g.animation||(z.context.y=u.y-D,z.context.x=p.x-C/2,z.context.visible=!0)}}}}}),this.sprite.addChild(this.barsSp),this.sprite.addChild(this.checkedSp),this.text.enabled&&this.sprite.addChild(this.txtsSp),this.average.enabled&&this.average.data&&(!this.averageSp&&(this.averageSp=new a.Display.Sprite({id:"averageSp"})),_.each(this.average.layoutData,function(a,c){var d,e={x:j*c,y:a.y,fillStyle:g.average.fillStyle,width:j,height:2};f-1>=c?(d=g.averageSp.getChildById("average_"+c),d.context.x=e.x,d.context.y=e.y,d.context.width=e.width):(d=new b({id:"average_"+c,context:e}),g.averageSp.addChild(d))}),this.sprite.addChild(g.averageSp)),this.sprite.context.x=this.pos.x,this.sprite.context.y=this.pos.y,this.sort&&"desc"==this.sort&&(this.sprite.context.y-=this.h)}},_updateInfoTextPos:function(a){if("horizontal"!=this.root.type){var b=0,c=0,d=a.children.length;_.each(a.children,function(a,e){a.getTextWidth&&(a.context.x=b,b+=a.getTextWidth()+(d>e?2:0),c=Math.max(c,a.getTextHeight()))}),a.context.x=a._centerX-b/2+1,a.context.width=b,a.context.height=c}},grow:function(a,b){var d=this;if(!this.animation)return void(a&&a(d));var f=1;if(this.sort&&"desc"==this.sort&&(f=-1),d.data[0]&&d.barsSp.children.length>d.data[0][0].length)for(var g=d.data[0][0].length,i=d.barsSp.children.length;i>g;g++)d.barsSp.getChildAt(g).destroy(),d.text.enabled&&d.txtsSp.getChildAt(g).destroy(),d.averageSp&&d.averageSp.getChildAt(g).destroy(),g--,i--;var j=_.extend({delay:Math.min(1e3/this._barsLen,80),easing:"Back.Out",duration:500},b);_.each(d.data,function(a,b){var g=a.length;if(0!=g){var i=a[0].length;for(h=0;h<i;h++){for(v=0;v<g;v++){var k=d.barsSp.getChildById("barGroup_"+h),l=k.getChildById("bar_"+b+"_"+h+"_"+v);0==j.duration?(l.context.scaleY=f,l.context.y=f*f*l.finalPos.y,l.context.x=l.finalPos.x,l.context.width=l.finalPos.width,l.context.height=l.finalPos.height):(l._tweenObj&&e.destroyTween(l._tweenObj),l._tweenObj=l.animate({scaleY:f,y:f*l.finalPos.y,x:l.finalPos.x,width:l.finalPos.width,height:l.finalPos.height},{duration:j.duration,easing:j.easing,delay:h*j.delay,onUpdate:function(a){},onComplete:function(a){a.width<3&&(this.context.radius=0)},id:l.id}))}if(d.text.enabled){var m=d.txtsSp.getChildById("txtGroup_"+h),n=m.getChildById("infosp_"+b+"_"+h);"horizontal"==d.root.type&&(n.context.x=n._finalX),n.animate({y:n._finalY,x:n._finalX},{duration:j.duration,easing:j.easing,delay:h*j.delay,onUpdate:function(){this.context.visible=!0},onComplete:function(){}}),_.each(n.children,function(a){a._text&&(a._tweenObj&&e.destroyTween(a._tweenObj),a._tweenObj=e.registTween({from:{v:a.text},to:{v:a._text},duration:j.duration+300,delay:h*j.delay,onUpdate:function(){var b=this.v;if(_.isFunction(d.text.format)){var e=d.text.format.apply(d,[b,a._data]);(e||""==e)&&(b=e)}else _.isNumber(b)&&(b=c.numAddSymbol(parseInt(b)));a.resetText(b),a.parent?d._updateInfoTextPos(a.parent):a.destroy()}}))})}}}}),a&&a(d)},_getInfoHandler:function(a){var b={iGroup:a.iGroup,iNode:a.iNode,iLay:a.iLay,nodesInfoList:this._getNodeInfo(a.iGroup,a.iNode,a.iLay)};return b},_getNodeInfo:function(a,b,c){var d=[],e=this,f=e.data.length;return void 0==a&&(a=-1),void 0==b&&(b=0),void 0==c&&(c=-1),_.each(e.data,function(g,i){var j,k=g.length;if(0!=k){var l=g[0].length;for(h=0;h<l;h++)if(h==b)for(v=0;v<k;v++)a!=i&&-1!=a||c!=v&&-1!=c||(j=g[v][h],j.fillStyle=e._getColor(e.bar.fillStyle,f,k,i,h,v,j.value,j.field),d.push(j))}}),d}},g});