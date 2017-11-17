
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        files: require("./tools/export"),

        sshconfig: {
            "aliyun": grunt.file.readJSON('../secret.json')
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
            shared: {
                files: [
                    {
                        expand: true,
                        cwd:    "./",
                        src:    [
                            '**',
                            '!node_modules/**',
                            '!Gruntfile.js'
                        ],
                        dest:   "../dist/server/shared"
                    }
                ]
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n'
            },
            build: {
                src: '<%= files %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },

        jshint: {
            build: {
                src: '<%= files %>'
            }
        },

        sftp: {
            shared: {
                files: {
                    "./": [
                        '**',
                        '!node_modules/**',
                        '!Gruntfile.js'
                    ]
                },
                options: {
                    path: '/home/service/invincible/shared',
                    config: 'aliyun',
                    showProgress: true,
                    createDirectories: true
                }
            }
        },

        sshexec: {
            install: {
                command: "cd /home/service/invincible/shared && npm install",
                options: {
                    config: 'aliyun'
                }
            }
        }
    });

    //grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-ssh');

    grunt.registerTask("init", "Config deploy arguments", function (env) {
        var aliyun = grunt.file.readJSON('../secret.json');

        var sshconfig = {
            "aliyun": aliyun
        };
        grunt.config("sshconfig", sshconfig);
    });

    grunt.registerTask("default", ['concat', 'copy']);
    grunt.registerTask("webapp", ['concat:webapp']);
    grunt.registerTask("scp", ['sftp']);
    grunt.registerTask("install", ['sshexec:install']);
    grunt.registerTask("deploy", ['sftp', 'sshexec']);
    grunt.registerTask("deploy-beta", [ 'init:beta', 'sftp', 'sshexec' ]);
};