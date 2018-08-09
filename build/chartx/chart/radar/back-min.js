define("chartx/chart/radar/back",["canvax/index","canvax/shape/Isogon","canvax/shape/Circle","canvax/shape/Line"],function(a,b,c,d){var e=function(a){this.pos={x:0,y:0},this.r=0,this.yDataSection=[],this.xDataSection=[],this.strokeStyle="#e5e5e5",this.lineWidth=1,this.sprite=null,this.guidType="spider",this.outerPointList=[],this.init(a)};return e.prototype={init:function(b){_.deepExtend(this,b),this.sprite=new a.Display.Sprite({id:"back"})},draw:function(a){_.deepExtend(this,a),this._widget()},setPosition:function(a,b){var c=this.sprite.context;c.x=a,c.y=b},_widget:function(){var a=this.r,e=this.sprite,f=this.yDataSection;1==f.length&&0==f[0]&&f.push(1);for(var g=_.min(f),h=_.max(f),i=0,j=f.length;j>i;i++){var k=(f[i]-g)/(h-g);if(0!=k){var l;if(l="spider"==this.guidType?new b({id:"ring_isogon_"+i,context:{x:a,y:a,r:this.r*k,n:this.xDataSection.length,strokeStyle:this.strokeStyle,lineWidth:this.lineWidth,fillStyle:"RGBA(0,0,0,0)"}}):new c({id:"ring_circle_"+i,context:{x:a,y:a,r:this.r*k,strokeStyle:this.strokeStyle,lineWidth:this.lineWidth,fillStyle:"RGBA(0,0,0,0)"}}),i==j-1){l.hover(function(){},function(){}),l.on("mousemove",function(){}),l.on("click tap",function(){});var m=l.getRect(),n=e.context;if(n.width=m.width,n.height=m.height,"spider"==this.guidType)this.outerPointList=l.context.pointList;else for(var o=f.length,p=2*Math.PI/o,q=-Math.PI/2,r=q,i=0,s=o;s>i;i++)this.outerPointList.push([a*Math.cos(r),a*Math.sin(r)]),r+=p}e.addChild(l)}}for(var t=0,u=this.outerPointList.length;u>t;t++){var v=new d({id:"line_"+t,context:{xStart:a,yStart:a,xEnd:this.outerPointList[t][0]+a,yEnd:this.outerPointList[t][1]+a,lineWidth:this.lineWidth,strokeStyle:this.strokeStyle}});e.addChild(v)}}},e});