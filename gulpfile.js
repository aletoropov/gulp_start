const gulp = require('gulp');
const { src, dest, series, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rm = require('gulp-rm');
const gulpIf = require('gulp-if');
const minifyCss = require('gulp-minify-css');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

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

function servStart() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
}

function copyHtml() {
    return src('src/*.html')
    .pipe(dest('./dist'))
    .pipe(reload({ stream: true }));
}

exports.clearDist = clearDist;
exports.compileScss = compileScss;
exports.servStart = servStart;
exports.copyHtml = copyHtml;
exports.default = series(clearDist, compileScss, copyHtml, servStart);

watch('./src/**/*.scss', compileScss);
watch('./src/*.html', copyHtml);