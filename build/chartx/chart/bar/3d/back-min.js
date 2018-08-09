define("chartx/chart/bar/3d/back",["canvax/index","canvax/shape/Line","chartx/utils/tools","canvax/shape/Shapes","chartx/utils/colorformat"],function(a,b,c,d,e){var f=function(a){var b=a.back;this.root=a,this.w=0,this.h=0,this._depth=-100,this.pos={x:0,y:0},this.enabled=1,this.xOrigin={enabled:1,lineWidth:1,strokeStyle:"#eee"},_.extend(this.yOrigin={},this.xOrigin,{biaxial:!1}),this.xAxis={enabled:1,data:[],org:null,lineType:"solid",lineWidth:1,strokeStyle:"#f5f5f5",filter:null},_.extend(this.yAxis={},this.xAxis),this.sprite=null,this.xAxisSp=null,this.yAxisSp=null,this.resize=!1,this.isFillBackColor=1,this.init(b)};return f.prototype={init:function(b){_.deepExtend(this,b),b&&b.depth&&(this._depth=-b.depth),this.sprite=new a.Display.Sprite},setX:function(a){this.sprite.context.x=a},setY:function(a){this.sprite.context.y=a},draw:function(a){_.deepExtend(this,a),this._widget(),this.setX(this.pos.x),this.setY(this.pos.y)},update:function(a){this.sprite.removeAllChildren(),this.draw(a)},_drawLine:function(a,c,d,e){var f=c.getChildById(a)||new b({id:a,context:{lineType:e.lineType,lineWidth:e.lineWidth,strokeStyle:e.strokeStyle}});return _.extend(f.context,d),f.zStart=d.zStart,f.zEnd=d.zEnd,f},drawBackground:function(a,b,c,d,e){var f=this,g="#000",h=b.context,i=c.context,j=[[h.xStart,h.yStart,b.zStart],[h.xEnd,h.yEnd,b.zEnd],[i.xEnd,i.yEnd,c.zEnd],[i.xStart,i.yStart,c.zStart]],k=f.root.drawFace(a,j,g,g,d,e);f.sprite.addChild(k)},_widget:function(){var b=this,c=this._depth;if(this.enabled){if(b.root&&b.root._yAxis&&b.root._yAxis.dataSectionGroup){b.yGroupSp=new a.Display.Sprite,b.sprite.addChild(b.yGroupSp);for(var d=0,e=b.root._yAxis.dataSectionGroup.length;e>d;d++){var f=b.root._yAxis.yGraphsHeight/e,g="Back_section_"+d,h=0,i=h+b.w,j=-f*d,k=j-f,l=[[h,j,0],[h,j,c],[i,j,c],[i,k,c],[h,k,c],[h,k,0]],m=b.root.drawFace(g,l,"#000","#000",.04*(d%2),b.yGroupSp);b.yGroupSp.addChild(m)}}b.xAxisSp=b.sprite.getChildById("Back_xAsix")||new a.Display.Sprite({id:"Back_xAsix"}),b.sprite.addChild(b.xAxisSp),b.yAxisSp=b.sprite.getChildById("Back_yAsix")||new a.Display.Sprite({id:"Back_yAsix"}),b.sprite.addChild(b.yAxisSp);var n=b.xAxis.data;if(b.xAxis.enabled){for(var o=0,p=n.length;p>o;o++){var q=n[o],g="back_line_xAxis_"+o,r={xStart:0,yStart:q.y,xEnd:b.w,yEnd:q.y,zStart:c,zEnd:c},s=b._drawLine(g,b.xAxisSp,r,b.xAxis);_.isFunction(b.xAxis.filter)&&b.xAxis.filter({layoutData:b.yAxis.data,index:o,line:s}),b.xAxisSp.addChild(s);var g="back_line_xAxis_z_"+o,r={xStart:0,yStart:q.y,xEnd:0,yEnd:q.y,zStart:0,zEnd:c},s=b._drawLine(g,b.xAxisSp,r,b.xAxis);b.xAxisSp.addChild(s)}if(b.xOrigin.enabled){var t=null==b.xAxis.org?0:_.find(b.xAxis.data,function(a){return a.content==b.xAxis.org}).y,g="Back_xAxisOrg",r={xStart:t,yStart:0,xEnd:b.w,yEnd:t,zStart:0,zEnd:0},s=b._drawLine(g,b.xAxisSp,r,b.xOrigin);b.xAxisSp.addChild(s)}if(b.isFillBackColor){var g="Back_xBackground",u=b.xAxisSp.getChildById("Back_xAxisOrg"),v=b.xAxisSp.getChildById("back_line_xAxis_0"),w=.04;b.drawBackground(g,u,v,w,b.sprite)}}var n=b.yAxis.data;if(b.yAxis.enabled){n.unshift({x:.5}),n.push({x:b.w});for(var o=0,p=n.length;p>o;o++){var q=n[o],g="back_line_yAxis_"+o,r={xStart:q.x,yStart:0,xEnd:q.x,yEnd:-b.h,zStart:c,zEnd:c},s=b._drawLine(g,b.yAxisSp,r,b.yAxis);s.context.visible=q.x?!0:!1,_.isFunction(b.yAxis.filter)&&b.yAxis.filter({layoutData:b.xAxis.data,index:o,line:s}),b.yAxisSp.addChild(s);var g="back_line_yAxis_z_"+o,r={xStart:q.x,yStart:0,xEnd:q.x,yEnd:0,zStart:0,zEnd:c},s=b._drawLine(g,b.yAxisSp,r,b.yAxis);s.context.visible=q.x?!0:!1,b.yAxisSp.addChild(s)}if(b.yOrigin.enabled){var t=null==b.yAxis.org?0:_.find(b.yAxis.data,function(a){return a.content==b.yAxis.org}).x,g="Back_yAxisOrg",r={xStart:t,yStart:0,xEnd:t,yEnd:-b.h,zStart:0,zEnd:0},s=b._drawLine(g,b.yAxisSp,r,b.yOrigin);b.yAxisSp.addChild(s)}if(b.isFillBackColor){var g="Back_yBackground",u=b.yAxisSp.getChildById("Back_yAxisOrg"),v=b.yAxisSp.getChildById("back_line_yAxis_0"),w=.1;b.drawBackground(g,u,v,w,b.sprite)}}if(b.yOrigin.biaxial,b.isFillBackColor){var g="Back_Background",x=b.xAxis.data.length-1,u=b.xAxisSp.getChildById("back_line_xAxis_"+x),v=b.xAxisSp.getChildById("back_line_xAxis_0"),w=.02;b.drawBackground(g,u,v,w,b.sprite)}}}},f});