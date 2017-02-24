define("chartx/chart/bar/graphs",["canvax/index","canvax/shape/Rect","chartx/utils/tools","chartx/chart/theme","canvax/animation/AnimationFrame","canvax/shape/BrokenLine"],function(a,b,c,d,e,f){var g=function(a,b){this.data=[],this.w=0,this.h=0,this.root=b,this._yAxisFieldsMap={},this._setyAxisFieldsMap(),this.animation=!0,this.pos={x:0,y:0},this._colors=d.colors,this.bar={width:0,_width:0,radius:4,fillStyle:null,filter:function(){}},this.text={enabled:!1,fillStyle:"#999",fontSize:12,format:null,lineWidth:1,strokeStyle:"white"},this.average={enabled:!1,field:"average",fieldInd:-1,fillStyle:"#c4c9d6",data:null},this.checked={enabled:!1,fillStyle:"#00A8E6",strokeStyle:"#00A8E6",globalAlpha:.1,lineWidth:2},this.sort=null,this._barsLen=0,this.eventEnabled=!0,this.sprite=null,this.txtsSp=null,this.checkedSp=null,this.yDataSectionLen=0,_.deepExtend(this,a),this._initaverage(),this.init()};return g.prototype={init:function(){this.sprite=new a.Display.Sprite({id:"graphsEl"}),this.barsSp=new a.Display.Sprite({id:"barsSp"}),this.txtsSp=new a.Display.Sprite({id:"txtsSp",context:{}}),this.checkedSp=new a.Display.Sprite({id:"checkedSp"})},setX:function(a){this.sprite.context.x=a},setY:function(a){this.sprite.context.y=a},getInfo:function(a){return this._getInfoHandler({iGroup:a})},_checked:function(a){var c=this,d=a.iNode,e=c.barsSp.getChildById("barGroup_"+d);if(e){c.checkedSp.removeChildById("line_"+d),c.checkedSp.removeChildById("rect_"+d);var g=e.getChildAt(0),h=g.context.x,i=g.context.x+g.context.width,j=-c.h;if(a.checked){var k=new b({id:"rect_"+d,pointChkPriority:!1,context:{x:h,y:j,width:g.context.width,height:g.context.height,fillStyle:c.checked.fillStyle,globalAlpha:c.checked.globalAlpha}});c.checkedSp.addChild(k);var l=new f({id:"line_"+d,context:{pointList:[[h,j],[i,j]],strokeStyle:c.checked.strokeStyle,lineWidth:c.checked.lineWidth}});c.checkedSp.addChild(l)}}},removeAllChecked:function(){var a=this;a.checkedSp.removeAllChildren()},setBarStyle:function(a){for(var b=this,c=a.iNode,d=b.barsSp.getChildById("barGroup_"+c),e=a.fillStyle||b._getColor(b.bar.fillStyle),f=0,g=d.getNumChildren();g>f;f++){var h=d.getChildAt(f);h.context.fillStyle=e}},_setyAxisFieldsMap:function(){var a=this;_.each(_.flatten(this.root.dataFrame.yAxis.field),function(b,c){a._yAxisFieldsMap[b]={index:c}})},_initaverage:function(){this.average.enabled&&_.each(this.root.dataFraem,function(a,b){a.field==this.average.field&&(this.average.fieldInd=b)})},_getColor:function(a,b,c,d,e,f,g,h){var i=null;return _.isString(a)&&(i=a),_.isArray(a)&&(i=_.flatten(a)[this._yAxisFieldsMap[h].index]),_.isFunction(a)&&(i=a.apply(this,[{iGroup:d,iNode:e,iLay:f,field:h,value:g,xAxis:{field:this.root._xAxis.field,value:this.root._xAxis.data[e].content}}])),i&&""!=i||(i=this._colors[this._yAxisFieldsMap[h].index]),i},_getFieldFromIHV:function(a,b,c){var d=this.root._yAxis.field,e=null;return _.isString(d[a])?e=d[a]:_.isArray(d[a])&&(e=d[a][c]),e},checkBarW:function(a,b){this.bar.width?_.isFunction(this.bar.width)?this.bar._width=this.bar.width(a):this.bar._width=this.bar.width:(this.bar._width=parseInt(b)-parseInt(Math.max(1,.3*b)),1==this.bar._width&&a>3&&(this.bar._width=parseInt(a)-2)),this.bar._width<1&&(this.bar._width=1)},resetData:function(a,b){this.draw(a.data,b)},draw:function(d,e){if(_.deepExtend(this,e),0!=d.length){var f=0;this.data[0]&&(f=this.data[0][0].length),this.data=d;var g=this,i=d.length,j=0;_.each(d,function(d,e){var k=d.length;if(0!=k){var l=d[0].length;for(j=parseInt(g.w/l),g._barsLen=l*i,h=0;h<l;h++){var m;if(0==e){if(h<=f-1?m=g.barsSp.getChildById("barGroup_"+h):(m=new a.Display.Sprite({id:"barGroup_"+h}),g.barsSp.addChild(m),m.iNode=h,m.on("click dblclick mousedown mousemove mouseup",function(a){a.eventInfo||(a.eventInfo=g._getInfoHandler(this))})),g.eventEnabled){var n;h<=f-1?(n=m.getChildById("bhr_"+h),n.context.width=j,n.context.x=j*h):(n=new b({id:"bhr_"+h,pointChkPriority:!1,context:{x:j*h,y:g.sort&&"desc"==g.sort?0:-g.h,width:j,height:g.h,fillStyle:"#ccc",globalAlpha:0}}),m.addChild(n),n.hover(function(a){this.context.globalAlpha=.1},function(a){this.context.globalAlpha=0}),n.iGroup=-1,n.iNode=h,n.iLay=-1,n.on("panstart mouseover mousemove mouseout click",function(a){a.eventInfo=g._getInfoHandler(this,a)}))}}else m=g.barsSp.getChildById("barGroup_"+h);var o;for(0==e?h<=f-1?o=g.txtsSp.getChildById("txtGroup_"+h):(o=new a.Display.Sprite({id:"txtGroup_"+h}),g.txtsSp.addChild(o),o.iGroup=e):o=g.txtsSp.getChildById("txtGroup_"+h),v=0;v<k;v++){var p=d[v][h];p.iGroup=e,p.iNode=h,p.iLay=v;var q=parseInt(Math.abs(p.y));v>0&&(q-=parseInt(Math.abs(d[v-1][h].y)));var r=parseInt(p.y),s=g._getColor(g.bar.fillStyle,i,k,e,h,v,p.value,p.field);if(0==h){var t=g._yAxisFieldsMap[g._getFieldFromIHV(e,h,v)];t.fillStyle||(t.fillStyle=s)}p.fillStyle=s;var u={x:Math.round(p.x-g.bar._width/2),y:r,width:parseInt(g.bar._width),height:q,fillStyle:s,scaleY:1},w={x:u.x,y:0,width:u.width,height:u.height,fillStyle:u.fillStyle,scaleY:0};if(g.bar.radius&&v==k-1){var x=Math.min(g.bar._width/2,q);x=Math.min(x,g.bar.radius),w.radius=[x,x,0,0]}g.animation||(delete w.scaleY,w.y=u.y);var y;if(h<=f-1?(y=m.getChildById("bar_"+e+"_"+h+"_"+v),y.context.fillStyle=s):(y=new b({id:"bar_"+e+"_"+h+"_"+v,context:w}),m.addChild(y)),y.finalPos=u,y.iGroup=e,y.iNode=h,y.iLay=v,g.bar.filter.apply(y,[p,g]),g.eventEnabled&&y.on("panstart mouseover mousemove mouseout click dblclick",function(a){a.eventInfo=g._getInfoHandler(this,a),"mouseover"==a.type&&(this.parent.getChildById("bhr_"+this.iNode).context.globalAlpha=.1),"mouseout"==a.type&&(this.parent.getChildById("bhr_"+this.iNode).context.globalAlpha=0)}),v==k-1&&g.text.enabled){var z,A=[p];if(h<=f-1?z=o.getChildById("infosp_"+e+"_"+h):(z=new a.Display.Sprite({id:"infosp_"+e+"_"+h,context:{visible:!1}}),z._hGroup=h,o.addChild(z)),k>1)for(var B=k-2;B>=0;B--)A.unshift(d[B][h]);var C=0,D=0;_.each(A,function(b,d){var i=b.value;if(_.isFunction(g.text.format)){var j=g.text.format.apply(self,[i,b]);(j||""==j)&&(i=j)}if(!g.animation&&_.isNumber(i)&&(i=c.numAddSymbol(i)),i){d>0&&(k=new a.Display.Text("/",{context:{x:C+2,fillStyle:"#999"}}),C+=k.getTextWidth()+2,z.addChild(k));var k;h<=f-1?k=z.getChildById("info_txt_"+e+"_"+h+"_"+d):(k=new a.Display.Text(i,{id:"info_txt_"+e+"_"+h+"_"+d,context:{x:C+2,fillStyle:b.fillStyle,fontSize:g.text.fontSize,lineWidth:g.text.lineWidth,strokeStyle:g.text.strokeStyle}}),z.addChild(k)),k._text=i,k._data=b,C+=k.getTextWidth()+2,D=Math.max(D,k.getTextHeight()),g.animation&&k.resetText(0)}}),z._finalX=p.x-C/2,z._finalY=u.y-D,z._centerX=p.x,z.context.width=C,z.context.height=D,g.animation||(z.context.y=u.y-D,z.context.x=p.x-C/2,z.context.visible=!0)}}}}}),this.sprite.addChild(this.barsSp),this.sprite.addChild(this.checkedSp),this.text.enabled&&this.sprite.addChild(this.txtsSp),this.average.enabled&&this.average.data&&(!this.averageSp&&(this.averageSp=new a.Display.Sprite({id:"averageSp"})),_.each(this.average.layoutData,function(a,c){var d,e={x:j*c,y:a.y,fillStyle:g.average.fillStyle,width:j,height:2};f-1>=c?(d=g.averageSp.getChildById("average_"+c),d.context.x=e.x,d.context.y=e.y,d.context.width=e.width):(d=new b({id:"average_"+c,context:e}),g.averageSp.addChild(d))}),this.sprite.addChild(g.averageSp)),this.sprite.context.x=this.pos.x,this.sprite.context.y=this.pos.y,this.sort&&"desc"==this.sort&&(this.sprite.context.y-=this.h)}},_updateInfoTextPos:function(a){if("horizontal"!=this.root.type){var b=0,c=0,d=a.children.length;_.each(a.children,function(a,e){a.getTextWidth&&(a.context.x=b,b+=a.getTextWidth()+(d>e?2:0),c=Math.max(c,a.getTextHeight()))}),a.context.x=a._centerX-b/2+1,a.context.width=b,a.context.height=c}},grow:function(a,b){var d=this;if(!this.animation)return void(a&&a(d));var f=1;if(this.sort&&"desc"==this.sort&&(f=-1),d.data[0]&&d.barsSp.children.length>d.data[0][0].length)for(var g=d.data[0][0].length,i=d.barsSp.children.length;i>g;g++)d.barsSp.getChildAt(g).destroy(),d.text.enabled&&d.txtsSp.getChildAt(g).destroy(),d.averageSp&&d.averageSp.getChildAt(g).destroy(),g--,i--;var j=_.extend({delay:Math.min(1e3/this._barsLen,80),easing:"Back.Out",duration:500},b);_.each(d.data,function(a,b){var g=a.length;if(0!=g){var i=a[0].length;for(h=0;h<i;h++){for(v=0;v<g;v++){var k=d.barsSp.getChildById("barGroup_"+h),l=k.getChildById("bar_"+b+"_"+h+"_"+v);0==j.duration?(l.context.scaleY=f,l.context.y=f*f*l.finalPos.y,l.context.x=l.finalPos.x,l.context.width=l.finalPos.width,l.context.height=l.finalPos.height):(l._tweenObj&&e.destroyTween(l._tweenObj),l._tweenObj=l.animate({scaleY:f,y:f*l.finalPos.y,x:l.finalPos.x,width:l.finalPos.width,height:l.finalPos.height},{duration:j.duration,easing:j.easing,delay:h*j.delay,onUpdate:function(a){},onComplete:function(a){a.width<3&&(this.context.radius=0)},id:l.id}))}if(d.text.enabled){var m=d.txtsSp.getChildById("txtGroup_"+h),n=m.getChildById("infosp_"+b+"_"+h);"horizontal"==d.root.type&&(n.context.x=n._finalX),n.animate({y:n._finalY,x:n._finalX},{duration:j.duration,easing:j.easing,delay:h*j.delay,onUpdate:function(){this.context.visible=!0},onComplete:function(){}}),_.each(n.children,function(a){a._text&&(a._tweenObj&&e.destroyTween(a._tweenObj),a._tweenObj=e.registTween({from:{v:a.text},to:{v:a._text},duration:j.duration+300,delay:h*j.delay,onUpdate:function(){var b=this.v;if(_.isFunction(d.text.format)){var e=d.text.format.apply(d,[b,a._data]);(e||""==e)&&(b=e)}else _.isNumber(b)&&(b=c.numAddSymbol(parseInt(b)));a.resetText(b),a.parent?d._updateInfoTextPos(a.parent):a.destroy()}}))})}}}}),a&&a(d)},_getInfoHandler:function(a){var b={iGroup:a.iGroup,iNode:a.iNode,iLay:a.iLay,nodesInfoList:this._getNodeInfo(a.iGroup,a.iNode,a.iLay)};return b},_getNodeInfo:function(a,b,c){var d=[],e=this,f=e.data.length;return void 0==a&&(a=-1),void 0==b&&(b=0),void 0==c&&(c=-1),_.each(e.data,function(g,i){var j,k=g.length;if(0!=k){var l=g[0].length;for(h=0;h<l;h++)if(h==b)for(v=0;v<k;v++)a!=i&&-1!=a||c!=v&&-1!=c||(j=g[v][h],j.fillStyle=e._getColor(e.bar.fillStyle,f,k,i,h,v,j.value,j.field),d.push(j))}}),d}},g}),define("chartx/chart/bar/yaxis",["canvax/index","chartx/components/yaxis/yAxis"],function(a,b){var c=function(a,b){c.superclass.constructor.apply(this,[a.bar?a.bar:a,b])};return Chartx.extend(c,b,{_setDataSection:function(a){var b=[];return _.each(a.org,function(a,c){if(a.length){if(!_.isArray(a[0]))return void b.push(a);for(var d=[],e=a[0].length,f=a.length,g=0,c=0;e>c;c++){for(var h=0,i=0;f>i;i++)h+=a[i][c],g=Math.min(a[i][c],g);d.push(h)}d.push(g),b.push(d)}}),_.flatten(b)}}),c}),define("chartx/chart/bar/index",["chartx/chart/index","chartx/utils/tools","chartx/utils/datasection","chartx/components/xaxis/xAxis","chartx/chart/bar/yaxis","chartx/components/back/Back","chartx/chart/bar/graphs","chartx/components/tips/tip","chartx/utils/dataformat","chartx/components/datazoom/index","chartx/components/legend/index"],function(a,b,c,d,e,f,g,h,i,j,k){var l=a.Canvax,m=a.extend({init:function(a,c,d){c=b.parse2MatrixData(c),this._xAxis=null,this.xAxis={layoutType:"peak"},this._yAxis=null,this._back=null,this._graphs=null,this._tip=null,this._checkedList=[],this._currCheckedList=[],this._node=a,this._data=c,this._opts=d,this.dataZoom={enabled:!1,range:{start:0,end:c.length-1}},d.dataZoom&&(this.dataZoom.enabled=!0,this.padding.bottom+=d.dataZoom.height||46),d.proportion?(this.proportion=d.proportion,this._initProportion(a,c,d)):_.deepExtend(this,d),this.dataFrame=this._initData(c),this._setLegend(),this._fieldsDisplayMap=this.__setFieldsDisplay(this._opts.yAxis.field||this._opts.yAxis.bar.field),this._init&&this._init(a,c,d)},resetData:function(a){this._data=b.parse2MatrixData(a),this.dataFrame=this._initData(a,this),this._xAxis.reset({animation:!1},this.dataFrame.xAxis),this.dataZoom.enabled?(this.__cloneBar=this._getCloneBar(),this._yAxis.reset({animation:!1},this.__cloneBar.thumbBar.dataFrame.yAxis),this._dataZoom.sprite.destroy(),this._initDataZoom()):this._yAxis.reset({animation:!1},this.dataFrame.yAxis),this._graphs.resetData(this._trimGraphs()),this._graphs.grow(function(){},{delay:0}),this.fire("_resetData")},getCheckedCurrList:function(){var a=this;return _.filter(a._getCurrCheckedList(),function(a){return a})},getCheckedList:function(){var a=this;return _.filter(a._checkedList,function(a){return a})},__setFieldsDisplay:function(a){_.isString(a)&&(a=[a]);for(var b=_.clone(a),c=0,d=a.length;d>c;c++)_.isString(a[c])&&(b[c]={field:a[c],enabled:!0}),_.isArray(a[c])&&(b[c]=this.__setFieldsDisplay(a[c]));return b},_getFieldsOfDisplay:function(a){var b=[];!a&&(a=this._fieldsDisplayMap);for(var c=0,d=a.length;d>c;c++)if(_.isArray(a[c])){var e=this._getFieldsOfDisplay(a[c]);e.length>0&&(b[c]=e)}else a[c].field&&a[c].enabled&&(b[c]=a[c].field);return b},_setFieldDisplay:function(a){function b(c){_.each(c,function(c,d){_.isArray(c)?b(c):c.field&&c.field==a&&(c.enabled=!c.enabled)})}var c=this;b(c._fieldsDisplayMap)},_resetOfLengend:function(a){var b=this;if(b._setFieldDisplay(a),_.deepExtend(this,{yAxis:{field:b._getFieldsOfDisplay()}}),this.graphs&&this.graphs.bar&&_.isFunction(this.graphs.bar.fillStyle)){var c=this.graphs.bar.fillStyle;this.graphs.bar.fillStyle=function(a){var d=c(a);return d||b._legend&&(d=b._legend.getStyle(a.field).fillStyle),d}}else _.deepExtend(this,{graphs:{bar:{fillStyle:function(a){return b._legend?b._legend.getStyle(a.field).fillStyle:void 0}}}});for(var d=0,e=this.canvax.children.length;e>d;d++)for(var f=this.canvax.getChildAt(d),g=0,h=f.children.length;h>g;g++){var i=f.getChildAt(g);"LegendSprite"!=i.id&&"legend_tip"!=i.id&&(f.getChildAt(g).destroy(),g--,h--)}this.dataFrame=this._initData(this._data),this.draw()},_setLegend:function(){var a=this;if(!(!this.legend||this.legend&&"enabled"in this.legend&&!this.legend.enabled)){var b=_.deepExtend({enabled:!0,label:function(a){return a.field},onChecked:function(b){a._resetOfLengend(b)},onUnChecked:function(b){a._resetOfLengend(b)}},this._opts.legend);this._legend=new k(this._getLegendData(),b),this.stage.addChild(this._legend.sprite),this._legend.pos({x:0,y:this.padding.top}),this.padding.top+=this._legend.height}},_getLegendData:function(){var a=this,b=[];return _.each(_.flatten(a.dataFrame.yAxis.field),function(a,c){b.push({field:a,value:null,fillStyle:null})}),b},checkAt:function(a){var b=this,c=a-b.dataZoom.range.start,d=b._graphs.getInfo(c);b._checkedList[a]=d,b._checkedBar({iNode:c,checked:!0}),b._checkedMiniBar({iNode:a,checked:!0}),d.iNode=a},uncheckAt:function(a){var b=this,c=a-b.dataZoom.range.start;b._checkedList[a]&&b._checked(b._graphs.getInfo(c))},uncheckAll:function(){for(var a=0,b=this._checkedList.length;b>a;a++){var c=this._checkedList[a];c&&this.uncheckAt(a)}this._checkedList=[],this._currCheckedList=[]},checkOf:function(a){this.checkAt(this._xAxis.getIndexOfVal(a)+this.dataZoom.range.start)},uncheckOf:function(a){this.uncheckAt(this._xAxis.getIndexOfVal(a)+this.dataZoom.range.start)},getGroupChecked:function(a){var b=!1;return _.each(this.getCheckedList(),function(c){c&&c.iNode==a.eventInfo.iNode&&(b=!0)}),b},_initProportion:function(a,c,d){!d.tips&&(d.tips={}),d.tips=_.deepExtend({content:function(a){var c="<table style='border:none'>",d=this;return _.each(a.nodesInfoList,function(a,e){c+="<tr style='color:"+(a.color||a.fillStyle)+"'>";var f=d.prefix[e],g="style='border:none;white-space:nowrap;word-wrap:normal;'";f?c+="<td "+g+">"+f+"：</td>":a.field&&(c+="<td "+g+">"+a.field+"：</td>"),c+="<td "+g+">"+b.numAddSymbol(a.value),a.vCount&&(c+="（"+Math.round(a.value/a.vCount*100)+"%）"),c+="</td></tr>"}),c+="</table>"}},d.tips),_.deepExtend(this,d),_.deepExtend(this.yAxis,{dataSection:[0,20,40,60,80,100],text:{format:function(a){return a+"%"}}}),!this.graphs&&(this.graphs={}),_.deepExtend(this.graphs,{bar:{radius:0}})},_setStages:function(){this.core=new l.Display.Sprite({id:"core"}),this.stageBg=new l.Display.Sprite({id:"bg"}),this.stageTip=new l.Display.Sprite({id:"tip"}),this.stage.addChild(this.stageBg),this.stage.addChild(this.core),this.stage.addChild(this.stageTip),this.rotate&&this._rotate(this.rotate)},draw:function(){this._setStages(),this._initModule(),this._startDraw(),this._drawEnd(),this.inited=!0},_initData:function(a,b){var c;if(this.dataZoom.enabled){var d=[a[0]];d=d.concat(a.slice(this.dataZoom.range.start+1,this.dataZoom.range.end+1+1)),c=i.apply(this,[d,b])}else c=i.apply(this,arguments);return _.each(c.yAxis.field,function(a,b){_.isArray(a)||(a=[a],c.yAxis.org[b]=[c.yAxis.org[b]])}),c},_getaverageData:function(){var a=[],b=this;return this._graphs&&this._graphs.average&&this._graphs.average.data?this._graphs.average.data:(this._graphs.average.enabled&&_.each(this.dataFrame.data,function(c,d){c.field==b._graphs.average.field&&(a=c.data)}),this._graphs.average.data=a,a)},_setaverageLayoutData:function(){var a=[],b=this;if(this._graphs.average.enabled){var c=this._yAxis.dataSection[this._yAxis.dataSection.length-1];_.each(this._graphs.average.data,function(d,e){a.push({value:d,y:-(d-b._yAxis._bottomNumber)/Math.abs(c-b._yAxis._bottomNumber)*b._yAxis.yGraphsHeight})}),this._graphs.average.layoutData=a}},_initModule:function(){this._graphs=new g(this.graphs,this),this._xAxis=new d(this.xAxis,this.dataFrame.xAxis),this._graphs.average.enabled&&this.dataFrame.yAxis.org.push([this._getaverageData()]),this.markLine&&this.markLine.y&&this.dataFrame.yAxis.org.push([this.markLine.y]),this._yAxis=new e(this.yAxis,this.dataFrame.yAxis),this._back=new f(this.back),this._tip=new h(this.tips,this.canvax.getDomContainer())},_startDraw:function(a){var b=a&&a.w||this.width,c=a&&a.h||this.height,d=parseInt(c-this._xAxis.height),e=d-this.padding.top-this.padding.bottom;this._yAxis.draw({pos:{x:this.padding.left,y:d-this.padding.bottom},yMaxHeight:e}),this.dataZoom.enabled&&(this.__cloneBar=this._getCloneBar(),this._yAxis.reset({animation:!1},this.__cloneBar.thumbBar.dataFrame.yAxis),this._yAxis.setX(this._yAxis.pos.x));var f=this._yAxis.width;this._xAxis.draw({graphh:c-this.padding.bottom,graphw:b-this.padding.right,yAxisW:f}),this._xAxis.yAxisW!=f&&(this._yAxis.resetWidth(this._xAxis.yAxisW),f=this._xAxis.yAxisW);var g=this._yAxis.yGraphsHeight;this._back.draw({w:this._xAxis.xGraphsWidth,h:g,xAxis:{data:this._yAxis.layoutData},yAxis:{data:this._xAxis.layoutData,xDis:this._xAxis.xDis},pos:{x:f,y:d-this.padding.bottom}},this),this._setaverageLayoutData();var h=this._trimGraphs();if(this._graphs.draw(h.data,{w:this._xAxis.xGraphsWidth,h:this._yAxis.yGraphsHeight,pos:{x:f,y:d-this.padding.bottom},yDataSectionLen:this._yAxis.dataSection.length,sort:this._yAxis.sort}),this.dataZoom.enabled&&this._initDataZoom(),this._legend&&!this._legend.inited){this._legend.pos({x:f});for(var i in this._graphs._yAxisFieldsMap){var j=this._graphs._yAxisFieldsMap[i].fillStyle;this._legend.setStyle(i,{fillStyle:j})}this._legend.inited=!0}},_setXaxisYaxisToTipsInfo:function(a){if(a.eventInfo){a.eventInfo.xAxis={field:this.dataFrame.xAxis.field,value:this.dataFrame.xAxis.org[0][a.eventInfo.iNode]};var b=this;_.each(a.eventInfo.nodesInfoList,function(a,c){b._checkedList[a.iNode+b.dataZoom.range.start]?a.checked=!0:a.checked=!1}),a.eventInfo.dataZoom=b.dataZoom,a.eventInfo.rowData=this.dataFrame.getRowData(a.eventInfo.iNode),a.eventInfo.iNode+=this.dataZoom.range.start}},_trimGraphs:function(a,b){a||(a=this._xAxis),b||(b=this._yAxis);var c=a.data,d=b.dataOrg,e=b.field.length,f=a.xDis,g=f/(e+1);this._graphs.checkBarW&&this._graphs.checkBarW(f,g);for(var h=b.dataSection[b.dataSection.length-1],i=[],j=[],k=[],l=[],m=this,n=0;e>n;n++){!i[n]&&(i[n]=[]),k[n]=0,j[n]={};var o=d[n];_.each(o,function(a,d){!i[n][d]&&(i[n][d]=[]),m.dataZoom.enabled&&(a=a.slice(m.dataZoom.range.start,m.dataZoom.range.end+1)),_.each(a,function(e,h){if(c[h]){var j=0;m.proportion&&_.each(o,function(a,b){j+=a[h]});var p=c[h].x-f/2+g*(n+1),q=0;q=m.proportion?-e/j*b.yGraphsHeight:b.getYposFromVal(e),d>0&&(q+=i[n][d-1][h].y),m._yAxis.sort&&"desc"==m._yAxis.sort&&(q=-(b.yGraphsHeight-Math.abs(q)));var r={value:e,field:m._getTargetField(n,d,h,b.field),x:p,y:q,xAxis:{field:m._xAxis.field,value:c[h].content,layoutText:c[h].layoutText}};m.proportion&&(r.vCount=j),i[n][d].push(r),k[n]+=Number(e),l=a.length}})})}for(var p=0,q=k.length;q>p;p++)j[p].agValue=k[p]/l,j[p].agPosition=-(k[p]/l-b._bottomNumber)/(h-b._bottomNumber)*b.yGraphsHeight;return this.dataFrame.yAxis.center=j,{data:i}},_getTargetField:function(a,b,c,d){if(d||(d=this._yAxis.field),_.isString(d))return d;if(_.isArray(d)){var e=d[a];if(_.isString(e))return e;if(_.isArray(e))return e[b]}},_drawEnd:function(){var a=this;this.stageBg.addChild(this._back.sprite),this.core.addChild(this._xAxis.sprite),this.core.addChild(this._graphs.sprite),this.core.addChild(this._yAxis.sprite),this.stageTip.addChild(this._tip.sprite),this._graphs.grow(function(b){a._opts.markLine&&a._initMarkLine(b),a._opts.markPoint&&a._initMarkPoint(b)}),this.bindEvent()},_initDataZoom:function(){var a=this,b=_.deepExtend({w:a._xAxis.xGraphsWidth,count:a._data.length-1,pos:{x:a._xAxis.pos.x,y:a._xAxis.pos.y+a._xAxis.height},dragIng:function(b){(parseInt(a.dataZoom.range.start)!=parseInt(b.start)||parseInt(a.dataZoom.range.end)!=parseInt(b.end))&&(a.dataZoom.range.start=parseInt(b.start),a.dataZoom.range.end=parseInt(b.end),a.dataFrame=a._initData(a._data,a._opts),a._xAxis.reset({animation:!1},a.dataFrame.xAxis),a._graphs.average.data=null,a._graphs.w=a._xAxis.xGraphsWidth,a._getaverageData(),a._setaverageLayoutData(),a._graphs.resetData(a._trimGraphs()),a._graphs.grow(function(){},{delay:0,easing:"Quadratic.Out",duration:300}),a._removeChecked(),a.fire("_dataZoomDragIng"))},dragEnd:function(b){a._updateChecked()}},a.dataZoom);a._dataZoom=new j(b);var c=this.__cloneBar.thumbBar._graphs.sprite;c.id=c.id+"_datazoomthumbbarbg",c.context.x=0,c.context.y=a._dataZoom.barH+a._dataZoom.barY,c.context.scaleY=a._dataZoom.barH/this.__cloneBar.thumbBar._graphs.h,a._dataZoom.dataZoomBg.addChild(c),a.core.addChild(a._dataZoom.sprite),this.__cloneBar.thumbBar.destroy(),this.__cloneBar.cloneEl.parentNode.removeChild(this.__cloneBar.cloneEl)},_getCloneBar:function(){var a=this;barConstructor=this.constructor;var b=a.el.cloneNode();b.innerHTML="",b.id=a.el.id+"_currclone",b.style.position="absolute",b.style.width=a.el.offsetWidth+"px",b.style.height=a.el.offsetHeight+"px",b.style.top="10000px",document.body.appendChild(b);var c=_.deepExtend({},a._opts);_.deepExtend(c,{graphs:{bar:{fillStyle:a.dataZoom.normalColor||"#ececec"},animation:!1,eventEnabled:!1,text:{enabled:!1},average:{enabled:!1}},dataZoom:{enabled:!1},xAxis:{},yAxis:{}});var d=new barConstructor(b,a._data,c);return d.draw(),{thumbBar:d,cloneEl:b}},_initMarkLine:function(a){var b=this;require(["chartx/components/markline/index"],function(c){for(var d=_.flatten(b._yAxis.field),e=0,f=d.length;f>e;e++){var g=e,h=null,i=d[e],j=b.markLine.target;if((!j||_.isArray(j)&&_.indexOf(j,i)>=0||j===i)&&b.dataFrame.yAxis.center[e]){h=b.dataFrame.yAxis.center[e].agPosition;var k=a._yAxisFieldsMap[d[e]].fillStyle,l=b.dataFrame.yAxis.field[e]+"均值";if(b.markLine.text&&b.markLine.text.enabled&&_.isFunction(b.markLine.text.format)){var m={iGroup:g,value:b.dataFrame.yAxis.center[g].agValue};l=b.markLine.text.format(m)}var n=h;if(void 0!=b.markLine.y){var n=b.markLine.y;_.isFunction(n)&&(n=n(d[e])),_.isArray(n)&&(n=n[e]),void 0!=n&&(n=b._yAxis.getYposFromVal(n))}var m={w:b._xAxis.xGraphsWidth,h:b._yAxis.yGraphsHeight,origin:{x:b._back.pos.x,y:b._back.pos.y},field:_.isArray(b._yAxis.field[e])?b._yAxis.field[e][0]:b._yAxis.field[e],line:{y:n,list:[[0,0],[b._xAxis.xGraphsWidth,0]],strokeStyle:k},text:{content:l,fillStyle:k}};new c(_.deepExtend(m,b._opts.markLine)).done(function(){b.core.addChild(this.sprite)})}}})},_initMarkPoint:function(a){var b=this,c={x:a.sprite.context.x,y:a.sprite.context.y};require(["chartx/components/markpoint/index"],function(d){_.each(a.data,function(a,e){a.length;_.each(a,function(a){_.each(a,function(a){var e=_.clone(a);e.x+=c.x,e.y+=c.y;var f={value:e.value,shapeType:"droplet",markTarget:e.field,iGroup:e.iGroup,iNode:e.iNode,iLay:e.iLay,point:{x:e.x,y:e.y}};new d(b._opts,f).done(function(){b.core.addChild(this.sprite);var a=this;this.shape.hover(function(a){this.context.hr++,this.context.cursor="pointer",a.stopPropagation()},function(a){this.context.hr--,a.stopPropagation()}),this.shape.on("mousemove",function(a){a.stopPropagation()}),this.shape.on("tap click",function(c){c.stopPropagation(),c.eventInfo=a,b.fire("markpointclick",c)})})})})})})},_removeChecked:function(){this._graphs.removeAllChecked()},_updateChecked:function(){var a=this;a._currCheckedList=a._getCurrCheckedList();for(var b=0,c=a._currCheckedList.length;c>b;b++){var d=a._currCheckedList[b];a._checkedBar({iNode:d.iNode-a.dataZoom.range.start,checked:!0})}},_getCurrCheckedList:function(){var a=this;return _.filter(a._checkedList,function(b){return b&&b.iNode>=a.dataZoom.range.start&&b.iNode<=a.dataZoom.range.end?b:void 0})},_checked:function(a){var b=this;if(b._graphs.checked.enabled){var c=a.iNode+b.dataZoom.range.start,d=!0;b._checkedList[c]?(b._checkedList[c]=null,d=!1):b._checkedList[c]=a,b._checkedBar({iNode:a.iNode,checked:d}),b._checkedMiniBar({iNode:c,checked:d}),a.iNode=c}},_checkedBar:function(a){var b=this,c=b._graphs;c._checked(a)},_checkedMiniBar:function(a){if(this.dataZoom.enabled){var b=this,c=b.__cloneBar.thumbBar._graphs,d="";a.checked&&(d=b._opts.dataZoom.checked&&b._opts.dataZoom.checked.fillStyle||d),c.setBarStyle({iNode:a.iNode,fillStyle:d})}},bindEvent:function(){var a=this;this._graphs.sprite.on("panstart mouseover",function(b){a._setXaxisYaxisToTipsInfo(b),a._tip.show(b),a.fire(b.type,b)}),this._graphs.sprite.on("panmove mousemove",function(b){a._setXaxisYaxisToTipsInfo(b),a._tip.move(b),a.fire(b.type,b)}),this._graphs.sprite.on("panend mouseout",function(b){a._tip.hide(b),a.fire(b.type,b)}),this._graphs.sprite.on("tap click dblclick mousedown mouseup",function(b){"click"==b.type&&(a.fire("checkedBefor"),a._checked(_.clone(b.eventInfo))),a._setXaxisYaxisToTipsInfo(b),a.fire(b.type,b)})}});return m});