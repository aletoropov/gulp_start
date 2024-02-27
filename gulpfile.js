const gulp = require('gulp');
const { src, dest, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rm = require('gulp-rm');
const gulpIf = require('gulp-if');
const minifyCss = require('gulp-minify-css');
const concat = require('gulp-concat');

const styles = [
    'node_modules/normalize.css/normalize.css',
    './src/sass/style.scss'
]

function clearDist() {
    return src('./dist/**/*', { read: false }).pipe(rm());
}

async function compileScss() {
    src(styles)
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(dest('./dist/css'))
    .pipe(gulpIf('*.css', minifyCss()))
    .pipe(concat('style.min.css'))
    .pipe(dest('./dist/css'));
}


exports.clearDist = clearDist;
exports.compileScss = compileScss;
exports.build = series(clearDist, compileScss);