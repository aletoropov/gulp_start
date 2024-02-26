const gulp = require('gulp');
const { src, dest } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rm = require('gulp-rm');

function copy() {
    return src('src/styles/*.css').pipe(dest('dist/css/'));
};

function clean() {
    return gulp.src('dist/**/*', { read: false }).pipe(rm());
}

gulp.task("sass", function() {
    gulp.src('./src/sass/style.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('./dist/css'));
});

exports.copy = copy;
exports.clean = clean;