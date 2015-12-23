function addPageEditing() {
	$('.mw-viewport').addClass('mw-links-disabled');
	$('.mw-viewport [contenteditable]').attr('contenteditable', 'true');
	$('.mw-viewport .mw-page-content').sortable({axis:'y', handle:'.dragHandle'});
	$('.mw-viewport .mw-radio').addClass('mw-optional');
}

function adjustViewportHeight() {
	var viewport = $('.mw-viewport');
	var viewportHeight = viewport.outerHeight();
	$('.mw-viewport .mw-page').each(function() {
		var pageHeight = $(this).outerHeight();
		if (viewportHeight < pageHeight) viewportHeight = pageHeight;
	});
	viewport.css('height', viewportHeight);
}

function deselectWidget() {
	var currentSelection = $('.mw-viewport .widget.selected');
	if (!currentSelection.length)
		return;
		
	saveProperties();
	currentSelection.removeClass('selected');
	currentSelection.find('.removeHandle, .dragHandle').remove();
	updatePageListAndProperties();
}

function getEditId() {
	var editId = $.url.param('editId');
	if (editId)
		return editId;

	var match = window.location.pathname.match('^/e/([^?]*)');
	return match ? match[1] : null;
}

function getViewId() {
	var viewId = $.url.param('viewId');
	if (viewId)
		return viewId;

	var match = window.location.pathname.match('^/v/([^?]*)');
	return match ? match[1] : null;
}

