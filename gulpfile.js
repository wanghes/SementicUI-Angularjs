var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var tap = require('gulp-tap');
var babel = require('gulp-babel');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var source = require("vinyl-source-stream");
var cleanCSS = require('gulp-clean-css');
var browserSync = require('browser-sync').create();
var ngmin = require('gulp-ngmin');

var mainBundler = null;

//设置公用库的存放目录
gulp.task('lib', function(){
    gulp.src([
        './src/js/lib/jquery-1.9.1.min.js',
        './src/js/lib/angular.min.js',
        './src/js/lib/semantic.min.js',
        //'./src/js/lib/echarts-all.js',
        './src/js/lib/scrollBar.js',
        './src/js/lib/slideout.js',
        './src/js/lib/pnotify.js',
        './src/js/lib/dateRange.js',
        './src/js/lib/jquery.ztree.all.min.js'
    ], {base: 'src'})
    .pipe(concat('lib.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./www/js'));
});

//设置开发环境html模块的生成路径
gulp.task('htmlDev',function(){
    gulp.src([
        './src/modules/**/**',
        './src/*.html'
    ], {base: 'src'})
    .pipe(gulp.dest('./www/'));
});

//设置fonts字体的生成路径
gulp.task('fonts',function(){
    gulp.src('./src/fonts/**', { base: 'src' }).pipe(gulp.dest('./www/'));
});

//设置fonts字体的生成路径
gulp.task('directives',function(){
    gulp.src('./src/directives/**', { base: 'src' }).pipe(gulp.dest('./www/'));
});

gulp.task('css',function(){
    gulp.src('./src/less/backend.less') //多个文件以数组形式传入
        .pipe(less())
        .pipe(gulp.dest('./www/css'));
});

gulp.task('images',function(){
    gulp.src('./src/images/**',{ base:'src' }) //多个文件以数组形式传入
        .pipe(gulp.dest('./www/'));
});

//设置框架级别的相关js
gulp.task('frameWrapJs',function(){
    browserify({
        entries: ['src/js/frameWrap.js'],
        debug: true,
        cache: {},
        packageCache: {},
        plugin: [watchify]
    })
    .transform(babelify,{ presets: ["es2015"] })
    .bundle()
    .pipe(source('frameWrap.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('www/js'));
});


mainBundler = watchify(browserify({
    entries: ['src/js/main.js'],
    debug: true,
    cache: {},
    packageCache: {}
}).transform(babelify,{
    presets: ["es2015", 'stage-0'],
    plugins: [
        'transform-async-to-generator',
        [
            "transform-runtime",
            {
                "helpers": false,
                "polyfill": false,
                "regenerator": true, // 对async/await的支持
                "moduleName": "babel-runtime"
            }
        ]
    ]
}));

function mainFunc(){
    mainBundler.bundle()
    .on('error', function(err) {
        console.error(err);
        this.emit('end');
    })
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./www/js'))
    .pipe(gulp.dest('www/js'));
}

mainBundler.on('update', function() {
      console.log('-> errorStack::::::::::::::::::::::::::::::::::::::::::::::::\n');
      mainFunc();
 });

gulp.task('mainJs',function(){
    //debug模式可以开启这个compile，平常考虑到速度问题，先暂时注释
    mainFunc();
});
//生产环境输出main.js
gulp.task('mainJsPro',function(){
    mainBundler.bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(ngmin())
    .pipe(uglify({
        mangle: false,//类型：Boolean 默认：true 是否修改变量名
        compress: true//类型：Boolean 默认：true 是否完全压缩
    }).on('error', function(e){
        console.log(e);
     }))
    .pipe(gulp.dest('www/js'));
});

// 用来重启browserSync.reload
gulp.task('reloadBrowser', function (){
    gulp.src('./www/index.manifest')
        .pipe(gulp.dest('./www'))
        .pipe(browserSync.reload({stream: true}));
});

//生产环境直接为www/modules 和www的'.html'文件添加manifest 文件缓存
gulp.task('htmlPro',function(){
    gulp.src('./src/modules/*.html', { base: 'src' })
        .pipe(tap(function(file, t) {
            var contents = file.contents.toString();
            contents = contents.replace(/\<html\s*(ng-app=\".*\")?\s*\>/,'<html $1 manifest="../index.manifest">');
            file.contents = new Buffer(contents);
        }))
        .pipe(gulp.dest('./www/'));
    gulp.src('./src/*.html', { base: 'src' })
        .pipe(tap(function(file, t) {
            var contents = file.contents.toString();
            contents = contents.replace(/\<html\s*(ng-app=\".*\")?\s*\>/,'<html $1 manifest="index.manifest">');
            file.contents = new Buffer(contents);
        }))
        .pipe(gulp.dest('./www/'));
});

gulp.task('cssPro', function() {
    gulp.src('./src/less/backend.less')
        .pipe(less())
        .pipe(cleanCSS())
        .pipe(gulp.dest('./www/css'));
});


// 每次开发完毕发布生产环境重新生成 menifest 文件
gulp.task('manifest', function (){
    gulp.src('./src/index.manifest')
        .pipe(tap(function (file){
            var dir = path.dirname(file.path);
            var contents = file.contents.toString();
            contents = contents.replace(/##([\W\w]+)##/,'##'+ Date.now()+'##');
            file.contents = new Buffer(contents);
        }))
        .pipe(gulp.dest('./www'));
});
//watch 模块的变化 watch源 无需加入相对路径 ‘./’符号，否则不能监听到新建的文件变化
gulp.task('watch', function(){
    gulp.watch(['./src/directives/*.html'],function(){
        runSequence('directives', 'reloadBrowser', function(){});
    });
    gulp.watch(['./src/modules/**/*.html','./src/*.html'],function(){
        runSequence('htmlDev', 'reloadBrowser', function(){});
    });
    gulp.watch('./src/less/**/*.less', function(){
        runSequence('css', 'reloadBrowser', function(){});
    });
    gulp.watch('./src/images/**', function(){
        runSequence('images', 'reloadBrowser', function(){});
    });
    gulp.watch(['./src/js/**/**/**/**', '!src/js/modules/frame/**', '!src/js/frameWrap.js'],function(event){
        runSequence('mainJs', 'reloadBrowser', function(){});
    });
    gulp.watch(['./src/js/modules/frame/**', 'src/js/frameWrap.js'], function(){
        runSequence('frameWrapJs', 'reloadBrowser', function(){});
    });
});

gulp.task('default', ['lib', 'directives', 'fonts', 'images', 'css', 'frameWrapJs', 'htmlDev', 'mainJs', 'watch'], function() {
    gulp.start('server');
});
gulp.task('build', ['lib', 'directives', 'fonts', 'images', 'cssPro', 'frameWrapJs', 'htmlPro', 'mainJsPro', 'manifest'], function() {
    console.log('compile over');
});


gulp.task('server', function() {
    browserSync.init({
        server: './www',
        ui: {
            port: 8085,
            weinre: {
                port: 8086
            }
        },
        open: true,
        ui:false,
        port: 9091
    });
});
