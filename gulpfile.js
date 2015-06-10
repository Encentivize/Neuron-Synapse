'use strict';
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    argv = require('yargs').argv,
    npm = require('npm'),
    fs = require('fs');

var jsPath = ['./lib/**/*.js'],
    testsPath = ['./test/**/*.tests.js'];

gulp.task('lint', function () {
    return gulp.src(jsPath)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('tests', function () {
    return gulp.src(jsPath)
        .pipe(istanbul({
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire())
        .on('finish', function () {
            gulp.src(testsPath, {
                    read: false
                })
                .pipe(mocha({
                    reporter: 'nyan'
                }))
                .pipe(istanbul.writeReports());
        });
});

gulp.task('default', ['lint', 'tests']);

gulp.task('watch', ['lint', 'tests'], function () {
    gulp.watch(jsPath, ['lint', 'tests']);
});

gulp.task('npmPublish', function (callback) {
    var username = argv.username;
    var password = argv.password;
    var email = argv.email;
    if (!username) {
        var usernameError = new Error("Username is required as an argument --username exampleUsername");
        return callback(usernameError);
    }
    if (!password) {
        var passwordError = new Error("Password is required as an argument --password  examplepassword");
        return callback(passwordError);
    }
    if (!email) {
        var emailError = new Error("Email is required as an argument --email example@email.com");
        return callback(emailError);
    }
    var uri = "http://registry.npmjs.org/";
    npm.load(null, function (loadError) {
        if (loadError) {
            return callback(loadError);
        }
        var auth = {
            username: username,
            password: password,
            email: email,
            alwaysAuth: true
        };
        var addUserParams = {
            auth: auth
        };
        npm.registry.adduser(uri, addUserParams, function (addUserError, data, raw, res) {
            if (addUserError) {
                return callback(addUserError);
            }
            var metadata = require('./package.json');
            metadata = JSON.parse(JSON.stringify(metadata));
            npm.commands.pack([], function (packError) {
                if (packError) {
                    return callback(packError);
                }
                var fileName = metadata.name + '-' + metadata.version + '.tgz';
                var bodyPath = require.resolve('./' + fileName);
                var body = fs.createReadStream(bodyPath);
                var publishParams = {
                    metadata: metadata,
                    access: 'public',
                    body: body,
                    auth: auth
                };
                npm.registry.publish(uri, publishParams, function (publishError, resp) {
                    if (publishError) {
                        return callback(publishError);
                    }
                    console.log("Publish succesfull: " + JSON.stringify(resp));
                    return callback();
                });
            });
        });
    });
});
