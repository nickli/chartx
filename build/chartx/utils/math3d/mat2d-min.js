define("chartx/utils/math3d/mat2d",["chartx/utils/math3d/common"],function(a){var b={};return b.create=function(){var b=new a.ARRAY_TYPE(6);return b[0]=1,b[1]=0,b[2]=0,b[3]=1,b[4]=0,b[5]=0,b},b.clone=function(b){var c=new a.ARRAY_TYPE(6);return c[0]=b[0],c[1]=b[1],c[2]=b[2],c[3]=b[3],c[4]=b[4],c[5]=b[5],c},b.copy=function(a,b){return a[0]=b[0],a[1]=b[1],a[2]=b[2],a[3]=b[3],a[4]=b[4],a[5]=b[5],a},b.identity=function(a){return a[0]=1,a[1]=0,a[2]=0,a[3]=1,a[4]=0,a[5]=0,a},b.fromValues=function(b,c,d,e,f,g){var h=new a.ARRAY_TYPE(6);return h[0]=b,h[1]=c,h[2]=d,h[3]=e,h[4]=f,h[5]=g,h},b.set=function(a,b,c,d,e,f,g){return a[0]=b,a[1]=c,a[2]=d,a[3]=e,a[4]=f,a[5]=g,a},b.invert=function(a,b){var c=b[0],d=b[1],e=b[2],f=b[3],g=b[4],h=b[5],i=c*f-d*e;return i?(i=1/i,a[0]=f*i,a[1]=-d*i,a[2]=-e*i,a[3]=c*i,a[4]=(e*h-f*g)*i,a[5]=(d*g-c*h)*i,a):null},b.determinant=function(a){return a[0]*a[3]-a[1]*a[2]},b.multiply=function(a,b,c){var d=b[0],e=b[1],f=b[2],g=b[3],h=b[4],i=b[5],j=c[0],k=c[1],l=c[2],m=c[3],n=c[4],o=c[5];return a[0]=d*j+f*k,a[1]=e*j+g*k,a[2]=d*l+f*m,a[3]=e*l+g*m,a[4]=d*n+f*o+h,a[5]=e*n+g*o+i,a},b.mul=b.multiply,b.rotate=function(a,b,c){var d=b[0],e=b[1],f=b[2],g=b[3],h=b[4],i=b[5],j=Math.sin(c),k=Math.cos(c);return a[0]=d*k+f*j,a[1]=e*k+g*j,a[2]=d*-j+f*k,a[3]=e*-j+g*k,a[4]=h,a[5]=i,a},b.scale=function(a,b,c){var d=b[0],e=b[1],f=b[2],g=b[3],h=b[4],i=b[5],j=c[0],k=c[1];return a[0]=d*j,a[1]=e*j,a[2]=f*k,a[3]=g*k,a[4]=h,a[5]=i,a},b.translate=function(a,b,c){var d=b[0],e=b[1],f=b[2],g=b[3],h=b[4],i=b[5],j=c[0],k=c[1];return a[0]=d,a[1]=e,a[2]=f,a[3]=g,a[4]=d*j+f*k+h,a[5]=e*j+g*k+i,a},b.fromRotation=function(a,b){var c=Math.sin(b),d=Math.cos(b);return a[0]=d,a[1]=c,a[2]=-c,a[3]=d,a[4]=0,a[5]=0,a},b.fromScaling=function(a,b){return a[0]=b[0],a[1]=0,a[2]=0,a[3]=b[1],a[4]=0,a[5]=0,a},b.fromTranslation=function(a,b){return a[0]=1,a[1]=0,a[2]=0,a[3]=1,a[4]=b[0],a[5]=b[1],a},b.str=function(a){return"mat2d("+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+")"},b.frob=function(a){return Math.sqrt(Math.pow(a[0],2)+Math.pow(a[1],2)+Math.pow(a[2],2)+Math.pow(a[3],2)+Math.pow(a[4],2)+Math.pow(a[5],2)+1)},b.add=function(a,b,c){return a[0]=b[0]+c[0],a[1]=b[1]+c[1],a[2]=b[2]+c[2],a[3]=b[3]+c[3],a[4]=b[4]+c[4],a[5]=b[5]+c[5],a},b.subtract=function(a,b,c){return a[0]=b[0]-c[0],a[1]=b[1]-c[1],a[2]=b[2]-c[2],a[3]=b[3]-c[3],a[4]=b[4]-c[4],a[5]=b[5]-c[5],a},b.sub=b.subtract,b.multiplyScalar=function(a,b,c){return a[0]=b[0]*c,a[1]=b[1]*c,a[2]=b[2]*c,a[3]=b[3]*c,a[4]=b[4]*c,a[5]=b[5]*c,a},b.multiplyScalarAndAdd=function(a,b,c,d){return a[0]=b[0]+c[0]*d,a[1]=b[1]+c[1]*d,a[2]=b[2]+c[2]*d,a[3]=b[3]+c[3]*d,a[4]=b[4]+c[4]*d,a[5]=b[5]+c[5]*d,a},b.exactEquals=function(a,b){return a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2]&&a[3]===b[3]&&a[4]===b[4]&&a[5]===b[5]},b.equals=function(b,c){var d=b[0],e=b[1],f=b[2],g=b[3],h=b[4],i=b[5],j=c[0],k=c[1],l=c[2],m=c[3],n=c[4],o=c[5];return Math.abs(d-j)<=a.EPSILON*Math.max(1,Math.abs(d),Math.abs(j))&&Math.abs(e-k)<=a.EPSILON*Math.max(1,Math.abs(e),Math.abs(k))&&Math.abs(f-l)<=a.EPSILON*Math.max(1,Math.abs(f),Math.abs(l))&&Math.abs(g-m)<=a.EPSILON*Math.max(1,Math.abs(g),Math.abs(m))&&Math.abs(h-n)<=a.EPSILON*Math.max(1,Math.abs(h),Math.abs(n))&&Math.abs(i-o)<=a.EPSILON*Math.max(1,Math.abs(i),Math.abs(o))},b});