function initializeEditing() {
	widgetNo = 1;
	dragging = false;

	// Menu bar

	$('.buttonNew').click(function() {
		showDialog("New mockup", "question",
			"You will lose all your changes. Sure?", {
				"Yes": function() {window.location.href = "/e";},
				"No": null
			});
	});

	$('.buttonSave').click(function() {
		saveMock(false);
	});

	$('.buttonSaveAs').click(function() {
		saveMock(true);
	});

	$('.buttonTest').click(function() {
		if (editId) {
			removePageEditing();
			goToPage($('#pageList LI:first').data('value'));

			$('#shareViewLink').text('http://mokk.me/v/' + viewId);
			$('#shareViewLink').attr('href', 'http://mokk.me/v/' + viewId);
			$('#shareQrImg').attr('src', 'http://qrcode.kaywa.com/img.php?d=http://mokk.me/v/' + viewId)
			$('#shareEditLink').text('http://mokk.me/e/' + editId);
			$('#shareEditLink').attr('href', 'http://mokk.me/e/' + editId);
			$('#leftSidebar').animate({opacity: 0});
			$('#tools').fadeOut();
			$('.properties:visible').animate({opacity: 0});
			$('#editMenu').fadeOut(function() {
				$('#viewMenu').fadeIn();
				$('#shareNote').fadeIn();
			});
		} else {
			showDialog("Save mockup", "question",
				"Please save the mockup first.", {
					"OK": null
				});
		}
	});

	$('.buttonEdit').click(function() {
		$('#viewMenu').fadeOut(function () {
			$('#leftSidebar').animate({opacity: 1});
			$('#tools').fadeIn();
			$('.properties:visible').animate({opacity: 1});
			$('#editMenu').fadeIn();
			
			addPageEditing();
			updatePageListAndProperties();
		});
		$('#shareNote').fadeOut();
	});

	// Pages

	$('#pageList').sortable({
		start: function(event) {
			$(event.srcElement).click();
		},
		stop: function(event) {
			saveProperties();
			
			var currentPageLi = $('#pageList LI.selected');
			var newIndex = currentPageLi.index();
			var page = $('#' + currentPageLi.data('value')).detach();
			if ($('.mw-viewport .mw-page').length > newIndex) {
				$('.mw-viewport .mw-page:eq(' + newIndex + ')').before(page);
			} else {
				$('.mw-viewport').append(page);
			}

			updatePageListAndProperties();
		}
	});

	$('#pageList LI').live('click', function() {
		var element = $(this);
		if (element.hasClass('selected'))
			return;

		$('#pageList LI.selected').removeClass('selected');
		element.addClass('selected');
		goToPage(element.data('value'));
	});

	$('.buttonRemovePage').click(function() {
		saveProperties();

		var pageList = $('#pageList');
		if (pageList.find('LI').length <= 1)
			return;

		var currentPageLi = pageList.find('LI.selected');
		var currentPageId = currentPageLi.data('value');
		if (!currentPageId)
			return;

		var nextSelectedLi = pageList.find('LI:eq(' + (currentPageLi.index() + 1) + ')');
		if (!nextSelectedLi.length)
			nextSelectedLi = pageList.find('LI:eq(' + (currentPageLi.index() - 1) + ')');

		var currentPage = $('#' + currentPageId);
		currentPageLi.remove();
		currentPage.remove(); "/mokk.me/main.js"

		nextSelectedLi.addClass('selected');
		goToPage(nextSelectedLi.data('value'));

		updatePageListAndProperties();
	});

	$('.buttonCopyPage').click(function() {
		saveProperties();
		
		var newPageId = 1;
		while ($('#page' + newPageId).length)
			newPageId++;
		newPageId = 'page' + newPageId;

		var pageList = $('#pageList');
		var currentPageLi = pageList.find('LI.selected');
		var currentPageId = currentPageLi.data('value');
		var currentPage = $('#' + currentPageId);

		var newPage = currentPage.clone();
		newPage[0].id = newPageId;
		var newPageName = newPage.find('.mw-page-header H2').text();
		var newPageLi = $('<li data-value="' + newPageId + '" class="selected">' + newPageName + '</li>');

		currentPageLi.after(newPageLi);
		currentPage.after(newPage);

		currentPageLi.removeClass('selected');
		goToPage(newPageId);
		
		updatePageListAndProperties();
	});

	$('.buttonNewPage').click(function() {
		saveProperties();
		
		var newPageId = 1;
		while ($('#page' + newPageId).length)
			newPageId++;
		newPageId = 'page' + newPageId;

		var pageList = $('#pageList');
		var currentPageLi = pageList.find('LI.selected');
		var currentPageId = currentPageLi.data('value');
		var currentPage = $('#' + currentPageId);

		var newPage = $('#tpl-page').clone();
		newPage[0].id = newPageId;
		var newPageName = newPage.find('.mw-page-header H2').text();
		var newPageLi = $('<li data-value="' + newPageId + '" class="selected">' + newPageName + '</li>');

		currentPageLi.after(newPageLi);
		currentPage.after(newPage);

		addPageEditing();

		currentPageLi.removeClass('selected');
		goToPage(newPageId);
		updatePageListAndProperties();
	});

	// Properties
	
	$('.propTargetBlock').each(function() {
		var includeElement = $(this);
		var index = $(this).data('index');
		$('#tpl-target').children().each(function() {
			var clone = $(this).clone();
			if (index) {
				clone.find('[name="propTargetType"]').attr('name', 'propTargetType' + index);
				clone.find('[for="propTargetType"]').attr('for', 'propTargetType' + index);
				clone.find('[name="propTargetPage"]').attr('name', 'propTargetPage' + index);
				clone.find('[for="propTargetPage"]').attr('for', 'propTargetPage' + index);
				clone.find('[name="propTargetUrl"]').attr('name', 'propTargetUrl' + index);
				clone.find('[for="propTargetUrl"]').attr('for', 'propTargetUrl' + index);
				clone.find('[name="propTargetAnimation"]').attr('name', 'propTargetAnimation' + index);
				clone.find('[for="propTargetAnimation"]').attr('for', 'propTargetAnimation' + index);
			}
			includeElement.before(clone);
		});
		includeElement.remove();
	});
	
	$('.autoEnableGroup :checkbox, .autoEnableGroup :radio').change(function() {
		updateAutoEnable($(this).attr('name'));
	});
	
	// TODO

	// Phone

	$('.mw-current-page .mw-page-header').live('keyup paste blur', function() {
		var element = $(this);
		setTimeout(function() {element.trigger('change')}, 1);
	});
	$('.mw-current-page .mw-page-header').live('change', function() {
		if (!$(this).closest('.mw-page').find('[contenteditable="true"]').length)
			return;

		saveProperties();
		updatePageListAndProperties();
	});

	$('.mw-viewport').mouseup(function(event) {
		dragging = false;
	});

	$('BODY').mouseenter(function(event) {
		dragging = false;
	});

	$('.mw-viewport').mousedown(function(event) {
		if (!$(event.srcElement).hasClass('mw-page-content'))
			return;

		dragging = true;
		this.startY = event.pageY + $(this).scrollTop();
	});

	$('.mw-viewport').mousemove(function(event) {
		if (dragging)
			$(this).scrollTop(this.startY - event.pageY);
	});

	$('.mw-current-page .widget').live('click', function(event) {
		if (!$(this).closest('.mw-page').find('[contenteditable="true"]').length)
			return;

		var currentSelection = $('.mw-viewport .widget.selected');
		if (currentSelection && currentSelection[0] == this)
			return;

		saveProperties();
		
		currentSelection.removeClass('selected');
		currentSelection.find('.removeHandle, .dragHandle').remove();
		var newSelection = $(this);
		newSelection.addClass('selected');
		newSelection.append($('<div class="removeHandle"></div><div class="dragHandle"></div>'));
		
		updatePageListAndProperties();
	});

	$(document).click(function(event) {
		if (!$(event.srcElement).closest('.widget').length
			&& !$(event.srcElement).closest('.properties').length) {
			deselectWidget();
		}
	});

	$('.mw-current-page .widget .removeHandle').live('click', function() {
		saveProperties();		
		$(this).closest('.widget').remove();
		updatePageListAndProperties();
	});

	// Tools

	if ($('.tool').draggable) {
		$('.tool').draggable({helper: 'clone', opacity: 0.8, scroll: false});

		$('.mw-viewport').droppable({accept: '.tool',
			drop: function(event, ui) {
				var toolId = ui.draggable[0].id.substring(5);
				var template = $('#tpl-' + toolId);
				var requiresUl = template.parent()[0].nodeName.toUpperCase() == 'UL';
				var requiresFieldset = template.parent()[0].nodeName.toUpperCase() == 'FIELDSET';
				var widget = template.clone();
				var container = $('.mw-current-page .mw-page-content');
				var isInUl = container.find('> UL:last-child').length > 0;
				var isInFieldset = container.find('> FIELDSET:last-child').length > 0;
				widget.addClass('widget widget-' + toolId);
				widget[0].id = 'widget' + (widgetNo++);
				if (requiresUl) {
					if (!isInUl)
						container.append($('<ul></ul>'));
					container = container.find('> UL:last-child');
				} else if (requiresFieldset) {
					if (!isInFieldset)
						container.append($('<fieldset></fieldset>'));
					container = container.find('> FIELDSET:last-child');
				}
				widget.find('[data-iframe]').each(function() {
					var element = $(this);
					var iframe = $('<iframe scrolling="no"></iframe>');
					iframe.attr('src', element.data('iframe'));
					element.append(iframe);
					element.removeAttr('data-iframe');
				});
				container.append(widget);
				enrichSpecialWidgets();
			}
		});
	}
}

