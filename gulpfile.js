const gulp = require('gulp');
const { src, dest, series, watch, parallel } = require('gulp');
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
const babel = require('gulp-babel');                   // Подключение Babel
const uglify = require('gulp-uglify');                 // Минификация JavaScript 

/**
 * Подключаемые стили
 */
const styles = [
    'node_modules/normalize.css/normalize.css',
    './src/sass/style.scss'
]

/**
 * Подключение скриптов
 */
const scripts = [
    './src/js/*.js' // Можно поключить другие JavaScript библиотеки из npm
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
    //.pipe(sourcemaps.write(''))            // Раскомментировать, когда понядобятся sourcemap при разработке
    .pipe(dest('./dist/css'))
    .pipe(reload({ stream: true }));         // Перезагрузка live-сервера
}

/**
 * Сборка JavaScript файлов
 */
function compScripts() {
    return src(scripts)
    .pipe(sourcemaps.init())                  // Инициализация sourcemap
    .pipe(concat('main.js', {newLine: ";"}))  // Склеиваем JavaScript
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(uglify())                           // Минификация JavaScript 
    .pipe(sourcemaps.write(''))               // Сохранение sourcemap
    .pipe(dest('./dist/js'))                  // Сохранение JavaScript
    .pipe(reload({ stream: true }));          // Перезагрузка live-сервера
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
exports.default = series(clearDist, parallel(compileScss, copyHtml, compScripts), servStart);

watch('./src/*.html', copyHtml);
watch('./src/**/*.scss', compileScss);
watch('./src/js/*.js', compScripts);