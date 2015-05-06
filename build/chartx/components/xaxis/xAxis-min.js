define("chartx/components/xaxis/xAxis",["canvax/index","canvax/shape/Line","chartx/utils/tools"],function(a,b,c){var d=function(a,b){this.graphw=0,this.graphh=0,this.yAxisW=0,this.w=0,this.h=0,this.disY=1,this.dis=6,this.line={enabled:1,width:1,height:4,strokeStyle:"#cccccc"},this.text={dis:0,fillStyle:"#999999",fontSize:13,rotation:0,format:null,textAlign:null},this.maxTxtH=0,this.pos={x:null,y:null},this.enabled=1,this.disXAxisLine=6,this.disOriginX=0,this.xGraphsWidth=0,this.dataOrg=[],this.dataSection=[],this.data=[],this.layoutData=[],this.sprite=null,this._textMaxWidth=0,this.leftDisX=0,this.filter=null,this.init(a,b)};return d.prototype={init:function(b,c){this.dataOrg=c.org,b&&_.deepExtend(this,b),0==this.dataSection.length&&(this.dataSection=this._initDataSection(this.dataOrg)),this.line.enabled||(this.line.height=1),this.sprite=new a.Display.Sprite({id:"xAxisSprite"}),this._getTextMaxWidth(),this._checkText()},_initDataSection:function(a){return _.flatten(a)},setX:function(a){this.sprite.context.x=a},setY:function(a){this.sprite.context.y=a},draw:function(a){this._initConfig(a),this.data=this._trimXAxis(this.dataSection,this.xGraphsWidth),this._trimLayoutData(),this.setX(this.pos.x),this.setY(this.pos.y),this.enabled&&(this._widget(),this.text.rotation||this._layout())},_initConfig:function(a){a&&_.deepExtend(this,a),this.yAxisW=Math.max(this.yAxisW,this.leftDisX),this.w=this.graphw-this.yAxisW,null==this.pos.x&&(this.pos.x=this.yAxisW+this.disOriginX),null==this.pos.y&&(this.pos.y=this.graphh-this.h),this.xGraphsWidth=this.w-this._getXAxisDisLine(),this.disOriginX=parseInt((this.w-this.xGraphsWidth)/2)},_trimXAxis:function(a,b){for(var c=[],d=b/(a.length+1),e=0,f=a.length;f>e;e++){var g={content:a[e],x:parseInt(d*(e+1))};c.push(g)}return c},_getXAxisDisLine:function(){var a=this.disXAxisLine,b=2*a,c=a;return c=a+this.w%this.dataOrg.length,c=c>b?b:c,c=isNaN(c)?0:c},_checkText:function(){if(this.enabled){var b=new a.Display.Text(this.dataSection[0]||"test",{context:{fontSize:this.text.fontSize}});this.maxTxtH=b.getTextHeight(),this.text.rotation?this.text.rotation%90==0?(this.h=this._textMaxWidth,this.leftDisX=b.getTextHeight()/2):(this.h=Math.sin(Math.abs(this.text.rotation)*Math.PI/180)*this._textMaxWidth,this.h+=b.getTextHeight(),this.leftDisX=Math.cos(Math.abs(this.text.rotation)*Math.PI/180)*b.getTextWidth()+8):(this.h=this.disY+this.line.height+this.dis+this.maxTxtH,this.leftDisX=b.getTextWidth()/2)}else this.dis=0,this.h=1},_getFormatText:function(a){return _.isFunction(this.text.format)?this.text.format(a):a},_widget:function(){for(var d=this.layoutData,e=0,f=d.length;f>e;e++){var g=new a.Display.Sprite({id:"xNode"+e}),h=d[e],i=h.x,j=this.disY+this.line.height+this.dis,k=h.content;k=_.isFunction(this.text.format)?this.text.format(k):c.numAddSymbol(k);var l=new a.Display.Text(k,{context:{x:i,y:j,fillStyle:this.text.fillStyle,fontSize:this.text.fontSize,rotation:-Math.abs(this.text.rotation),textAlign:this.text.textAlign||(this.text.rotation?"right":"center"),textBaseline:this.text.rotation?"middle":"top"}});if(g.addChild(l),this.text.rotation&&(l.context.x+=5,l.context.y+=3),this.line.enabled){var m=new b({context:{xStart:i,yStart:this.disY,xEnd:i,yEnd:this.line.height+this.disY,lineWidth:this.line.width,strokeStyle:this.line.strokeStyle}});g.addChild(m)}_.isFunction(this.filter)&&this.filter({layoutData:d,index:e,txt:l,line:m||null}),this.sprite.addChild(g)}},_layout:function(){if(0!=this.sprite.getNumChildren()){var a=this.sprite.getChildAt(this.sprite.getNumChildren()-1).getChildAt(0);a&&Number(a.context.x+Number(a.getTextWidth()))>this.w&&(a.context.x=parseInt(this.w-a.getTextWidth()))}},_getTextMaxWidth:function(){for(var b=this.dataSection,c=b[0],d=0,e=b.length;e>d;d++)b[d].length>c.length&&(c=b[d]);var f=new a.Display.Text(c||"test",{context:{fillStyle:this.text.fillStyle,fontSize:this.text.fontSize}});return this._textMaxWidth=f.getTextWidth(),this._textMaxWidth},_trimLayoutData:function(){if(this.text.rotation)return void(this.layoutData=this.data);for(var a=[],b=this.data,c=Math.min(Math.floor(this.w/this._textMaxWidth),b.length),d=Math.max(Math.ceil(b.length/c-1),0),e=0;c>e;e++){var f=b[e+d*e];f&&a.push(f)}this.layoutData=a}},d});