function loadMock() {
	if (editId) {
		$.ajax("/db/e/" + editId, {
			dataType: 'json',
			success: function (data) {
				if (data && data.editId) {
					viewId = data ? data.viewId : null;
					setPages(data ? data.pages : null);
					addPageEditing();
					updatePageListAndProperties();
				} else {
					window.location.href = "/e";
				}
			},
			error: function () {
				window.location.href = "/e";
			}
		});
	} else if (viewId) {
		$.ajax("/db/v/" + viewId, {
			dataType: 'json',
			success: function (data) {
				if (data) {
					setPages(data.pages);
					removePageEditing();
					adjustViewportHeight();
				} else {
					window.location.href = "/e";
				}
			},
			error: function () {
				window.location.href = "/e";
			}
		});
	}
}

function removePageEditing() {
	$('.mw-viewport').removeClass('mw-links-disabled');
	$('.mw-viewport [contenteditable]').attr('contenteditable', 'false');
	$('.mw-viewport .widget.selected').removeClass('selected');
	$('.mw-viewport .widget .removeHandle, .mw-viewport .widget .dragHandle').remove();
	$('.mw-viewport .mw-radio').removeClass('mw-optional');
	$('.mw-viewport .mw-page-header .mw-back-button').remove();
}

function saveMock(saveAs) {
	if (saveAs) {
		editId = null;
		viewId = null;
	}

	if (viewId && !editId)
		return;
		
	deselectWidget();
	removePageEditing();
	var pages = [];
	$('.mw-viewport .mw-page').each(function() {
		var pageContent = $(this).html();
		var page = '<div id="' + this.id + '">' + pageContent + '</div>';
		pages.push(page);
	});
	addPageEditing();

	var document = {pages: pages};

	$.ajax("/db/e" + (editId != null ? "/" + editId : ""), {
		contentType: 'application/json',
		data: JSON.stringify(document),
		type: 'PUT',
		dataType: 'json',
		success: function (data) {
			if (editId == null) {
				editId = data.editId;
				viewId = data.viewId;
				showDialog("Save bookmark", "note",
					"Please bookmark the URL you get after pressing OK.<br/>"
						+ "It is the ONLY WAY to access your mockup<br/>"
						+ "after closing this browser window!", {
						"OK": function() {
							window.location.href = "/e/" + editId;
						}
					});
			}
		}
	});
}

