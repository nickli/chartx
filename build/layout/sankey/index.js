define("layout/sankey/index",[],function(n,t,r){"use strict";t.__esModule=!0,t.default=function(){var n={},t=24,r=8,e=[1,1],u=[],o=[];function i(n,t){var r,e=0,u=n.length,o=-1;if(1===arguments.length)for(;++o<u;)isNaN(r=+n[o])||(e+=r);else for(;++o<u;)isNaN(r=+t.call(n,n[o],o))||(e+=r);return e}function f(n,t){var r,e,u=-1,o=n.length;if(1===arguments.length){for(;++u<o&&(null==(r=n[u])||r!=r);)r=void 0;for(;++u<o;)null!=(e=n[u])&&r>e&&(r=e)}else{for(;++u<o&&(null==(r=t.call(n,n[u],u))||r!=r);)r=void 0;for(;++u<o;)null!=(e=t.call(n,n[u],u))&&r>e&&(r=e)}return r}n.nodeWidth=function(r){return arguments.length?(t=+r,n):t},n.nodePadding=function(t){return arguments.length?(r=+t,n):r},n.nodes=function(t){return arguments.length?(u=t,n):u},n.links=function(t){return arguments.length?(o=t,n):o},n.size=function(t){return arguments.length?(e=t,n):e},n.layout=function(a){return u.forEach(function(n){n.sourceLinks=[],n.targetLinks=[]}),o.forEach(function(n){var t=n.source,r=n.target;"number"==typeof t&&(t=n.source=u[n.source]),"number"==typeof r&&(r=n.target=u[n.target]),t.sourceLinks.push(n),r.targetLinks.push(n)}),u.forEach(function(n){n.value=Math.max(i(n.sourceLinks,E),i(n.targetLinks,E))}),function(){for(var n,r,o=u,i=0;o.length;)n=[],o.forEach(function(r){r.x=i,r.dx=t,r.sourceLinks.forEach(function(t){n.indexOf(t.target)<0&&n.push(t.target)})}),o=n,++i;(function(n){u.forEach(function(t){t.sourceLinks.length||(t.x=n-1)})})(i),r=(e[0]-t)/(i-1),u.forEach(function(n){n.x*=r})}(),function(n){var t,a=c().key(function(n){return n.x}).sortKeys(g).entries(u).map(function(n){return n.values});t=f(a,function(n){return(e[1]-(n.length-1)*r)/i(n,E)}),a.forEach(function(n){n.forEach(function(n,r){n.y=r,n.dy=n.value*t})}),o.forEach(function(n){n.dy=n.value*t}),y();for(var s=1;n>0;--n)h(s*=.99),y(),l(s),y();function l(n){function t(n){return d(n.source)*n.value}a.forEach(function(r,e){r.forEach(function(r){if(r.targetLinks.length){var e=i(r.targetLinks,t)/i(r.targetLinks,E);r.y+=(e-d(r))*n}})})}function h(n){function t(n){return d(n.target)*n.value}a.slice().reverse().forEach(function(r){r.forEach(function(r){if(r.sourceLinks.length){var e=i(r.sourceLinks,t)/i(r.sourceLinks,E);r.y+=(e-d(r))*n}})})}function y(){a.forEach(function(n){var t,u,o,i=0,f=n.length;for(n.sort(v),o=0;o<f;++o)t=n[o],(u=i-t.y)>0&&(t.y+=u),i=t.y+t.dy+r;if((u=i-r-e[1])>0)for(i=t.y-=u,o=f-2;o>=0;--o)t=n[o],(u=t.y+t.dy+r-i)>0&&(t.y-=u),i=t.y})}function v(n,t){return n.y-t.y}}(a),k(),n},n.relayout=function(){return k(),n},n.link=function(){var n=.5;function t(t){var r,e,u=t.source.x+t.source.dx,o=t.target.x,i=(r=+(r=u),e=+(e=o),function(n){return r*(1-n)+e*n}),f=i(n),c=i(1-n),a=t.source.y+t.sy,s=t.target.y+t.ty,l=t.dy;l<1&&(l=1);var h="M"+u+","+a+"C"+f+","+a+" "+c+","+s+" "+o+","+s;return h+="v"+l,h+="C"+c+","+(s+l)+" "+f+","+(a+l)+" "+u+","+(a+l),h+="v"+-l+"z"}return t.curvature=function(r){return arguments.length?(n=+r,t):n},t};var c=function(){var n,t,r={},e=[],u=[];function o(u,i,f){if(f>=e.length)return t?t.call(r,i):n?i.sort(n):i;for(var c,a,l,h,y=-1,v=i.length,g=e[f++],k=new s;++y<v;)(h=k.get(c=g(a=i[y])))?h.push(a):k.set(c,[a]);return u?(a=u(),l=function(n,t){a.set(n,o(u,t,f))}):(a={},l=function(n,t){a[n]=o(u,t,f)}),k.forEach(l),a}return r.map=function(n,t){return o(t,n,0)},r.entries=function(n){return function n(t,r){if(r>=e.length)return t;var o=[],i=u[r++];return t.forEach(function(t,e){o.push({key:t,values:n(e,r)})}),i?o.sort(function(n,t){return i(n.key,t.key)}):o}(o(a,n,0),0)},r.key=function(n){return e.push(n),r},r.sortKeys=function(n){return u[e.length-1]=n,r},r.sortValues=function(t){return n=t,r},r.rollup=function(n){return t=n,r},r},a=function(n,t){var r=new s;if(n instanceof s)n.forEach(function(n,t){r.set(n,t)});else if(Array.isArray(n)){var e,u=-1,o=n.length;if(1===arguments.length)for(;++u<o;)r.set(u,n[u]);else for(;++u<o;)r.set(t.call(n,e=n[u],u),e)}else for(var i in n)r.set(i,n[i]);return r};function s(){this._=Object.create(null)}var l="__proto__",h="\0";function y(n){return(n+="")===l||n[0]===h?h+n:n}function v(n){return(n+="")[0]===h?n.slice(1):n}function g(n,t){return n<t?-1:n>t?1:n>=t?0:NaN}function k(){function n(n,t){return n.source.y-t.source.y}function t(n,t){return n.target.y-t.target.y}u.forEach(function(r){r.sourceLinks.sort(t),r.targetLinks.sort(n)}),u.forEach(function(n){var t=0,r=0;n.sourceLinks.forEach(function(n){n.sy=t,t+=n.dy}),n.targetLinks.forEach(function(n){n.ty=r,r+=n.dy})})}function d(n){return n.y+n.dy/2}function E(n){return n.value}return function(n,t){if(Object.defineProperty)for(var r in t)Object.defineProperty(n.prototype,r,{value:t[r],enumerable:!1});else _.extend(n.prototype,t)}(s,{has:function(n){return y(n)in this._},get:function(n){return this._[y(n)]},set:function(n,t){return this._[y(n)]=t},remove:function(n){return(n=y(n))in this._&&delete this._[n]},keys:function(){var n=[];for(var t in this._)n.push(v(t));return n},values:function(){var n=[];for(var t in this._)n.push(this._[t]);return n},entries:function(){var n=[];for(var t in this._)n.push({key:v(t),value:this._[t]});return n},size:function(){var n=0;for(var t in this._)++n;return n},empty:function(){for(var n in this._)return!1;return!0},forEach:function(n){for(var t in this._)n.call(this,v(t),this._[t])}}),n}});