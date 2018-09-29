define("chart",["canvax","./utils/tools","./utils/dataframe","./theme"],function(t,e,i){"use strict";var a,r=this&&this.__extends||(a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i])},function(t,e){function i(){this.constructor=t}a(t,e),t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)});e.__esModule=!0;var n=t("canvax"),o=t("./utils/tools"),s=t("./utils/dataframe"),h=t("./theme"),p=n.default._,c=20,d=function(t){function e(e,i,a){var r=t.call(this,e,i,a)||this;return r.Canvax=n.default,r._node=e,r._data=o.parse2MatrixData(i),r._opt=a,r.el=o.getEl(e),r.width=parseInt(r.el.offsetWidth),r.height=parseInt(r.el.offsetHeight),r.padding={top:c,right:c,bottom:c,left:c},r.canvax=new n.default.App({el:r.el,webGL:!1}),r.canvax.registEvent(),r.id="chartx_"+r.canvax.id,r.el.setAttribute("chart_id",r.id),r.el.setAttribute("chartx_version","2.0"),r.stage=new n.default.Display.Stage({id:"main-chart-stage"}),r.canvax.addChild(r.stage),r.setCoord_Graphs_Sp(),r._graphs=[],r.components=[],r.inited=!1,r.dataFrame=null,r._theme=p.extend([],h.default.colors),r.init.apply(r,arguments),r}return r(e,t),e.prototype.init=function(){},e.prototype.draw=function(){},e.prototype.getTheme=function(t){var e=this._theme;return void 0!=t?e[t%e.length]||"#ccc":e},e.prototype.setCoord_Graphs_Sp=function(){this.coordSprite=new n.default.Display.Sprite({id:"coordSprite"}),this.stage.addChild(this.coordSprite),this.graphsSprite=new n.default.Display.Sprite({id:"graphsSprite"}),this.stage.addChild(this.graphsSprite)},e.prototype.destroy=function(){this._clean(),this.el&&(this.el.removeAttribute("chart_id"),this.el.removeAttribute("chartx_version"),this.canvax.destroy(),this.el=null),this._destroy&&this._destroy(),this.fire("destroy")},e.prototype._clean=function(){for(var t=0,e=this.canvax.children.length;t<e;t++)for(var i=this.canvax.getChildAt(t),a=0,r=i.children.length;a<r;a++)i.getChildAt(a).destroy(),a--,r--;this.setCoord_Graphs_Sp(),this.components=[],this._coord=null,this._graphs=[],this.canvax.domView.innerHTML="",this.padding={top:c,right:c,bottom:c,left:c}},e.prototype.resize=function(){var t=parseInt(this.el.offsetWidth),e=parseInt(this.el.offsetHeight);t==this.width&&e==this.height||(this.width=t,this.height=e,this.canvax.resize(),this.inited=!1,this._clean(),this.draw({resize:!0}),this.inited=!0)},e.prototype.reset=function(t,e){!t&&(t={}),p.extend(!0,this._opt,t),p.extend(!0,this,t),e&&(this._data=o.parse2MatrixData(e)),this.dataFrame=this.initData(this._data,t),this._clean(),this.draw(t)},e.prototype.resetData=function(t,e){t&&(this._data=o.parse2MatrixData(t),this.dataFrame=this.initData(this._data)),this._resetData&&this._resetData(e),this.fire("resetData")},e.prototype.initData=function(){return s.default.apply(this,arguments)},e.prototype.initComponents=function(){var t=this,e=["coord","graphs","theme"];for(var i in this._opt)if(-1==p.indexOf(e,i)){var a=this._opt[i];p.isArray(a)||(a=[a]),p.each(a,function(e){var a=t.componentsMap[i];a&&a.register&&a.register(e,t)})}},e.prototype.componentsReset=function(t){var e=this;p.each(this.components,function(i,a){t&&t.name==i.type||i.plug.reset&&i.plug.reset(e[i.type]||{},e.dataFrame)})},e.prototype.drawComponents=function(){for(var t=0,e=this.components.length;t<e;t++){var i=this.components[t];i.plug&&i.plug.draw&&i.plug.draw(),i.plug.app=this,"once"==i.type&&(this.components.splice(t,1),t--),e=this.components.length}},e.prototype.getComponentsByType=function(t){var e=[];return p.each(this.components,function(i){i.type==t&&e.push(i.plug)}),e},e.prototype.getComponentById=function(t){var e;return p.each(this.components,function(i){if(i.id==t)return e=i,!1}),e?e.plug:null},e.prototype.getGraphsByType=function(t){var e=[];return p.each(this._graphs,function(i){i.type==t&&e.push(i)}),e},e.prototype.getGraphById=function(t){var e;return p.each(this._graphs,function(i){if(i.id==t)return e=i,!1}),e},e}(n.default.Event.EventDispatcher);e.default=d});