function saveProperties() {
	var selectedWidget = $('.mw-viewport .widget.selected');
	var properties = $('.properties:visible');
	if (!selectedWidget.length || !properties.length)
		return;
	
	if (selectedWidget.hasClass('mw-button1')
		|| selectedWidget.hasClass('mw-button2') || selectedWidget.hasClass('mw-button3')) {
		var index = 1;
		selectedWidget.find('A').each(function() {
			var button = $(this);

			if (properties.find('[name="propTargetType' + index + '"]:checked').val() == 'page') {
				button.attr('href', '#' + properties.find('[name="propTargetPage' + index + '"]').val());
			} else {
				button.attr('href', properties.find('[name="propTargetUrl' + index + '"]').val());
			}
			
			var animationAndDirection = properties.find('[name="propTargetAnimation' + index + '"]').val().split(" ");
			button.attr('data-animation', animationAndDirection.length >= 1 ? animationAndDirection[0] : 'none');
			button.attr('data-direction', animationAndDirection.length >= 2 ? animationAndDirection[1] : 'forth');

			index++;
		});
	} else if (selectedWidget.hasClass('widget-image')) {
		selectedWidget.find('IMG').attr('src', properties.find('[name="propImageUrl"]').val());
	}
}

function setPages(pages) {
	var pagesContainer = $('.mw-viewport');
	pagesContainer.empty();

	if (pages) {
		for (var pageNo in pages) {
			var pageMarkup = pages[pageNo];
			var page = $(pages[pageNo]);
			page.addClass('mw-page');
			if (pageNo == 0) {
				page.addClass('mw-current-page');
			}
			pagesContainer.append(page);
		}
	}

	enrichSpecialWidgets();
}

function showDialog(title, type, text, buttons) {
	var dialog = $('<div title="' + title + '"></div>');
	var icon = $('<div class="' + type + '"></div>');
	var content = $('<div>' + text + '</div>');
	dialog.append(icon);
	dialog.append(content);
	$('BODY').prepend(dialog);

	if (!buttons)
		buttons = {"OK": null};

	var buttonDefinitions = {};
	for (var button in buttons) {
		(function() {
			var buttonCopy = button;
			buttonDefinitions[buttonCopy] = function () {
				$(this).dialog("close");
				if (buttons[buttonCopy])
					buttons[buttonCopy]();
				return false;
			};
		})();
	}

	dialog.dialog({modal: true, minWidth: 500, maxWidth: 900, minHeight: 150, maxHeight: 700,
		resizable: false, zIndex: 11000, buttons: buttonDefinitions, close: function() {
			$(this).remove();
		}});
};

