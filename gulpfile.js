// Defining requirements
var gulp = require('gulp');
var yargs = require('yargs');
var gulpif = require('gulp-if');
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

// Varible for production
var PRODUCTION = yargs.argv.prod;

/** STYLES */
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

// Compiles scss and minifycss
gulp.task('styles', function(callback) {
	gulp.series('sass', 'minifycss')(callback);
});

/** SCRIPTS */

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


/** IMAGES */

// Run:
// gulp imagemin
// Running image optimizing task
gulp.task('imagemin', function() {
	return gulp
		.src(`${paths.imgsrc}/**`)
		.pipe(imagemin())
		.pipe(gulp.dest(paths.img));
});

/**
 * Ensures the 'imagemin' task is complete before reloading browsers
 * @verbose
 */
gulp.task(
	'imagemin-watch',
	gulp.series('imagemin', function() {
		browserSync.reload();
	})
);

/** WATCH for dev */

// Run:
// gulp watch
// Starts watcher. Watcher runs gulp sass task on changes
gulp.task('watch', function() {
	gulp.watch(`${paths.sass}/**/*.scss`, gulp.series('sass', 'reload'));
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
// gulp browser-sync
// Starts browser-sync task for starting the server.
gulp.task('browser-sync', function() {
	browserSync.init(cfg.browserSyncWatchFiles, cfg.browserSyncOptions);
});

// Run:
// gulp reload
// reload after changes
gulp.task('reload', function(done){
	browserSync.reload();
	done();
});

// Run:
// gulp watch-bs
// Starts watcher with browser-sync. Browser-sync reloads page automatically on your browser
gulp.task('watch-bs', gulp.parallel('browser-sync', 'watch'));


/** for production */

// Run:
// gulp copy-js
// copy needed file to js folder
gulp.task('copy-js', function(){
	return gulp.src(`${paths.dev}/js/customizer.js`)
	.pipe(gulp.dest(paths.js));
});

// Deleting any file inside the /dist folder
gulp.task('clean-dist', function() {
	return del([paths.dist + '/**']);
});

// Run
// gulp dist
// Copies the files to the /dist folder for distribution as simple theme
gulp.task(
	'dist',
	gulp.series(['clean-dist'], function() {
		return gulp
			.src(
				[
					'**/*',
					'!readme.txt',
					'!readme.md',
					'!package.json',
					'!package-lock.json',
					'!gulpfile.js',
					'!gulpconfig.json',
					'!CHANGELOG.md',
					'!.travis.yml',
					'!jshintignore',
					'!codesniffer.ruleset.xml',
					`!${paths.node}`,
					`!${paths.node}/**`,
					`!${paths.dev}`,
					`!${paths.dev}/**`,
					`!${paths.dist}`,
					`!${paths.dist}/**`,
					`!${paths.distprod}`,
					`!${paths.distprod}/**`,
					`!${paths.sass}`,
					`!${paths.sass}/**`
				],
				{ buffer: true }
			)
			.pipe(
				replace(
					'/js/jquery.slim.min.js',
					'/js' + paths.vendor + '/jquery.slim.min.js',
					{ skipBinary: true }
				)
			)
			.pipe(
				replace('/js/popper.min.js', '/js' + paths.vendor + '/popper.min.js', {
					skipBinary: true
				})
			)
			.pipe(
				replace(
					'/js/skip-link-focus-fix.js',
					'/js' + paths.vendor + '/skip-link-focus-fix.js',
					{ skipBinary: true }
				)
			)
			.pipe(gulp.dest(paths.dist));
	})
);

// bundle for production, first change the inc/enqueue.php file for styles
/**
 * bundle Task
 * Generate the theme zip file
 *
 * copy all files to dist folder
 * replace the _thmename with your themename that defined in package.json name key
 * zip all the files into one theme zip file
 */
gulp.task('bundle', function(){
	return gulp.src(['dist/**/*','dist/*'])
		.pipe(replace('themebase', info.name))
		.pipe(zip(`${info.name}.zip`))
		.pipe(gulp.dest('packaged'));
});