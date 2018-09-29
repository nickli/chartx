define("components/graphs/pie/index",["canvax","./pie","../index"],function(e,t,n){"use strict";var i,a=this&&this.__extends||(i=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])},function(e,t){function n(){this.constructor=e}i(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)});t.__esModule=!0;var s=e("canvax"),o=e("./pie"),r=e("../index"),l=s.default._,d=function(e){function t(t,n){var i=e.call(this,t,n)||this;return i.type="pie",i.field=null,i.sort=null,i.groupField=null,i.node={shapeType:"sector",radius:null,innerRadius:0,outRadius:null,minRadius:10,moveDis:15,fillStyle:null,focus:{enabled:!0},select:{enabled:!1,radius:5,alpha:.7}},i.label={field:null,enabled:!1,format:null},i.startAngle=-90,i.allAngles=360,i.init(t),i}return a(t,e),t.prototype.init=function(e){l.extend(!0,this,e),this.sprite=new s.default.Display.Sprite,this.data=this._dataHandle()},t.prototype._computerProps=function(){var e=this.width,t=this.height;if(!this.node.outRadius){var n=Math.min(e,t)/2;this.label.enabled&&(n-=this.node.moveDis),this.node.outRadius=parseInt(n)}null!==this.node.radius&&l.isNumber(this.node.radius)&&(this.node.radius=Math.max(this.node.radius,this.node.minRadius),this.node.innerRadius=this.node.outRadius-this.node.radius),this.node.outRadius-this.node.innerRadius<this.node.minRadius&&(this.node.innerRadius=this.node.outRadius-this.node.minRadius),this.node.innerRadius<0&&(this.node.innerRadius=0)},t.prototype.draw=function(e){!e&&(e={}),l.extend(!0,this,e),this._computerProps(),this._pie=new o.default(this,this._trimGraphs(this.data)),this._pie.draw(e);var t=this;this.animation&&!e.resize?this._pie.grow(function(){t.fire("complete")}):this.fire("complete"),this.sprite.addChild(this._pie.sprite)},t.prototype.show=function(e){this._setEnabled(e,!0)},t.prototype.hide=function(e){this._setEnabled(e,!1)},t.prototype._setEnabled=function(e,t){l.each(this.data,function(n){if(n.label===e)return n.enabled=t,!1}),this._pie.resetData(this._trimGraphs(this.data))},t.prototype._dataHandle=function(){for(var e=this,t=(e.root._coord,[]),n=e.dataFrame,i=0,a=n.length;i<a;i++){var s=n.getRowData(i),o=e.root.getTheme(i),r={rowData:s,focused:!1,focusEnabled:e.node.focus.enabled,selected:!1,selectEnabled:e.node.select.enabled,selectedR:e.node.select.radius,selectedAlpha:e.node.select.alpha,enabled:!0,fillStyle:o,color:o,value:s[e.field],label:s[e.groupField||e.label.field||e.field],labelText:null,iNode:i};if(l.isFunction(this.node.fillStyle)){var d=this.node.fontColor(r);d||(r.fillStyle=r.color=d)}t.push(r)}return t.length&&e.sort&&(t.sort(function(t,n){return"asc"==e.sort?t.value-n.value:n.value-t.value}),l.each(t,function(e,t){e.iNode=t})),t},t.prototype._trimGraphs=function(e){var t=this,n=0;t.currentAngle=0+t.startAngle%360;var i=t.allAngles+t.startAngle%t.allAngles,a=0,s=0;if(e.length){for(var o=0;o<e.length;o++)if(e[o].enabled&&(n+=e[o].value,t.node.radius&&l.isString(t.node.radius)&&t.node.radius in e[o].rowData)){var r=Number(e[o].rowData[t.node.radius]);a=Math.max(a,r),s=Math.min(s,r)}if(n>0)for(var d=0;d<e.length;d++){var u=e[d].value/n;e[d].enabled||(u=0);var c=+(100*u).toFixed(2),h=t.allAngles*u,p=t.currentAngle+h>i?i:t.currentAngle+h,f=Math.cos((t.currentAngle+h/2)/180*Math.PI),g=Math.sin((t.currentAngle+h/2)/180*Math.PI),b=t.currentAngle+h/2;f=f.toFixed(5),g=g.toFixed(5);var v=function(e){e>=i&&(e=i),e%=t.allAngles;var n=parseInt(e/90);if(e>=0)switch(n){case 0:return 1;case 1:return 2;case 2:return 3;case 3:case 4:return 4}else if(e<0)switch(n){case 0:return 4;case-1:return 3;case-2:return 2;case-3:case-4:return 1}}(b),_=t.node.outRadius;if(t.node.radius&&l.isString(t.node.radius)&&t.node.radius in e[d].rowData){var y=Number(e[d].rowData[t.node.radius]);_=parseInt((t.node.outRadius-t.node.innerRadius)*((y-s)/(a-s))+t.node.innerRadius)}var m=t.node.moveDis;l.extend(e[d],{outRadius:_,innerRadius:t.node.innerRadius,startAngle:t.currentAngle,endAngle:p,midAngle:b,moveDis:m,outOffsetx:.7*m*f,outOffsety:.7*m*g,centerx:_*f,centery:_*g,outx:(_+m)*f,outy:(_+m)*g,edgex:(_+m)*f,edgey:(_+m)*g,orginPercentage:u,percentage:c,quadrant:v,labelDirection:1==v||4==v?1:0,iNode:d}),e[d].labelText=t._getLabelText(e[d]),t.currentAngle+=h,t.currentAngle>i&&(t.currentAngle=i)}}return{list:e,total:n}},t.prototype._getLabelText=function(e){var t;if(this.label.enabled)if(this.label.format)l.isFunction(this.label.format)&&(t=this.label.format(e.label,e));else{var n=this.label.field||this.groupField;t=n?e.rowData[n]+"\uff1a"+e.percentage+"%":e.percentage+"%"}return t},t.prototype.getList=function(){return this.data},t.prototype.getLegendData=function(){var e=[];return l.each(this.data,function(t){e.push({name:t.label,color:t.fillStyle,enabled:t.enabled})}),e},t.prototype.tipsPointerOf=function(e){},t.prototype.tipsPointerHideOf=function(e){},t.prototype.focusAt=function(e){var t=this._pie.data.list[e];this.node.focus.enabled&&this._pie.focusOf(t)},t.prototype.unfocusAt=function(e){var t=this._pie.data.list[e];t.node.focus.enabled&&this._pie.unfocusOf(t)},t.prototype.selectAt=function(e){var t=this._pie.data.list[e];this.node.select.enabled&&this._pie.selectOf(t)},t.prototype.unselectAt=function(e){var t=this._pie.data.list[e];this.node.select.enabled&&this._pie.unselectOf(t)},t}(r.default);t.default=d});