var fs = require('fs');
var browserify = require('browserify');
var watchify = require('watchify');
var gulp = require('gulp');
var babelify = require('babelify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var path = require('path');
var tap = require('gulp-tap');
var babel = require('gulp-babel');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var source = require("vinyl-source-stream");
var browserSync = require('browser-sync').create();
var mainBundler = null;
var ngmin = require('gulp-ngmin');


//设置库的存放目录
gulp.task('lib',function(){
    gulp.src([
        './src/js/lib/jquery-1.9.1.min.js',
        './src/js/lib/angular.min.js',
        './src/js/lib/semantic.min.js',
        //'./src/js/lib/echarts-all.js',
        './src/js/lib/scrollBar.js',
        './src/js/lib/slideOut.js',
        './src/js/lib/pnotify.js',
        './src/js/lib/dateRange.js',
        './src/js/lib/jquery.ztree.all.min.js'
    ],{base:'src'})
        .pipe(concat('lib.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./www/js/lib'));
});
//设置html模块的生成路径
gulp.task('htmlDev',function(){
    gulp.src(['./src/modules/**/**','./src/*.html'],{base:'src'})
        .pipe(gulp.dest('./www/'))
        .pipe(browserSync.reload({stream: true}));
});


gulp.task('htmlPro',function(){
    gulp.src('./src/modules/*.html',{base:'src'})
        .pipe(tap(function(file, t) {
            var contents = file.contents.toString();
            contents = contents.replace(/\<html\s*(ng-app=\".*\")?\s*\>/,'<html $1 manifest="../index.manifest">');
            file.contents = new Buffer(contents);
        }))
        .pipe(gulp.dest('./www/'));
    gulp.src('./src/*.html',{base:'src'})
        .pipe(tap(function(file, t) {
            var contents = file.contents.toString();
            contents = contents.replace(/\<html\s*(ng-app=\".*\")?\s*\>/,'<html $1 manifest="index.manifest">');
            file.contents = new Buffer(contents);
        }))
        .pipe(gulp.dest('./www/'));
});


//设置fonts字体的生成路径
gulp.task('fonts',function(){
    gulp.src('./src/fonts/**',{base:'src'})
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
}).transform(babelify,{ presets: ["es2015"] }));

function mainFunc(){
    mainBundler.bundle()
    .on('error', function(err) { console.error(err); this.emit('end'); })
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
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('www/js'));
});

gulp.task('css',function(){
    gulp.src('./src/less/backend.less') //多个文件以数组形式传入
        .pipe(less())
        .pipe(gulp.dest('./www/css'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('images',function(){
    gulp.src('./src/images/**',{base:'src'}) //多个文件以数组形式传入
        .pipe(gulp.dest('./www/'));
});



gulp.task('manifest', function (){
    gulp.src('./src/index.manifest')
        .pipe(tap(function (file){
            var dir = path.dirname(file.path);
            var contents = file.contents.toString();
            contents = contents.replace(/##([\W\w]+)##/,'##'+ Date.now()+'##');
            file.contents = new Buffer(contents);
        }))
        .pipe(gulp.dest('./www'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('nomanifest', function (){
    gulp.src('./www/index.manifest')
        .pipe(gulp.dest('./www'))
        .pipe(browserSync.reload({stream: true}));
});



//watch 模块的变化 watch源 无需加入相对路径 ‘./’符号，否则不能监听到新建的文件变化
gulp.task('watch', function(){
    gulp.watch(['./src/modules/**/**','./src/*.html'],function(){
        runSequence('htmlDev','nomanifest',function(){});
    });
    gulp.watch('src/less/**/*.less',function(){
        runSequence('css','nomanifest',function(){});
    });
    gulp.watch(['src/js/**/**/**/**','!src/js/modules/frame/**'],function(event){
         //debug模式可以开启这个watch，平常考虑到速度问题，先暂时注释
        // watch();
        runSequence('mainJs','htmlDev','nomanifest',function(){
        });
    });
    gulp.watch('src/js/modules/frame/**',function(){
        runSequence('frameWrapJs', 'nomanifest',function(){});
    });
});

gulp.task('default', ['fonts','images','css','frameWrapJs','lib','htmlDev','mainJs','watch'],function() {
    gulp.start('server');
});
gulp.task('build', ['fonts','images','css','frameWrapJs','lib','htmlPro','mainJsPro','manifest']);




gulp.task('server', function() {
    browserSync.init({
        server: './www',
        /*ui: {
         port: 8085,
         weinre: {
         port: 8086
         }
        },*/
        open: false,
        ui:false,
        port: 9091
    });
});
