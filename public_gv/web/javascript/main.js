var _____WB$wombat$assign$function_____=function(name){return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name))||globalThis[name];};if(!globalThis.__WB_pmw){globalThis.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opener = _____WB$wombat$assign$function_____("opener");
/**
  * isMobile
  * init_header
  * mobileMenu
  * toggleExtramenu
  * portfolioIsotope
  * blogMasonry
  * prettyPhoto
  * flatCarousel
  * wooSlider
  * counter
  * googleMap
  * woocommerceTabs
  * detectViewport
  * goTop
  * parallax
*/

;(function($) {

	'use strict'

	var isMobile = {
		Android: function() {
			return navigator.userAgent.match(/Android/i);
		},
		BlackBerry: function() {
			return navigator.userAgent.match(/BlackBerry/i);
		},
		iOS: function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
		Opera: function() {
			return navigator.userAgent.match(/Opera Mini/i);
		},
		Windows: function() {
			return navigator.userAgent.match(/IEMobile/i);
		},
		any: function() {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};
	
	var init_header = function() {
		var largeScreen = matchMedia('only screen and (min-width: 992px)').matches;
		if ( largeScreen ) {
			var top = 100;
			if($('body').hasClass('cover')) { top = $('.tp-banner').height() + 100 ; }
			$(window).scroll(function() {
				if ( $(this).scrollTop() > top ) {
					$('#masthead-sticky').addClass('active');
				} else {
					$('#masthead-sticky').removeClass('active');
				}
			});
		}
		// click on one-page menu
		function onepageClick(element) {
			element.on('click',function() {
	        	var anchor = $(this).attr('href').split('#')[1];
	        	if (anchor) {
		            if ( $('#'+anchor).length > 0 ) {
		                var headerHeight = 0;
		                if ( $('.sticky-v8').length > 0 && largeScreen ) {
		                    headerHeight = $('.header').outerHeight();
		                }
		                var target = $('#'+anchor).offset().top - headerHeight;
		                $('html,body').animate({scrollTop: target}, 1000, 'easeInOutExpo');
		            }
		        }
	        return false;
	      	});
	      	element.on( 'click', function() {
	        	$(this).parent('li').addClass('active').siblings().removeClass('active');
	        	$( "a[href='" + $(this).attr('href') + "']" ).parent('li').addClass('active').siblings().removeClass('active')
	      	});
		}
		onepageClick($('.sticky-v8 ul.menu > li > a'));
		onepageClick($('.header-v8 ul.menu > li > a'));
	};

	var toggleExtramenu = function() {
		$('.menu.menu-extra .off-canvas-toggle a').on('click', function() {
			$('body').toggleClass('off-canvas-active');
		});
		$('#site-off-canvas .close').on('click', function() {
			$('body').removeClass('off-canvas-active');
		});
	}

	var mobileMenu = function() {
		$('.navigator-toggle').on('click',function(){
			$('#site-navigator-mobile').toggleClass('active');
		});
		$('.toggler').on('click',function(){
			$(this).parent('li').toggleClass('active');
		});
		$('.search-box a').on('click',function(){
			$('.search-box').toggleClass('active');
		});
	}

	var prettyPhoto = function() {
		if($().prettyPhoto) {
			if($('a.quickview').length > 0) {
				$('a.quickview').attr('rel', 'prettyPhoto');
			}
			if($('.gallery a.search').length > 0) {
				$('.gallery a.search').attr('rel', 'prettyPhoto');
			}
			if($('.images_grid a.prettyphoto').length > 0) {
				$('.images_grid a.prettyphoto').attr('rel', 'prettyPhoto');
			}
			if($('.gallery .images a.zoom').length > 0) {
				$('.gallery .images a.zoom').attr('rel', 'prettyPhoto');
			}
			$(".gallery a[rel^='prettyPhoto']").prettyPhoto({social_tools: false});
		}
	}

	var ajaxContactForm = function(idForm) {
		$(idForm).each(function() {
			if($().validate) {
				$(this).validate({
					submitHandler: function( form ) {
						var $form = $(form),
							str = $form.serialize(),
							loading = $('<div />', { 'class': 'loading' });

						$.ajax({
							type: "POST",
							url:  $form.attr('action'),
							data: str,
							beforeSend: function () {
								$form.find('.send-wrap').append(loading);
							},
							success: function( msg ) {
								var result, cls;
								if ( msg == 'Success' ) {
									result = 'Email sent successfully. Thank for your contact with us';
									cls = 'msg-success';
								} else {
									result = 'Error sending email.';
									cls = 'msg-error';
								}

								$form.prepend(
									$('<div />', {
										'class': 'flat-alert ' + cls,
										'text' : result
									})
								);

								$form.find(':input').not('.submit').val('');
							},
							complete: function (xhr, status, error_thrown) {
								$form.find('.loading').remove();
							}
						});
					}
				});
			}
		}); // each contactform
	};

	var portfolioIsotope = function() {
		if ( $().isotope ) {
			var $container = $('.portfolio-wrapper');

			$container.imagesLoaded(function(){
				$container.isotope({
					itemSelector: '.item',
					transitionDuration: '1s'
				}); // end isotope
			});

			$('.portfolio-filters ul li').on('click',function() {
				$('.portfolio-filters ul li').removeClass('active');
				$(this).addClass('active');
				var selector = $(this).find("a").attr('data-filter');
				$container.isotope({ filter: selector });
				return false;
			});// end filter
		};
	};

	var wooSlider = function() {
        if( $().slider ) {
            $( ".price_slider" ).slider({
                range: true,
                min: 12,
                max: 35,
                values: [ 12, 35 ],
                slide: function( event, ui ) {

                    $( "span.from" ).text( "£" + ui.values[ 0 ] );
                    $( "span.to" ).text( "£" + ui.values[ 1 ] );
                }
            });

            $( "span.from" ).text( "£" + $( ".price_slider" ).slider( "values", 0 ) );
             $( "span.to" ).text( "£" + $( ".price_slider" ).slider( "values", 1 ) );
            $( ".ui-slider-handle").append("<span class='shadow'></span>");
        }
    };

	var detectViewport = function() {
		if($().waypoint) {
			$('[data-waypoint-active="yes"]').waypoint(function() {
				$(this).trigger('on-appear');
			}, { offset: '90%', triggerOnce: true });

			$(window).on('load', function() {
				setTimeout(function() {
					$.waypoints('refresh');
				}, 100);
			});
		}
	};

	var counter = function() {
		$('.flat_counter').on('on-appear', function() {
			$(this).find('.count-number').each(function() { 
                var to = parseInt( ($(this).attr('data-to')),10 ), speed = parseInt( ($(this).attr('data-speed')),10 );
                if ( $().countTo ) {
                    $(this).countTo({
                        to: to,
                        speed: speed
                    });
                }
            });
		});
	};

	var woocommerceTabs = function() {
		$('.woocommerce-tabs').each(function() {
			var content = $('.entry-content');
			content.hide();
			if ( (content).hasClass("active")) {
				$('.entry-content.active').show();
			} else {
				content.first().show();
			}
			$(this).find(' > ul > li').on('click',function(e) {
				var index = $(this).index();
				e.preventDefault();
				$(this).siblings().removeClass('active');
				$(this).addClass('active');
				var contentActive = $(this).parents('.tabs').siblings('.entry-content').eq(index);
				content.not(':eq(index)').hide();
				contentActive.fadeIn(300);
			})
		});
	};

	var flatCarousel = function() {
		$('.owl_carousel').each(function() {
			if ( $().owlCarousel ) {
				$(this).owlCarousel({
					loop: $(this).data('loop'),
					margin: $(this).data('margin'),
					nav: $(this).data('nav'),
					dots: $(this).data('dots'),
					autoplay: $(this).data('auto'),
					slideBy: $(this).data('slideby'),
					responsive:{
						0:{
							items: $(this).data('items0')
						},
						767:{
							items: $(this).data('items767')
						},
						991:{
							items: $(this).data('items991')
						},
						1200: {
							items: $(this).data('items1200')
						}
					}
				});
			}
		});
	};

	var blogMasonry = function() {
		if ( $().isotope ) {
			var $container = $('.blog-masonry01');
			$container.imagesLoaded(function(){
				$container.isotope({
					itemSelector: '.item',
					transitionDuration: '1s'
				});
			});
			
		};
	};

	var googleMap = function() {
        if ( $().gmap3 ) {
            $("#map").gmap3({
                map:{
                    options:{
                        zoom: 14,
                        mapTypeId: 'konstruct_style',
                        mapTypeControlOptions: {
                            mapTypeIds: ['konstruct_style', google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID]
                        },
                        scrollwheel: false
                    }
                },
                getlatlng:{
                    address:  "65A-B - Bach Dang - Tan Binh - TP HCM",
                    callback: function(results) {
                        if ( !results ) return;
                        $(this).gmap3('get').setCenter(new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
                        $(this).gmap3({
                            marker:{
                                latLng:results[0].geometry.location,
                                options:{
                                	icon: '../konstruct/images/common/maker.png'
                                }
                            }
                        });
                    }
                },
                styledmaptype:{
                    id: "konstruct_style",
                    options:{
                        name: "Konstruct Map"
                    },
                },
            });
        }
    };

	var parallax = function() {
		if ( $().parallax ) {
			$('.parallax').parallax("50%", 0.5);
		}
	};

	var goTop = function() {
		$(window).scroll(function() {
			if ( $(this).scrollTop() > 600 ) {
				$('.goto-top').addClass('active');
			} else {
				$('.goto-top').removeClass('active');
			}
		});

		$('.goto-top').on('click', function() {
			$("html, body").animate({ scrollTop: 0 }, 1000 , 'easeInOutExpo');
			return false;
		});
	};

	var closeMessage = function() {
		$('a.close').on('click', function() {
			$(".flat-alert").hide('fast');
		});
	};
	// Dom Ready
	$(function() {
		init_header();
		mobileMenu();
		toggleExtramenu();
		portfolioIsotope();
		blogMasonry();
		prettyPhoto();
		flatCarousel();
		ajaxContactForm('#contact-form');
		ajaxContactForm('#contact-form01');
		wooSlider();
		counter();
		googleMap();
		woocommerceTabs();
		detectViewport(); 
		goTop();
		parallax();
		closeMessage();
	});
})(jQuery);
}

/*
     FILE ARCHIVED ON 20:49:13 Feb 03, 2018 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 05:18:26 Sep 26, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.533
  exclusion.robots: 0.057
  exclusion.robots.policy: 0.046
  esindex: 0.008
  cdx.remote: 10.279
  LoadShardBlock: 265.973 (3)
  PetaboxLoader3.datanode: 125.782 (4)
  PetaboxLoader3.resolve: 104.194 (2)
  load_resource: 125.584
*/