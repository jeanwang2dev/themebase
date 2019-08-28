// Defining requirements
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var babel = require('gulp-babel');
var postcss = require('gulp-postcss');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var ignore = require('gulp-ignore');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var del = require('del');
var cleanCSS = require('gulp-clean-css');
var replace = require('gulp-replace');
var autoprefixer = require('autoprefixer');
var zip = require('gulp-zip');
var info = require('./package.json');

// Configuration file to keep your code DRY
var cfg = require('./gulpconfig.json');
var paths = cfg.paths;

// Run:
// gulp sass
// Compiles SCSS files in CSS
gulp.task('sass', function() {
	var stream = gulp
		.src(paths.sass + '/*.scss')
		.pipe(
			plumber({
				errorHandler: function(err) {
					console.log(err);
					this.emit('end');
				}
			})
		)
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sass({ errLogToConsole: true }))
		.pipe(postcss([autoprefixer()]))
		.pipe(sourcemaps.write(undefined, { sourceRoot: null }))
		.pipe(gulp.dest(paths.css));
	return stream;
});

// Run:
// gulp minifycss
// Minifies CSS files
gulp.task('minifycss', function() {
	return gulp
		.src(`${paths.css}` + '/{theme.css,custom-editor-style.css}')
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(cleanCSS({ compatibility: '*' }))
		.pipe(
			plumber({
				errorHandler: function(err) {
					console.log(err);
					this.emit('end');
				}
			})
		)
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.css));
});

gulp.task('styles', function(callback) {
	gulp.series('sass', 'minifycss')(callback);
});

// Run:
// gulp watch
// Starts watcher. Watcher runs gulp sass task on changes
gulp.task('watch', function() {
	gulp.watch(`${paths.sass}/**/*.scss`, gulp.series('styles'));
	gulp.watch(
		[
			`${paths.dev}/js/**/*.js`,
			'js/**/*.js',
			'!js/theme.js',
			'!js/theme.min.js'
		],
		gulp.series('scripts')
	);

	//Inside the watch task.
	gulp.watch(`${paths.imgsrc}/**`, gulp.series('imagemin-watch'));
});


// Run:
// gulp imagemin
// Running image optimizing task
gulp.task('imagemin', function() {
	gulp
		.src(`${paths.imgsrc}/**`)
		.pipe(imagemin())
		.pipe(gulp.dest(paths.img));
});

// Run:
// gulp scripts.
// Uglifies and concat all JS files into one
gulp.task('scripts', function() {
	var scripts = [
		// Start - All BS4 stuff
		`${paths.dev}/js/bootstrap4/bootstrap.bundle.js`,

		// End - All BS4 stuff

		`${paths.dev}/js/skip-link-focus-fix.js`,

		// Adding currently empty javascript file to add on for your own themes´ customizations
		// Please add any customizations to this .js file only!
		`${paths.dev}/js/custom-javascript.js`,
	];
	gulp
		.src(scripts, { allowEmpty: true })
		.pipe(babel(
			{
				presets: ['@babel/preset-env']
			}
		))
		.pipe(concat('theme.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.js));

	return gulp
		.src(scripts, { allowEmpty: true })
		.pipe(babel())
		.pipe(concat('theme.js'))
		.pipe(gulp.dest(paths.js));
});

gulp.task('copy-js', function(){
	return gulp.src(`${paths.dev}/js/customizer.js`)
	.pipe(gulp.dest(paths.js));
});