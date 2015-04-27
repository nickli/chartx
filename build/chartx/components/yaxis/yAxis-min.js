define("chartx/components/yaxis/yAxis",["canvax/index","canvax/shape/Line","chartx/utils/tools","chartx/utils/datasection"],function(a,b,c,d){var e=function(a,b){this.w=0,this.enabled=1,this.dis=6,this.line={enabled:1,width:6,height:3,strokeStyle:"#BEBEBE"},this.text={fillStyle:"#999999",fontSize:12,textAlign:"right",format:null},this.layoutData=[],this.dataSection=[],this.dataOrg=[],this.sprite=null,this.x=0,this.y=0,this.disYAxisTopLine=6,this.yMaxHeight=0,this.yGraphsHeight=0,this.baseNumber=null,this.basePoint=null,this.filter=null,this.init(a,b)};return e.prototype={init:function(b,c){_.deepExtend(this,b),this._initData(c),this.sprite=new a.Display.Sprite},setX:function(a){this.sprite.context.x=a},setY:function(a){this.sprite.context.y=a},update:function(a,b){this.sprite.removeAllChildren(),this.dataSection=[],_.deepExtend(this,a),this._initData(b),this.draw()},draw:function(a){a&&_.deepExtend(this,a),this.yGraphsHeight=this.yMaxHeight-this._getYAxisDisLine(),this.setX(this.pos.x),this.setY(this.pos.y),this._trimYAxis(),this._widget()},_trimYAxis:function(){for(var a=this.dataSection[this.dataSection.length-1],b=[],c=0,d=this.dataSection.length;d>c;c++){var e=-(this.dataSection[c]-this._bottomNumber)/(a-this._bottomNumber)*this.yGraphsHeight;e=isNaN(e)?0:parseInt(e),b[c]={content:this.dataSection[c],y:e}}this.layoutData=b;var f=-(this.baseNumber-this._bottomNumber)/(a-this._bottomNumber)*this.yGraphsHeight;f=isNaN(f)?0:parseInt(f),this.basePoint={content:this.baseNumber,y:f}},_getYAxisDisLine:function(){var a=this.disYAxisTopLine,b=2*a,c=a;return c=a+this.yMaxHeight%this.dataSection.length,c=c>b?b:c},_initData:function(a){var b=_.flatten(a.org);this.dataOrg=a.org,0==this.dataSection.length&&(this.enabled||b.unshift(0),this.dataSection=d.section(b,3)),this._bottomNumber=this.dataSection[0],1==b.length&&(this.dataSection[0]=2*b[0],this._bottomNumber=0),null==this.baseNumber&&(this.baseNumber=this._bottomNumber>0?this._bottomNumber:0)},resetWidth:function(a){var b=this;b.w=a,b.line.enabled?b.sprite.context.x=a-b.dis-b.line.width:b.sprite.context.x=a-b.dis},_widget:function(){var d=this;if(!d.enabled)return void(d.w=0);for(var e=this.layoutData,f=0,g=0,h=e.length;h>g;g++){var i=e[g],j=0,k=i.y,l=i.content;l=_.isFunction(d.text.format)?d.text.format(l):c.numAddSymbol(l);var m=new a.Display.Sprite({id:"yNode"+g}),n=new a.Display.Text(l,{context:{x:j,y:k,fillStyle:d.text.fillStyle,fontSize:d.text.fontSize,textAlign:d.text.textAlign,textBaseline:"middle"}});if(m.addChild(n),f=Math.max(f,n.getTextWidth()),d.line.enabled){var o=new b({context:{x:0+d.dis,y:k,xEnd:d.line.width,yEnd:0,lineWidth:d.line.height,strokeStyle:d.line.strokeStyle}});m.addChild(o)}_.isFunction(d.filter)&&d.filter({layoutData:d.dataSection,index:g,txt:n,line:o}),d.sprite.addChild(m)}f+=d.dis,d.sprite.context.x=f,d.line.enabled?d.w=f+d.dis+d.line.width:d.w=f+d.dis}},e});