const gulp = require('gulp');
const { src, dest } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rm = require( 'gulp-rm' )

function buildStyles() {
    return gulp.src('src/sass/*.scss')
       .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError)) 
       .pipe(gulp.dest('dist/'));
};

function copy() {
    return src('src/styles/sass/*.scss').pipe(dest('dist/'));
};

gulp.task('clean', () => {
    return gulp.src('dist/**/*', { read: false }).pipe(rm())
});

exports.buildStyles = buildStyles;
exports.copy = copy;