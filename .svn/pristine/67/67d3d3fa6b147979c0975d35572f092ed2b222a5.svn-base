
var moment = require('moment');

module.exports = function(grunt) {
    grunt.initConfig({
        date: moment().format('YYYY-MM-DD'),

        sshconfig: {
            "development": grunt.file.readJSON('../secret.json')
        },

        copy: {
            server: {
                files: [
                    {
                        expand: true,
                        cwd:    "./",
                        src:    [
                            '**',
                            '!node_modules/**',
                            '!logs/**',
                            '!Gruntfile.js'
                        ],
                        dest:   "../dist/server/web-server"
                    }
                ]
            }
        },

        sftp: {
            development: {
                files: {
                    "./": [
                        '**',
                        '!node_modules/**',
                        '!logs/**',
                        '!Gruntfile.js'
                    ]
                },
                options: {
                    path: '/home/service/invincible/web-server/',
                    config: 'development',
                    showProgress: true,
                    createDirectories: true
                }
            }
        },

        sshexec: {
            logs: {
                command: "cd /data/logs/invincible-server && tail -n 100 application-<%= date %>.log",
                options: {
                    config: 'development'
                }
            },
            install: {
                command: "cd /home/service/invincible/web-server && npm install",
                options: {
                    config: 'development'
                }
            },
            start: {
                command: "cd /home/service/invincible/web-server && pm2 startOrRestart ecosystem.json --env development",
                options: {
                    config: 'development'
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-ssh');

    grunt.registerTask("scp", [ 'sftp:development' ]);
    grunt.registerTask("install", ['sshexec:install']);
    grunt.registerTask("start", ['sshexec:start']);
    grunt.registerTask("logs", ['sshexec:logs']);
    grunt.registerTask("deploy", [ 'scp', 'install', 'start']);

    grunt.registerTask("default", [ 'deploy' ]);
};