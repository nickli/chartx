define("chartx/utils/simple-data-format",["chartx/utils/tools"],function(a){return function(b,c){var d={org:[],data:{},fields:[]};if(!b||0==b.length)return d;b.length>0&&!_.isArray(b[0])&&(b=a.parse2MatrixData(b)),d.org=_.clone(b);var e=b.shift(0);_.each(e,function(a,c){var e=[];_.each(b,function(a){e.push(a[c])}),d.data[a]=e});var f=[];return f=c&&c.field?c.field:e,d.fields=f,d}});