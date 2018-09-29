define("utils/dispatch",[],function(n,r,t){"use strict";r.__esModule=!0;var e={value:function(){}};function i(){for(var n,r=0,t=arguments.length,e={};r<t;++r){if(!(n=arguments[r]+"")||n in e)throw new Error("illegal type: "+n);e[n]=[]}return new o(e)}function o(n){this._=n}function l(n,r){for(var t,e=0,i=n.length;e<i;++e)if((t=n[e]).name===r)return t.value}function a(n,r,t){for(var i=0,o=n.length;i<o;++i)if(n[i].name===r){n[i]=e,n=n.slice(0,i).concat(n.slice(i+1));break}return null!=t&&n.push({name:r,value:t}),n}o.prototype=i.prototype={constructor:o,on:function(n,r){var t,e,i=this._,o=(e=i,(n+"").trim().split(/^|\s+/).map(function(n){var r="",t=n.indexOf(".");if(t>=0&&(r=n.slice(t+1),n=n.slice(0,t)),n&&!e.hasOwnProperty(n))throw new Error("unknown type: "+n);return{type:n,name:r}})),f=-1,u=o.length;if(!(arguments.length<2)){if(null!=r&&"function"!=typeof r)throw new Error("invalid callback: "+r);for(;++f<u;)if(t=(n=o[f]).type)i[t]=a(i[t],n.name,r);else if(null==r)for(t in i)i[t]=a(i[t],n.name,null);return this}for(;++f<u;)if((t=(n=o[f]).type)&&(t=l(i[t],n.name)))return t},copy:function(){var n={},r=this._;for(var t in r)n[t]=r[t].slice();return new o(n)},call:function(n,r){if((t=arguments.length-2)>0)for(var t,e,i=new Array(t),o=0;o<t;++o)i[o]=arguments[o+2];if(!this._.hasOwnProperty(n))throw new Error("unknown type: "+n);for(o=0,t=(e=this._[n]).length;o<t;++o)e[o].value.apply(r,i)},apply:function(n,r,t){if(!this._.hasOwnProperty(n))throw new Error("unknown type: "+n);for(var e=this._[n],i=0,o=e.length;i<o;++i)e[i].value.apply(r,t)}},r.default=i});