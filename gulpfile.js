var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');

gulp.task('hello', function() {
    console.log('Hello Zell');
});

gulp.task('sass', function(){
    return gulp.src('app/scss/*.scss')
        .pipe(sass()) // Converts Sass to CSS with gulp-sass
        .pipe(gulp.dest('publish/'));
});

gulp.task('scripts',function(){
    return gulp.src(['bower_components/angular/angular.js','bower_components/angular-aria/angular-aria.js',
                    'bower_components/angular-animate/angular-animate.js','bower_components/angular-material/angular-material.js',
                    'bower_components/angular-ivh-treeview/dist/ivh-treeview.js',
                    'bower_components/underscore/underscore.js',
                    'app/app.js',
                    'app/Service/*.js',
                    'app/directives/*.js',
                    'app/controllers/*.js'])
        .pipe(concat('index.js'))
        .pipe(gulp.dest('publish'));
});

gulp.task('css',function(){
    return gulp.src(['bower_components/angular-material/angular-material.css',
                    'bower_components/angular-ivh-treeview/dist/ivh-treeview.css',
                    'bower_components/angular-ivh-treeview/dist/ivh-treeview-theme-basic.css',
                    'app/scss/wikidata.scss'])
        .pipe(concat('index.css'))
        .pipe(gulp.dest('publish'))
});
gulp.task('build', function(){
    gulp.run('scripts');
    gulp.run('css');
});

//watch file
gulp.task('watch', function(){
    gulp.watch('app/scss/*.scss', ['sass']);
    gulp.watch('app/**/*.js',['scripts']);
    gulp.watch('app/*.js',['scripts']);
    gulp.watch('*.html',browserSync.reload);
    // Other watchers
});

