define("chartx/components/yaxis/yAxis",["canvax/index","canvax/core/Base","canvax/shape/Line","chartx/utils/tools","chartx/utils/datasection"],function(a,b,c,d,e){var f=function(a,b,c){this.w=0,this.enabled=1,this.dis=6,this.maxW=0,this.field=null,this.label="",this._label=null,this.line={enabled:1,width:4,lineWidth:1,strokeStyle:"#cccccc"},this.text={fillStyle:"#999",fontSize:12,format:null,rotation:0},this.pos={x:0,y:0},this.place="left",this.biaxial=!1,this.layoutData=[],this.dataSection=[],this.dataOrg=[],this.sprite=null,this.disYAxisTopLine=6,this.yMaxHeight=0,this.yGraphsHeight=0,this.baseNumber=null,this.basePoint=null,this.filter=null,this.isH=!1,this.animation=!0,this.sort=null,this.init(a,b,c)};return f.prototype={init:function(b,c,d){_.deepExtend(this,b),0!=this.text.rotation&&this.text.rotation%90==0&&(this.isH=!0),this._initData(c,d),this.sprite=new a.Display.Sprite},setX:function(a){this.sprite.context.x=a+("left"==this.place?this.maxW:0),this.pos.x=a},setY:function(a){this.sprite.context.y=a,this.pos.y=a},setAllStyle:function(a){_.each(this.sprite.children,function(b){_.each(b.children,function(b){"text"==b.type?b.context.fillStyle=a:"line"==b.type&&(b.context.strokeStyle=a)})})},resetData:function(a,b){b&&_.deepExtend(this,b),this.sprite.removeAllChildren(),this.dataSection=[],this._initData(a),this._trimYAxis(),this._widget()},update:function(a,b){this.sprite.removeAllChildren(),this.dataSection=[],_.deepExtend(this,a),this._initData(b),this._trimYAxis(),this._widget()},_getLabel:function(){this.label&&""!=this.label&&(this._label=new a.Display.Text(this.label,{context:{fontSize:this.text.fontSize,textAlign:"left",textBaseline:this.isH?"top":"bottom",fillStyle:this.text.fillStyle,rotation:this.isH?-90:0}}))},draw:function(a){this.sprite.removeAllChildren(),a&&_.deepExtend(this,a),this._getLabel(),this.yGraphsHeight=this.yMaxHeight-this._getYAxisDisLine(),this._label&&(this.isH?this.yGraphsHeight-=this._label.getTextWidth():this.yGraphsHeight-=this._label.getTextHeight(),this._label.context.y=-this.yGraphsHeight-5),this._trimYAxis(),this._widget(),this.setX(this.pos.x),this.setY(this.pos.y)},tansValToPos:function(a){var b=this.dataSection[this.dataSection.length-1],c=-(a-this._bottomNumber)/(b-this._bottomNumber)*this.yGraphsHeight;return c=isNaN(c)?0:parseInt(c)},_trimYAxis:function(){for(var a=this.dataSection[this.dataSection.length-1],b=[],c=0,d=this.dataSection.length;d>c;c++)b[c]={content:this.dataSection[c],y:this.tansValToPos(this.dataSection[c])};this.layoutData=b;var e=-(this.baseNumber-this._bottomNumber)/(a-this._bottomNumber)*this.yGraphsHeight;e=isNaN(e)?0:parseInt(e),this.basePoint={content:this.baseNumber,y:e}},_getYAxisDisLine:function(){var a=this.disYAxisTopLine,b=2*a,c=a;return c=a+this.yMaxHeight%this.dataSection.length,c=c>b?b:c},_setDataSection:function(a){var b=[],c=a.org||a.data;this.biaxial?"left"==this.place?(b=_.flatten(c[0]),this.field=_.flatten([this.field[0]])):(b=_.flatten(c[1]),this.field=_.flatten([this.field[1]])):b=_.flatten(c);for(var d=0,e=b.length;e>d;d++)b[d]=Number(b[d]);return b},_initData:function(a,b){var c=this._setDataSection(a,b);if(this.dataOrg=a.org||a.data,0==this.dataSection.length&&(this.dataSection=e.section(c,3)),0==this.dataSection.length&&(this.dataSection=[0]),this.sort){var d="asc";if(_.isString(this.sort)&&(d=this.sort),_.isArray(this.sort)){var f=0;"right"==this.place&&(f=1),this.sort[f]&&(d=this.sort[f])}"desc"==d&&this.dataSection.reverse()}this._bottomNumber=this.dataSection[0],null==this.baseNumber&&(this.baseNumber=this._bottomNumber>0?this._bottomNumber:0)},resetWidth:function(a){var b=this;b.w=a,b.line.enabled?b.sprite.context.x=a-b.dis-b.line.width:b.sprite.context.x=a-b.dis},_widget:function(){var e=this;if(!e.enabled)return void(e.w=0);var f=this.layoutData;e.maxW=0,e._label&&e.sprite.addChild(e._label);for(var g=0,h=f.length;h>g;g++){var i=f[g],j=0,k=i.y,l=i.content;l=_.isFunction(e.text.format)?e.text.format(l,e):d.numAddSymbol(l);var m=new a.Display.Sprite({id:"yNode"+g}),n="left"==e.place?"right":"left";(90==e.text.rotation||-90==e.text.rotation)&&(n="center",g==f.length-1&&(n="right"));var o=k+(0==g?-3:0)+(g==f.length-1?3:0);(90==e.text.rotation||-90==e.text.rotation)&&(g==f.length-1&&(o=k-2),0==g&&(o=k));var p=new a.Display.Text(l,{id:"yAxis_txt_"+b.getUID(),context:{x:j+("left"==e.place?-5:5),y:o+20,fillStyle:e.text.fillStyle,fontSize:e.text.fontSize,rotation:-Math.abs(this.text.rotation),textAlign:n,textBaseline:"middle",globalAlpha:0}});if(m.addChild(p),e.maxW=Math.max(e.maxW,p.getTextWidth()),(90==e.text.rotation||-90==e.text.rotation)&&(e.maxW=Math.max(e.maxW,p.getTextHeight())),e.line.enabled){var q=new c({context:{x:0+("left"==e.place?1:-1)*e.dis-2,y:k,xEnd:e.line.width,yEnd:0,lineWidth:e.line.lineWidth,strokeStyle:e.line.strokeStyle}});m.addChild(q)}_.isFunction(e.filter)&&e.filter({layoutData:e.layoutData,index:g,txt:p,line:q}),e.sprite.addChild(m),e.animation?p.animate({globalAlpha:1,y:p.context.y-20},{duration:500,easing:"Back.Out",delay:80*g,id:p.id}):(p.context.y=p.context.y-20,p.context.globalAlpha=1)}e.maxW+=e.dis,e.line.enabled?e.w=e.maxW+e.dis+e.line.width+e.pos.x:e.w=e.maxW+e.dis+e.pos.x}},f});