var _____WB$wombat$assign$function_____=function(name){return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name))||globalThis[name];};if(!globalThis.__WB_pmw){globalThis.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opener = _____WB$wombat$assign$function_____("opener");
/*
Plugin: jQuery Parallax
Version 1.1.3
Author: Ian Lunn
Twitter: @IanLunn
Author URL: http://www.ianlunn.co.uk/
Plugin URL: http://www.ianlunn.co.uk/plugins/jquery-parallax/

Dual licensed under the MIT and GPL licenses:
http://www.opensource.org/licenses/mit-license.php
http://www.gnu.org/licenses/gpl.html
*/

(function( jQuery ){
	var jQuerywindow = jQuery(window);
	var windowHeight = jQuerywindow.height();

	jQuerywindow.resize(function () {
		windowHeight = jQuerywindow.height();
	});

	jQuery.fn.parallax = function(xpos, speedFactor, outerHeight) {
		var jQuerythis = jQuery(this);
		var getHeight;
		var firstTop;
		var paddingTop = 0;
		
		//get the starting position of each element to have parallax applied to it		
		jQuerythis.each(function(){
		    firstTop = jQuerythis.offset().top;
		});

		if (outerHeight) {
			getHeight = function(jqo) {
				return jqo.outerHeight(true);
			};
		} else {
			getHeight = function(jqo) {
				return jqo.height();
			};
		}
			
		// setup defaults if arguments aren't specified
		if (arguments.length < 1 || xpos === null) xpos = "50%";
		if (arguments.length < 2 || speedFactor === null) speedFactor = 0.1;
		if (arguments.length < 3 || outerHeight === null) outerHeight = true;
		
		// function to be called whenever the window is scrolled or resized
		function update(){
			var pos = jQuerywindow.scrollTop();				

			jQuerythis.each(function(){
				var jQueryelement = jQuery(this);
				var top = jQueryelement.offset().top;
				var height = getHeight(jQueryelement);

				// Check if totally above or totally below viewport
				if (top + height < pos || top > pos + windowHeight) {
					return;
				}


				jQuerythis.css('backgroundPosition', xpos + " " + Math.round((top - pos) * speedFactor) + "px");


			});
		}		

		jQuerywindow.bind('scroll', update).resize(update);
		update();
	};
})(jQuery);
}

/*
     FILE ARCHIVED ON 21:34:18 Feb 03, 2018 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 05:18:27 Sep 26, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.437
  exclusion.robots: 0.044
  exclusion.robots.policy: 0.035
  esindex: 0.007
  cdx.remote: 8.155
  LoadShardBlock: 83.751 (3)
  PetaboxLoader3.datanode: 93.665 (4)
  PetaboxLoader3.resolve: 64.576 (2)
  load_resource: 94.353
*/