define("layout/utils/rebind",[],function(n,t,u){"use strict";function e(n,t,u){return function(){var e=u.apply(t,arguments);return e===t?n:e}}t.__esModule=!0,t.default=function(n,t){for(var u,r=1,i=arguments.length;++r<i;)n[u=arguments[r]]=e(n,t,t[u]);return n}});