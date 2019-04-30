var gulp = require("gulp");
var htmlmin = require("gulp-htmlmin");
var cssUglify = require("gulp-minify-css");
var uglify = require("gulp-uglify");
var concat = require("gulp-concat");

gulp.task("html", function() {
    var options = {
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,
        minifyCSS: true
    };
    gulp.src("index.html")
        .pipe(htmlmin(options))
        .pipe(gulp.dest("dist"));
});

gulp.task("css", function() {
    gulp.src("snake.css")
        .pipe(cssUglify())
        .pipe(gulp.dest("dist"));
});

gulp.task("js", function() {
    gulp.src(["snow.js", "snake.js", "bubbly-bg.js"])
        .pipe(uglify({ mangle: { toplevel: true } }))
        .pipe(concat("all.min.js"))
        .pipe(gulp.dest("dist"));
});