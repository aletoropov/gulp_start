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
const imagemin = require('gulp-imagemin');             // Оптимизация изображений 

let env = process.env.NODE_ENV;

const {DIST_PATH, SRC_PATH, STYLES_LIBS, JS_LIBS} = require('./gulp.config');

/**
 * Очистка каталога "dist/*"
 */
function clearDist() {
    console.log(env);
    return src('./dist/**/*', { read: false }).pipe(rm());
}

/**
 * Компиляция CSS файлов
 */
async function compileScss() {
    src([...STYLES_LIBS, './src/sass/style.scss'])
    .pipe(gulpIf(env === 'dev', sourcemaps.init()))
    .pipe(sassGlob())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulpIf(env === 'dev',
        autoprefixer({
            cascade: false
        })
    ))
    .pipe(gulpIf(env === 'prod', gcmq()))
    .pipe(concat('style.css'))
    .pipe(dest('./dist/css'))
    .pipe(gulpIf(env === 'prod', cleanCSS({compatibility: 'ie8'})))
    .pipe(concat('style.min.css'))
    .pipe(gulpIf(env === 'prod', sourcemaps.write('')))            // Раскомментировать, когда понядобятся sourcemap при разработке
    .pipe(dest('./dist/css'))
    .pipe(reload({ stream: true }));         // Перезагрузка live-сервера
}

/**
 * Сборка JavaScript файлов
 */
function compScripts() {
    return src([...JS_LIBS, './src/js/*.js'])
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
    return src('./src/*.html')
    .pipe(dest('./dist'))
    .pipe(reload({ stream: true }));
}

/**
 * Сжатие изображений 
 */
function imageMin() {
    return src('./src/images/*')
      .pipe(imagemin())
      .pipe(dest('./dist/images/'))
      .pipe(reload({ stream: true}));
}

exports.clearDist = clearDist;
exports.compileScss = compileScss;
exports.servStart = servStart;
exports.copyHtml = copyHtml;
exports.compScripts = compScripts;
exports.imageMin = imageMin;
exports.default = series(clearDist, parallel(compileScss, copyHtml, compScripts, imageMin), servStart);

watch('./src/*.html', copyHtml);
watch('./src/**/*.scss', compileScss);
watch('./src/js/*.js', compScripts);
watch('./src/images/*', imageMin);