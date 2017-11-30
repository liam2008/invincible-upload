
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        //files: require("./tools/export"),

        sshconfig: {
            "development": grunt.file.readJSON('../secret.json')
        },

        concat: {
            options: {
                banner: '/*! <%= pkg.file %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            webapp: {
                src: '<%= files %>',
                dest: '../web-app/js/<%= pkg.name %>.js'
            }
        },

        copy: {
            webapp: {
                files: [
                    {
                        expand: true,
                        cwd:    "./",
                        src:    [
                            '**',
                            '!scripts/*/',
                            '!node_modules/**',
                            '!Gruntfile.js'
                        ],
                        dest:   "../dist/web-app"
                    }
                ]
            }
        },

        uglify: {
            options:{
                mangle: true,
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                compress: {
                    drop_console: true
                }
            },
            buildall: {
                files: [{
                    expand:true,
                    cwd:'scripts/',
                    src:'**/*.js',
                    dest: '../dist/web-app/scripts/'
                }]
            }
        },

        jshint: {
            build: {
                src: '<%= files %>'
            }
        },

        sftp: {
            development: {
                files: {
                    "./": [
                        '**',
                        '!node_modules/**',
                        '!deploy_config/**',
                        '!Gruntfile.js'
                    ]
                },
                options: {
                    path: '/data/www/nginx/development/invincible-app',
                    config: 'development',
                    showProgress: true,
                    createDirectories: true
                }
            },

            // 使用development环境正确的配置文件
            development_config: {
                files: {
                    "./": [
                        'deploy_config/development/project.js'
                    ]
                },
                options: {
                    path: '/data/www/nginx/development/invincible-app/config/',
                    srcBasePath: "deploy_config/development/",
                    config: 'development',
                    showProgress: true,
                    createDirectories: true
                }
            }
        }
    });

    //grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-ssh');

    grunt.registerTask("uglifyAll", ['uglify:buildall']);
    grunt.registerTask("default", ['copy','uglify:buildall']);
    grunt.registerTask("copyTask", ['copy']);
    grunt.registerTask("webapp", ['concat:webapp']);
    grunt.registerTask("scp", ['sftp:development', 'sftp:development_config']);
    grunt.registerTask("deploy", ['scp']);
};