(function() {
	'use strict';

	var app = angular.module('app');

	/**
	 * pageTitle - Directive for set Page title - mata title
	 */
	app.directive('pageTitle', [
		'$rootScope',
		'$timeout',
		function($rootScope, $timeout) {
			return {
				link: function(scope, element) {
					var listener = function(event, toState, toParams, fromState, fromParams) {
						// Default title - load on Dashboard 1
						var title = 'Invincible';
						// Create your own title pattern
						if(toState.data && toState.data.pageTitle) {
							title = 'Invincible | ' + toState.data.pageTitle;
						}
						$timeout(function() {
							element.text(title);
						});
					};
					$rootScope.$on('$stateChangeStart', listener);
				}
			}
		}
	]);

	/**
	 * minimalizaSidebar - Directive for minimalize sidebar
	 */
	app.directive('minimalizaSidebar', [
		'$timeout',
		function($timeout) {
			return {
				restrict: 'A',
				template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
				controller: function($scope, $element) {
					$scope.minimalize = function() {
						$("body").toggleClass("mini-navbar");
						if(!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
							// Hide menu in order to smoothly turn on when maximize menu
							$('#side-menu').hide();
							// For smoothly turn on menu
							setTimeout(
								function() {
									$('#side-menu').fadeIn(400);
								}, 200);
						} else if($('body').hasClass('fixed-sidebar')) {
							$('#side-menu').hide();
							setTimeout(
								function() {
									$('#side-menu').fadeIn(400);
								}, 100);
						} else {
							// Remove all inline style from jquery fadeIn function to reset menu state
							$('#side-menu').removeAttr('style');
						}
					}
				}
			};
		}
	]);

	/**
	 * sideNavigation - Directive for run metsiMenu on sidebar navigation
	 */
	app.directive('sideNavigation', [
		'$timeout',
		function($timeout) {
			return {
				restrict: 'A',
				link: function(scope, element) {
					// Call the metsiMenu plugin and plug it to sidebar navigation
					$timeout(function() {
						element.metisMenu();

					});

					// Colapse menu in mobile mode after click on element
					var menuElement = $('#side-menu a:not([href$="\\#"])');
					menuElement.click(function() {
						if($(window).width() < 769) {
							$("body").toggleClass("mini-navbar");
						}
					});

					// Enable initial fixed sidebar
					if($("body").hasClass('fixed-sidebar')) {
						var sidebar = element.parent();
						sidebar.slimScroll({
							height: '100%',
							railOpacity: 0.9
						});
					}
				}
			};
		}
	]);

	/**
	 * responsibleVideo - Directive for responsive video
	 */
	/*app.directive('responsiveVideo', [
	 function responsiveVideo() {
	 return {
	 restrict: 'A',
	 link: function (scope, element) {
	 var figure = element;
	 var video = element.children();
	 video
	 .attr('data-aspectRatio', video.height() / video.width())
	 .removeAttr('height')
	 .removeAttr('width')

	 //We can use $watch on $window.innerWidth also.
	 $(window).resize(function () {
	 var newWidth = figure.width();
	 video
	 .width(newWidth)
	 .height(newWidth * video.attr('data-aspectRatio'));
	 }).resize();
	 }
	 }
	 }
	 ]);*/

	/**
	 * iboxTools - Directive for iBox tools elements in right corner of ibox
	 */
	app.directive('iboxTools', [
		'$timeout',
		function($timeout) {
			return {
				restrict: 'A',
				scope: true,
				templateUrl: 'views/common/ibox_tools.html',
				controller: function($scope, $element) {
					// Function for collapse ibox
					$scope.showhide = function() {
						var ibox = $element.closest('div.ibox');
						var icon = $element.find('i:first');
						var content = ibox.children('.ibox-content');
						content.slideToggle(200);
						// Toggle icon from up to down
						icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
						ibox.toggleClass('').toggleClass('border-bottom');
						$timeout(function() {
							ibox.resize();
							ibox.find('[id^=map-]').resize();
						}, 50);
					};
					// Function for close ibox
					$scope.closebox = function() {
						var ibox = $element.closest('div.ibox');
						ibox.remove();
					}
				}
			};
		}
	]);

	/**
	 * iboxTools with full screen - Directive for iBox tools elements in right corner of ibox with full screen option
	 */
	app.directive('iboxToolsFullScreen', [
		'$timeout',
		function($timeout) {
			return {
				restrict: 'A',
				scope: true,
				templateUrl: 'views/common/ibox_tools_full_screen.html',
				controller: function($scope, $element) {
					// Function for collapse ibox
					$scope.showhide = function() {
						var ibox = $element.closest('div.ibox');
						var icon = $element.find('i:first');
						var content = ibox.children('.ibox-content');
						content.slideToggle(200);
						// Toggle icon from up to down
						icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
						ibox.toggleClass('').toggleClass('border-bottom');
						$timeout(function() {
							ibox.resize();
							ibox.find('[id^=map-]').resize();
						}, 50);
					};
					// Function for close ibox
					$scope.closebox = function() {
						var ibox = $element.closest('div.ibox');
						ibox.remove();
					};
					// Function for full screen
					$scope.fullscreen = function() {
						var ibox = $element.closest('div.ibox');
						var button = $element.find('i.fa-expand');
						$('body').toggleClass('fullscreen-ibox-mode');
						button.toggleClass('fa-expand').toggleClass('fa-compress');
						ibox.toggleClass('fullscreen');
						setTimeout(function() {
							$(window).trigger('resize');
						}, 100);
					}
				}
			};
		}
	]);

	app.directive('closeOffCanvas', [
		function() {
			return {
				restrict: 'A',
				template: '<a class="close-canvas-menu" ng-click="closeOffCanvas()"><i class="fa fa-times"></i></a>',
				controller: function($scope, $element) {
					$scope.closeOffCanvas = function() {
						$("body").toggleClass("mini-navbar");
					}
				}
			};
		}
	]);

	/**
	 * vectorMap - Directive for Vector map plugin
	 */
	app.directive('vectorMap', [
		function() {
			return {
				restrict: 'A',
				scope: {
					myMapData: '='
				},
				link: function(scope, element, attrs) {
					var map = element.vectorMap({
						map: 'world_mill_en',
						backgroundColor: "transparent",
						regionStyle: {
							initial: {
								fill: '#e4e4e4',
								"fill-opacity": 0.9,
								stroke: 'none',
								"stroke-width": 0,
								"stroke-opacity": 0
							}
						},
						series: {
							regions: [{
								values: scope.myMapData,
								scale: ["#1ab394", "#22d6b1"],
								normalizeFunction: 'polynomial'
							}]
						}
					});
					var destroyMap = function() {
						element.remove();
					};
					scope.$on('$destroy', function() {
						destroyMap();
					});
				}
			}
		}
	]);

	/**
	 * sparkline - Directive for Sparkline chart
	 */
	app.directive('sparkline', [
		function() {
			return {
				restrict: 'A',
				scope: {
					sparkData: '=',
					sparkOptions: '='
				},
				link: function(scope, element, attrs) {
					scope.$watch(scope.sparkData, function() {
						render();
					});
					scope.$watch(scope.sparkOptions, function() {
						render();
					});
					var render = function() {
						$(element).sparkline(scope.sparkData, scope.sparkOptions);
					};
				}
			}
		}
	]);

	/**
	 * icheck - Directive for custom checkbox icheck
	 */
	app.directive('icheck', [
		'$timeout',
		function($timeout) {
			return {
				restrict: 'A',
				require: 'ngModel',
				link: function($scope, element, $attrs, ngModel) {
					return $timeout(function() {
						var value;
						value = $attrs['value'];

						$scope.$watch($attrs['ngModel'], function(newValue) {
							$(element).iCheck('update');
						});

						return $(element).iCheck({
							checkboxClass: 'icheckbox_square-green',
							radioClass: 'iradio_square-green'

						}).on('ifChanged', function(event) {
							if($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
								$scope.$apply(function() {
									return ngModel.$setViewValue(event.target.checked);
								});
							}
							if($(element).attr('type') === 'radio' && $attrs['ngModel']) {
								return $scope.$apply(function() {
									return ngModel.$setViewValue(value);
								});
							}
						});
					});
				}
			};
		}
	]);

	/**
	 * ionRangeSlider - Directive for Ion Range Slider
	 */
	app.directive('ionRangeSlider', [
		function() {
			return {
				restrict: 'A',
				scope: {
					rangeOptions: '='
				},
				link: function(scope, elem, attrs) {
					elem.ionRangeSlider(scope.rangeOptions);
				}
			}
		}
	]);

	/**
	 * dropZone - Directive for Drag and drop zone file upload plugin
	 */
	app.directive('dropZone', [
		function() {
			return {
				restrict: 'C',
				link: function(scope, element, attrs) {

					var config = {
						url: 'http://localhost:8080/upload',
						maxFilesize: 100,
						paramName: "uploadfile",
						maxThumbnailFilesize: 10,
						parallelUploads: 1,
						autoProcessQueue: false
					};

					var eventHandlers = {
						'addedfile': function(file) {
							scope.file = file;
							if(this.files[1] != null) {
								this.removeFile(this.files[0]);
							}
							scope.$apply(function() {
								scope.fileAdded = true;
							});
						},

						'success': function(file, response) {}

					};

					var dropzone = new Dropzone(element[0], config);

					angular.forEach(eventHandlers, function(handler, event) {
						dropzone.on(event, handler);
					});

					scope.processDropzone = function() {
						dropzone.processQueue();
					};

					scope.resetDropzone = function() {
						dropzone.removeAllFiles();
					}
				}
			}
		}
	]);

	/**
	 * chatSlimScroll - Directive for slim scroll for small chat
	 */
	app.directive('chatSlimScroll', [
		'$timeout',
		function($timeout) {
			return {
				restrict: 'A',
				link: function(scope, element) {
					$timeout(function() {
						element.slimscroll({
							height: '234px',
							railOpacity: 0.4
						});

					});
				}
			};
		}
	]);

	/**
	 * customValid - Directive for custom validation example
	 */
	app.directive('customValid', [
		function() {
			return {
				require: 'ngModel',
				link: function(scope, ele, attrs, c) {
					scope.$watch(attrs.ngModel, function() {

						// You can call a $http method here
						// Or create custom validation

						var validText = "Invincible";

						if(scope.extras == validText) {
							c.$setValidity('cvalid', true);
						} else {
							c.$setValidity('cvalid', false);
						}

					});
				}
			}
		}
	]);

	/**
	 * fullScroll - Directive for slimScroll with 100%
	 */
	app.directive('fullScroll', [
		'$timeout',
		function($timeout) {
			return {
				restrict: 'A',
				link: function(scope, element) {
					$timeout(function() {
						element.slimscroll({
							height: '100%',
							railOpacity: 0.9
						});

					});
				}
			};
		}
	]);

	/**
	 * slimScroll - Directive for slimScroll with custom height
	 */
	app.directive('slimScroll', [
		'$timeout',
		function($timeout) {
			return {
				restrict: 'A',
				scope: {
					boxHeight: '@'
				},
				link: function(scope, element) {
					$timeout(function() {
						element.slimscroll({
							height: scope.boxHeight,
							railOpacity: 0.9
						});

					});
				}
			};
		}
	]);

	/**
	 * clockPicker - Directive for clock picker plugin
	 */
	app.directive('clockPicker', [
		function clockPicker() {
			return {
				restrict: 'A',
				link: function(scope, element) {
					element.clockpicker();
				}
			};
		}
	]);

	/**
	 * landingScrollspy - Directive for scrollspy in landing page
	 */
	app.directive('landingScrollspy', [
		function() {
			return {
				restrict: 'A',
				link: function(scope, element, attrs) {
					element.scrollspy({
						target: '.navbar-fixed-top',
						offset: 80
					});
				}
			}
		}
	]);

	/**
	 * fitHeight - Directive for set height fit to window height
	 */
	app.directive('fitHeight', [
		function() {
			return {
				restrict: 'A',
				link: function(scope, element) {
					element.css("height", $(window).height() + "px");
					element.css("min-height", $(window).height() + "px");
				}
			};
		}
	]);

	/**
	 * truncate - Directive for truncate string
	 */
	app.directive('truncate', [
		'$timeout',
		function($timeout) {
			return {
				restrict: 'A',
				scope: {
					truncateOptions: '='
				},
				link: function(scope, element) {
					$timeout(function() {
						element.dotdotdot(scope.truncateOptions);

					});
				}
			};
		}
	]);

	/**
	 * touchSpin - Directive for Bootstrap TouchSpin
	 */
	app.directive('touchSpin', [
		function() {
			return {
				restrict: 'A',
				scope: {
					spinOptions: '='
				},
				link: function(scope, element, attrs) {
					scope.$watch(scope.spinOptions, function() {
						render();
					});
					var render = function() {
						$(element).TouchSpin(scope.spinOptions);
					};
				}
			}
		}
	]);

	/**
	 * markdownEditor - Directive for Bootstrap Markdown
	 */
	app.directive('markdownEditor', [
		function() {
			return {
				restrict: "A",
				require: 'ngModel',
				link: function(scope, element, attrs, ngModel) {
					$(element).markdown({
						savable: false,
						onChange: function(e) {
							ngModel.$setViewValue(e.getContent());
						}
					});
				}
			}
		}
	]);

	/**
	 * passwordMeter - Directive for jQuery Password Strength Meter
	 */
	app.directive('passwordMeter', [
		function() {
			return {
				restrict: 'A',
				scope: {
					pwOptions: '='
				},
				link: function(cope, element, attrs) {
					scope.$watch(scope.pwOptions, function() {
						render();
					});
					var render = function() {
						$(element).pwstrength(scope.pwOptions);
					};
				}
			}
		}
	]);

	//星星
	app.directive('starScore', function() {
		return {
			restrict: 'A',
			templateUrl: 'views/common/star_score.html',
			scope: {
				ratingValue: '=',
				max: '=',
				readonly: '@',
				onHover: '=',
				onLeave: '='
			},
			controller: function($scope) {
				$scope.ratingValue = $scope.ratingValue || 0;
				$scope.max = $scope.max || 5;
				$scope.click = function(val) {
					if($scope.readonly && $scope.readonly == 'true') {
						return;
					}
					$scope.ratingValue = val;
				};
				$scope.over = function(val) {
					if($scope.readonly && $scope.readonly == 'true') {
						return;
					}
					$scope.onHover(val);
				};
				$scope.leave = function() {
					if($scope.readonly && $scope.readonly == 'true') {
						return;
					}
					$scope.onLeave();
				}
			},
			link: function(scope, elem, attrs) {
				elem.css("text-align", "center");
				var updateStars = function() {
					scope.stars = [];
					var score = scope.ratingValue || 0;
					var ParseIntNum = parseInt(score); //整数
					var FloatNum = parseFloat((score - ParseIntNum).toFixed(1)); //小数部分

					for(var i = 0; i < scope.max; i++) {
						if(i < ParseIntNum) {
							scope.stars.push({
								'star-on': true
							});
						} else if(i === ParseIntNum) {
							if(FloatNum < 0.3) {
								scope.stars.push({
									'star-off': true
								});
							} else if(FloatNum > 0.7) {
								scope.stars.push({
									'star-on': true
								});
							} else {
								scope.stars.push({
									'star-half': true
								});
							}
						} else {
							scope.stars.push({
								'star-off': true
							});
						}
					}
				};
				updateStars();

				scope.$watch('ratingValue', function(oldVal, newVal) {
					if(newVal) {
						updateStars();
					}
				});
				scope.$watch('max', function(oldVal, newVal) {
					if(newVal) {
						updateStars();
					}
				});
			}
		};
	});

	/***
	 *pop-select
	 */
	app.directive('popSelect', [function() {
		return {
			restrict: 'A',
			templateUrl: 'views/common/pop_select.html',
			scope: {
				title: '=',
				selctEvent: '=',
				isLoad: '='
			}
		}
	}]);

	/***
	 *load-icon
	 */
	app.directive('loadIcon', [function() {
		return {
			restrict: 'A',
			templateUrl: 'views/common/load_icon.html',
			scope: {
				isLoad: '='
			}
		}
	}]);
	
	//分页
	app.directive('linPagination', [function() {
		return {
			templateUrl: 'views/common/lin_pagination.html'
		}
	}]);



}());