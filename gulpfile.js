const gulp = require('gulp');
const { src, dest } = require('gulp');
const { series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rm = require('gulp-rm');
const gulpIf = require('gulp-if');
const minifyCss = require('gulp-minify-css');
const concat = require('gulp-concat');

function clearDist() {
    return src('./dist/**/*', { read: false }).pipe(rm());
}

async function compileScss() {
    src('./src/sass/style.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(dest('./dist/css'));
}

function copyCss() {
    return src('src/styles/*.css').pipe(dest('dist/css/'));
}

function minCss() {
    return src('./dist/css/*.css')
    .pipe(gulpIf('*.css', minifyCss()))
    .pipe(concat('style.min.css'))
    .pipe(dest('./dist/css'));
}

exports.clearDist = clearDist;
exports.copyCss = copyCss;
exports.compileScss = compileScss;
exports.minCss = minCss;
exports.build = series(clearDist, copyCss, compileScss);