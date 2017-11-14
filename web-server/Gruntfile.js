
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
            web_server: {
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
            },
            hangzhou: {
                files: {
                    "./": [
                        '**',
                        '!node_modules/**',
                        '!logs/**',
                        '!Gruntfile.js'
                    ]
                },
                options: {
                    path: '/home/hangzhou/invincible/web-server/',
                    config: 'hangzhou',
                    showProgress: true,
                    createDirectories: true
                }
            },
            shenzhen: {
                files: {
                    "./": [
                        '**',
                        '!node_modules/**',
                        '!logs/**',
                        '!Gruntfile.js'
                    ]
                },
                options: {
                    path: '/home/shenzhen/invincible/web-server/',
                    config: 'shenzhen',
                    showProgress: true,
                    createDirectories: true
                }
            }
        },

        sshexec: {
            logs: {
                command: "cd /data/logs/web-server && tail -n 100 application.log-<%= date %>",
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
            },

            logs_hangzhou: {
                command: "cd /data/logs/invincible-server-hangzhou && tail -n 100 application.log-<%= date %>",
                options: {
                    config: 'hangzhou'
                }
            },
            install_hangzhou: {
                command: "cd /home/hangzhou/invincible/web-server && npm install",
                options: {
                    config: 'hangzhou'
                }
            },
            hangzhou: {
                command: "cd /home/hangzhou/invincible/web-server && pm2 startOrRestart ecosystem-hangzhou.json --env hangzhou",
                options: {
                    config: 'hangzhou'
                }
            },

            logs_shenzhen: {
                command: "cd /data/logs/invincible-server-shenzhen && tail -n 100 application.log-<%= date %>",
                options: {
                    config: 'shenzhen'
                }
            },
            install_shenzhen: {
                command: "cd /home/shenzhen/invincible/web-server && npm install",
                options: {
                    config: 'shenzhen'
                }
            },
            shenzhen: {
                command: "cd /home/shenzhen/invincible/web-server && pm2 startOrRestart ecosystem-shenzhen.json --env shenzhen",
                options: {
                    config: 'shenzhen'
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-ssh');

    grunt.registerTask("init", "Config deploy arguments", function (env) {
        var conf = grunt.file.readJSON('../secret_production.json');

        var sshconfig = {
            "hangzhou": conf["hangzhou"],
            "shenzhen": conf["shenzhen"]
        };
        grunt.config("sshconfig", sshconfig);
    });
    grunt.registerTask("scp", [ 'sftp:web_server' ]);
    grunt.registerTask("install", ['sshexec:install']);
    grunt.registerTask("start", ['sshexec:start']);
    grunt.registerTask("logs", ['sshexec:logs']);
    grunt.registerTask("deploy", [ 'scp', 'install', 'start']);

    grunt.registerTask("scp-hangzhou", [ 'sftp:hangzhou' ]);
    grunt.registerTask("install-hangzhou", ['sshexec:install_hangzhou']);
    grunt.registerTask("start-hangzhou", ['sshexec:hangzhou']);
    grunt.registerTask("logs-hangzhou", ['sshexec:logs_hangzhou']);
    grunt.registerTask("deploy-hangzhou", ['init:hangzhou', 'scp-hangzhou', 'install-hangzhou', 'start-hangzhou']);

    grunt.registerTask("scp-shenzhen", [ 'sftp:shenzhen' ]);
    grunt.registerTask("install-shenzhen", ['sshexec:install_shenzhen']);
    grunt.registerTask("start-shenzhen", ['sshexec:shenzhen']);
    grunt.registerTask("logs-shenzhen", ['sshexec:logs_shenzhen']);
    grunt.registerTask("deploy-shenzhen", ['init:shenzhen', 'scp-shenzhen', 'install-shenzhen', 'start-shenzhen']);

    grunt.registerTask("default", [ 'deploy' ]);
};