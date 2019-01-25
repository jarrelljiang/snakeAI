var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename')

//压缩css
gulp.task('minifyjs', function () {
    return gulp.src('*.js')    //需要操作的文件
        .pipe(rename({ suffix: '.min' }))   //rename压缩后的文件名
        .pipe(uglify())   //执行压缩
        .pipe(gulp.dest('js'));   //输出文件夹
});
