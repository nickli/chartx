const _pkg = require('./package.json');

const gulp = require('gulp');
const babel = require('gulp-babel');
const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');

const colors = require('colors-console');
const clean = require('gulp-clean');

const uglify = require('gulp-uglify');
const pipeline = require('readable-stream').pipeline;
const rename = require('gulp-rename')

const replace = require('gulp-string-replace');

let time = new Date().getTime();
let _srcPath = "src/**/*.js";

let cleanHandle = ()=>{
    return gulp.src('dist/**/*.js', {read: false})
    .pipe(clean());
};

let babelHandle = ( _src = _srcPath ) => {
    return gulp.src( _src ,{ buffer: true, read: true, base: './src/' })
    .pipe(babel({
        presets: ['@babel/env'],
        plugins: ["@babel/plugin-proposal-class-properties","transform-es2015-modules-umd"]
    }))
    //.pipe(uglify())
    .pipe( gulp.dest('dist') );
};

let versionHandle = () => {
    let version = _pkg.version;
    return gulp.src( ["dist/index.js"] )
    .pipe( replace( '__VERSION__', version ) )
    .pipe( gulp.dest("dist/") )
};

let copyMMVis = ()=>{
    return gulp.src( [ './node_modules/mmvis/dist/index_iife.js' ] ).pipe( gulp.dest('dist/mmvis') )
};
let copyCanvax = ()=>{
    return gulp.src( [ './node_modules/canvax/dist/index_iife.js' ] ).pipe( gulp.dest('dist/canvax') )
};

let stuffZero = ( num = 0 ) => {
    if( num < 10 ){
        return "0"+num
    } else {
        return num;
    }
}

let timeStr = ( time = new Date().getTime() ) => {
    let _t = new Date( time );
    return stuffZero(_t.getHours())+":"+stuffZero(_t.getMinutes())+":"+stuffZero(_t.getSeconds());
}

let timeWait = ( mt = 0 ) => {
    var str;
    if( mt < 1000 ) str = mt+" ms";
    if( mt > 1000 ) str = (mt/1000).toFixed(3)+" s";
    return colors(mt<6000?'green':'red', str);
}

//task babel
let babelSrc = ()=>{
    return babelHandle();
};

let rollupNum = 0;
//task rollup
let rollupDist = ()=>{
    let inputOptions = {
        input: './dist/index.js',
        plugins: [
            resolve({ mainFields:['module', 'main'], browser: true }), 
            commonjs()
        ]
    };
    
    let outputOptions = [
        {
            file: './dist/chartx.js',
            format: 'iife',
            name: 'Chartx',
            globals: {
                mmvis: 'mmvis',
                canvax: 'canvax'
            }
        }
    ];
    //TODO后面会判断，如果发布上线的时候才把这个es模块和umd模块提交上去
    outputOptions = outputOptions.concat([{
        file: './dist/chartx.es.js',
        format: 'es',
        name: 'Chartx',
        globals: {
            mmvis: 'mmvis',
            canvax: 'canvax'
        }
    },
    {
        file: './dist/chartx.umd.js',
        format: 'umd',
        name: 'Chartx',
        globals: {
            mmvis: 'mmvis',
            canvax: 'canvax'
        }
    }]);
   

    return new Promise( resolve => {
        const watcher = rollup.watch({
            ...inputOptions,
            output: outputOptions,
            watch: {
              include : './dist/**/*.js',
              exclude : './dist/chartx.js'
            }
        });

        watcher.on('event', event => {
            if( event.code == 'ERROR' ){
                console.log( event )
            }
            //console.log( event.code )
            //event.code 会是下面其中一个：
            //START        — 监听器正在启动（重启）
            //BUNDLE_START — 构建单个文件束
            //BUNDLE_END   — 完成文件束构建
            //END          — 完成所有文件束构建
            //ERROR        — 构建时遇到错误
            //FATAL        — 遇到无可修复的错误
            if( event.code == "BUNDLE_START" ){
                time = new Date().getTime();
            };
            if( event.code == 'BUNDLE_END' ){
                if( rollupNum ){
                    console.log(`[${colors('grey',timeStr(time))}] rollup after ${timeWait(new Date().getTime() - time)}`)
                    console.log('watching...');
                };
                rollupNum++;

                pipeline(
                    gulp.src(['./dist/chartx.js']),
                    uglify(),
                    rename({ suffix: '.min' }),
                    gulp.dest('dist'),
                    (err)=>{
                        if( err ) console.log(err);
                        resolve( event );
                    }
                );

                //resolve( event );

            };
            
        });
    } )
};

//task watch to babel
let watchSrc = () => {
    console.log('watching...');
    const watcher = gulp.watch([ _srcPath ]);
    watcher.on('change', async function(path, stats) {
        let newTime = new Date().getTime();
        if( newTime - time < 300 ){
            return;
        };
        time = newTime;
        console.log(`[${colors('grey',timeStr(time))}] File ${path} was changed`);
        await babelHandle( path );
        console.log(`[${colors('grey',timeStr(time))}] babel after ${timeWait(new Date().getTime() - time)}`)
    });
    return watcher;
};

//把mmvis从 node_models 里面copy到本地
exports.default = gulp.series(cleanHandle, gulp.parallel( copyMMVis,copyCanvax ) , babelSrc, versionHandle, rollupDist, watchSrc );