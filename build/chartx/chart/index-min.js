define("chartx/chart/index",["canvax/index","canvax/core/Base"],function(a,b){var c=function(c,d,e){_&&!_.deepExtend&&b.setDeepExtend(),this.el=b.getEl(c),this.width=parseInt(this.el.offsetWidth),this.height=parseInt(this.el.offsetHeight),this.padding={top:10,right:10,bottom:10,left:10},this.canvax=new a({el:this.el}),this.stage=new a.Display.Stage({id:"main-chart-stage"+(new Date).getTime()}),this.canvax.addChild(this.stage),arguments.callee.superclass.constructor.apply(this,arguments),this.init.apply(this,arguments)};return c.Canvax=a,c.extend=function(a,c,d){var e=this,f=function(){e.apply(this,arguments),d&&d.apply(this,arguments)};return f.extend=e.extend,b.creatClass(f,e,a,c)},Chartx.extend=b.creatClass,b.creatClass(c,a.Event.EventDispatcher,{inited:!1,init:function(){},dataFrame:null,draw:function(){},destroy:function(){this.clean(),this.el&&this.el.innerHTML="",this._destroy&&this._destroy(),this.fire("destroy")},clean:function(){for(var a=0,b=this.canvax.children.length;b>a;a++)for(var c=this.canvax.getChildAt(a),d=0,e=c.children.length;e>d;d++)c.getChildAt(d).destroy(),d--,e--},resize:function(){this.clean(),this.width=parseInt(this.el.offsetWidth),this.height=parseInt(this.el.offsetHeight),this.canvax.resize(),this.inited=!1,this.draw({resize:!0}),this.inited=!0},reset:function(a){this._reset&&this._reset(a);var b=this.dataFrame.org||[];a&&a.options&&_.deepExtend(this,a.options),a&&a.data&&(b=a.data),b&&this.resetData(b),this.clean(),this.canvax.getDomContainer().innerHTML="",this.draw()},resetData:function(a){this.dataFrame=this._initData(a)},_rotate:function(a){var b=this.width,c=this.height;this.width=c,this.height=b;var d=this;_.each(d.stage.children,function(e){e.context.rotation=a||-90,e.context.x=(b-c)/2,e.context.y=(c-b)/2,e.context.rotateOrigin.x=d.width*e.context.$model.scaleX/2,e.context.rotateOrigin.y=d.height*e.context.$model.scaleY/2})},_initData:function(a){return a}}),c});