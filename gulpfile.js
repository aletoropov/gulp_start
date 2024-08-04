const gulp = require('gulp');
const { src, dest, series, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rm = require('gulp-rm');                         // Очистка директорий 
const gulpIf = require('gulp-if');
const concat = require('gulp-concat');                 // Объединение стилей
const browserSync = require('browser-sync').create();  // Live-сервер для разработки
const sassGlob = require('gulp-sass-glob');            // Импорт стилей
const reload = browserSync.reload;
const autoprefixer = require("gulp-autoprefixer");
const gcmq = require('gulp-group-css-media-queries');  // Группировка медия запросов
const cleanCSS = require('gulp-clean-css');            // Минификация CSS
const sourcemaps = require('gulp-sourcemaps');

/**
 * Подключаемые стили
 */
const styles = [
    'node_modules/normalize.css/normalize.css',
    './src/sass/style.scss'
]

/**
 * Очистка каталога "dist/*"
 */
function clearDist() {
    return src('./dist/**/*', { read: false }).pipe(rm());
}

/**
 * Компиляция CSS файлов
 */
async function compileScss() {
    src(styles)
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gcmq())
    .pipe(autoprefixer({
        cascade: false
    }))
    .pipe(concat('style.css'))
    .pipe(dest('./dist/css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(concat('style.min.css'))
    //.pipe(sourcemaps.write('')) // Раскомментировать, когда понядобятся sourcemap при разработке
    .pipe(dest('./dist/css'));
}

/**
 * Сборка JavaScript файлов
 */
function compScripts() {
    return src('src/js/*js')
    .pipe(sourcemaps.init())                  // Инициализация sourcemap
    .pipe(concat('main.js', {newLine: ";"}))  // Склеиваем JavaScript
    .pipe(sourcemaps.write(''))               // Сохранение sourcemap
    .pipe(dest('./dist/js'))

}

/**
 * Старт live-сервера для разработки
 */
function servStart() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
}

/**
 * Перенос скомпилирпованного HTML кода
 */
function copyHtml() {
    return src('src/*.html')
    .pipe(dest('./dist'))
    .pipe(reload({ stream: true }));
}

exports.clearDist = clearDist;
exports.compileScss = compileScss;
exports.servStart = servStart;
exports.copyHtml = copyHtml;
exports.compScripts = compScripts;
exports.default = series(clearDist, compileScss, copyHtml, compScripts, servStart);

watch('./src/*.js', compScripts);
watch('./src/**/*.scss', compileScss);
watch('./src/*.html', copyHtml);