function updateAutoEnable(name) {
	$('INPUT[name="' + name + '"]:visible').each(function() {
		var group = $(this).closest('.autoEnableGroup');
		var checked = $(this).attr('checked');
		if (checked) {
			group.find('.autoEnable').removeClass('disabled').find('INPUT,TEXTAREA,SELECT').removeAttr('disabled');
		} else {
			group.find('.autoEnable').addClass('disabled').find('INPUT,TEXTAREA,SELECT').attr('disabled', 'disabled');
		}
	});
}

function updatePageListAndProperties() {
	// Update page list
	
	var pageList = $('#pageList');
	pageList.find('LI.selected').removeClass('selected');
	var currentPageId = $('.mw-viewport .mw-current-page')[0].id;
	pageList.empty();

	var no = 1;
	$('.mw-viewport .mw-page').each(function() {
		var pageName = $(this).find('.mw-page-header H2').text();
		pageName = (no < 10 ? '0' : '') + no + ": " + pageName;
		no++;
		var pageLi = $('<li data-value="' + this.id + '">' + pageName + '</li>');
		pageList.append(pageLi);
	});

	pageList.find('LI[data-value="' + currentPageId + '"]').addClass('selected');
	
	// Show properties for current page or widget

	var selectedWidget = $('.mw-viewport .widget.selected');
	var properties = $([]);
	if (selectedWidget.length) {
		var classes = selectedWidget.attr('class').split(' ');
		for (var no in classes) {
			if (classes[no].match(/^widget-.*/)) {
				properties = $('#prop-' + classes[no].substring(7));
				if (properties.length) {
					$('.properties').hide();
					properties.show();
					break;
				}
			}
		}
	} else {
		$('.properties').hide();
		$('#prop-page').show();
	}
	
	// Load properties from page/widget into form
	
	$('.propPageSelect').each(function() {
		var select = $(this);
		select.empty();
		$('.mw-viewport .mw-page').each(function() {
			var pageName = $(this).find('.mw-page-header H2').text();
			var option = $('<option value="' + this.id + '"></option>');
			option.text(pageName);
			select.append(option);
		});
	});
	
	if (selectedWidget.length && properties.length) {
		if (selectedWidget.hasClass('mw-button1') || selectedWidget.hasClass('mw-button2')
			|| selectedWidget.hasClass('mw-button3')) {
			var index = 1;
			selectedWidget.find('A').each(function() {
				var button = $(this);
				var href = button.attr('href') || '';
				if (!href) {
					properties.find('[name="propTargetType' + index + '"]').val('');
					properties.find('[name="propTargetPage' + index + '"]').val('');
					properties.find('[name="propTargetUrl' + index + '"]').val('');
				} else if (href.charAt(0) == '#') {
					properties.find('[name="propTargetType' + index + '"]').val(['page']);
					properties.find('[name="propTargetPage' + index + '"]').val(href.substring(1));
					properties.find('[name="propTargetUrl' + index + '"]').val('');
				} else {
					properties.find('[name="propTargetType' + index + '"]').val(['url']);
					properties.find('[name="propTargetPage' + index + '"]').val('');
					properties.find('[name="propTargetUrl' + index + '"]').val(href);
				}
				
				var animation = button.data('animation');
				if (!animation) animation = 'none';
				var direction = button.data('direction')
				if (!direction) direction = 'forth';
				
				properties.find('[name="propTargetAnimation' + index + '"]').val(animation + ' ' + direction);
				updateAutoEnable('propTargetType' + index);
				index++;
			});
		} else if (selectedWidget.hasClass('widget-image')) {
			properties.find('[name="propImageUrl"]').val(selectedWidget.find('IMG').attr('src'));
		}
	}
}


$(document).ready(function() {
	seeded = false;
	seedString = new Date().getTime() + "";
	$(document).mousemove(function(event) {
		if (seedString.length < 100) {
			seedString += event.screenX + event.screenY;
		}
	});

	editMode = $('#body-edit').length > 0;
	if (editMode)
		initializeEditing();
	
	editId = getEditId();
	viewId = getViewId();
	if (editId || viewId) {
		loadMock();
	} else if (editMode) {
		addPageEditing();
		updatePageListAndProperties();
	}	
});
