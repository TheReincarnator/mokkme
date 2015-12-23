function enrichSpecialWidgets() {
	$('.mw-map:visible').each(function() {
		var node = $(this)[0];
		if (node.enriched)
			return;
		var map = new google.maps.Map(node, {
	      zoom: 8,
	      center: new google.maps.LatLng(53.553815, 9.991575),
	      mapTypeId: google.maps.MapTypeId.ROADMAP
		});
		node.enriched = true;
	});

	$('.mw-switch, .mw-radio, .mw-checkbox').each(function() {
		var node = $(this)[0];
		if (node.enriched)
			return;
		// Works around an issue on iOS, where the live event does not work otherwise
		$(this).click(function() {});
		node.enriched = true;
	});
}

function goToPage(nextPage, animation, direction, onCompletion) {
	if (typeof nextPage == 'string') {
		if (nextPage.charAt(0) != '#') nextPage = '#' + nextPage;
		nextPage = $(nextPage);
	}
	if (!nextPage.length) {
		if (onCompletion) onCompletion();
		return;
	}

	var currentPageSelector = $('.mw-current-page');
	var viewport = currentPageSelector.closest('.mw-viewport');
	var pageWidth = currentPageSelector.width();
	var currentPage = currentPageSelector.length ? currentPageSelector[0] : null;
	if (currentPage == nextPage[0]) {
		if (onCompletion) onCompletion();
		return;
	}

	nextPage.addClass('mw-current-page');

	var wrappedOnCompletion = function() {
		if (currentPage) $(currentPage).removeClass('mw-current-page');
		if (direction != 'back') {
			nextPage.css({top: 0});
			viewport.scrollTop(0);
		}
		if (onCompletion) onCompletion();
	};

	if (direction == 'forth') {
		var backLink = $('<a class="mw-back-button"><b><i></i></b></a>');
		backLink.attr('href', '#' + currentPage.id);
		backLink.attr('data-animation', animation);		
		backLink.attr('data-direction', 'back');
		backLink.find('I').text('Back');
		
		nextPage.find('.mw-page-header .mw-back-button').remove();
		nextPage.find('.mw-page-header').prepend(backLink);
	}
	
	if (direction != 'back')
		nextPage.css({top: viewport.scrollTop()});
		
	if (animation == 'swipe') {
		if (direction == 'back') {
			nextPage.css({left: -pageWidth});
			nextPage.animate({left: 0}, 300);
			if (currentPage) $(currentPage).animate({left: pageWidth}, 300, wrappedOnCompletion);
		} else {
			nextPage.css({left: pageWidth});
			nextPage.animate({left: 0}, 300);
			if (currentPage) $(currentPage).animate({left: -pageWidth}, 300, wrappedOnCompletion);
		}
	} else {
		nextPage.css({left: 0});
		wrappedOnCompletion();
	}
}

$(document).ready(function() {

	$('.mw-checkbox').live('click', function() {
		$(this).toggleClass('mw-checked');
	});

	$('.mw-radio').live('click', function() {
		var element = $(this);
		if (element.hasClass('mw-checked')) {
			if (element.hasClass('mw-optional'))
				element.removeClass('mw-checked');
			
			return;
		}
			
		element.parent().find('.mw-radio').removeClass('mw-checked');
		element.addClass('mw-checked');
	});

	$('.mw-switch').live('click', function() {
		$(this).toggleClass('mw-checked');
	});

	$('.mw-viewport A').live('click', function(event) {
		event.preventDefault();
		if ($(this).closest('.mw-viewport').hasClass('mw-links-disabled'))
			return;

		var link = $(this);
		var url = link.attr('href');
		if (url && url.substring(0, 1) == "#") {
			link.css({'background-color': '#0376FF', color: '#FFF'});
			setTimeout(function() {
				goToPage(url.substring(1), link.data('animation'), link.data('direction'), function() {
					link.css({'background-color': '#FFF', color: '#000'});
				});
			}, 150);
		} else if (url) {
			window.open(url);
		}
	});
});
