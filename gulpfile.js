const gulp         = require('gulp');
const sass         = require('gulp-sass')(require('sass'));
const mediaQueries = require('gulp-group-css-media-queries');
const cleanCSS     = require('gulp-clean-css');
const babel        = require('gulp-babel');
const uglify       = require('gulp-uglify');
const rename       = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const fileinclude  = require('gulp-file-include');
const newer        = require('gulp-newer');
const imagemin     = require('gulp-imagemin');
const size         = require('gulp-size');
const browsersync  = require('browser-sync');
const del          = require('del');

// Пути в переменные
const srcFolder = 'src/';
const distFolder = 'dist/';
const paths = {
  html: {
    src: [`${srcFolder}*.html`, `!${srcFolder}html/*.html`],
    dest: `${distFolder}`
  },
  styles: {
    src: [`${srcFolder}scss/**/*.scss`, `${srcFolder}scss/**/*.scss`],
    dest: `${distFolder}styles/`
  },
  scripts: {
    src: `${srcFolder}scripts/**/*.js`,
    dest: `${distFolder}scripts/`
  }
}

// Удаление файлов
const clean = () => {
  return del([`${distFolder}*`, `!${distFolder}assets/images`]);
}

// Сборка html
const html = () => {
  return gulp.src(paths.html.src)
    .pipe(fileinclude())
    .pipe(size())
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browsersync.reload({ stream: true }))
}

// Сборка изображений
const images = () => {
  return gulp.src(`${srcFolder}assets/images/**`)
    .pipe(newer(`${distFolder}assets/images/`))
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(size())
    .pipe(gulp.dest(`${distFolder}assets/images/`))
    .pipe(browsersync.stream())
}


// Сборка скриптов
const scripts = () => {
  return gulp.src(paths.scripts.src)
    .pipe(fileinclude())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(size())
    .pipe(
      rename({
        extname: '.min.js',
      })
    )
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browsersync.stream())
}

// сборка стилей
const styles = () => {
  return gulp.src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 5 version'],
      grid: true,
      cascade: true
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(
      rename({
        extname: '.min.css'
      })
    )
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browsersync.stream())
}

// Сборка папки assets
const asstets = () => {
  return gulp.src(`${srcFolder}assets/**`)
    .pipe(size())
    .pipe(gulp.dest(`${distFolder}assets/`))
    .pipe(browsersync.stream())
}


// Настройка gulp watch
const watchFiles = () => {
  browsersync.init({
    server: {
      baseDir: `${distFolder}`
    },
  });
  gulp.watch(`${srcFolder}**/*.html`, html);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(`${distFolder}assets/images/`, images);
  gulp.watch(`${distFolder}assets/`, asstets);
}

// Настройка gulp build
const build = gulp.series(clean, html, gulp.parallel(images, scripts, styles, asstets));
const watch = gulp.parallel(build, watchFiles);

// Настройка gulp watch

exports.clean = clean;
exports.html = html;
exports.images = images;
exports.scripts = scripts;
exports.styles = styles;
exports.asstets = asstets;
exports.watch = watch;

exports.build = build;
exports.default = watch;