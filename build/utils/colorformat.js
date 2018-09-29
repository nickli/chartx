define("utils/colorformat",[],function(r,t,e){"use strict";t.__esModule=!0;var n=/^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/,a=function(r){var t=r.toLowerCase();if(t&&n.test(t)){if(4===t.length){for(var e="#",a=1;a<4;a+=1)e+=t.slice(a,a+1).concat(t.slice(a,a+1));t=e}var o=[];for(a=1;a<7;a+=2)o.push(parseInt("0x"+t.slice(a,a+2)));return"RGB("+o.join(",")+")"}return t};t.default={colorRgb:a,colorRgba:function(r,t){return a(r).replace(")",","+t+")").replace("RGB","RGBA")},colorHex:function(r){var t=r;if(/^(rgb|RGB)/.test(t)){for(var e=t.replace(/(?:||rgb|RGB)*/g,"").split(","),a="#",o=0;o<e.length;o++){var i=Number(e[o]).toString(16);"0"===i&&(i+=i),a+=i}return 7!==a.length&&(a=t),a}if(!n.test(t))return t;var l=t.replace(/#/,"").split("");if(6===l.length)return t;if(3===l.length){var u="#";for(o=0;o<l.length;o+=1)u+=l[o]+l[o];return u}},colorBrightness:function(r,t){(r=String(r).replace(/[^0-9a-f]/gi,"")).length<6&&(r=r.replace(/(.)/g,"$1$1")),t=t||0;for(var e,n="#",a=0;a<3;++a)e=parseInt(r.substr(2*a,2),16),n+=("00"+(e=Math.round(Math.min(Math.max(0,e+e*t),255)).toString(16))).substr(e.length);return n},hslToRgb:function(r,t,e){var n,a,o;if(0==t)n=a=o=e;else{var i=function(r,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?r+6*(t-r)*e:e<.5?t:e<2/3?r+(t-r)*(2/3-e)*6:r},l=e<.5?e*(1+t):e+t-e*t,u=2*e-l;n=i(u,l,r+1/3),a=i(u,l,r),o=i(u,l,r-1/3)}return[Math.round(255*n),Math.round(255*a),Math.round(255*o)]},rgbToHsl:function(r,t,e){r/=255,t/=255,e/=255;var n,a,o=Math.max(r,t,e),i=Math.min(r,t,e),l=(o+i)/2;if(o==i)n=a=0;else{var u=o-i;switch(a=l>.5?u/(2-o-i):u/(o+i),o){case r:n=(t-e)/u+(t<e?6:0);break;case t:n=(e-r)/u+2;break;case e:n=(r-t)/u+4}n/=6}return[n,a,l]}}});