/*
 * Create namespace
 */
var aci = aci || {};

aci.createNS = function (namespace, root) {
    var nsparts = namespace.split(".");
    var parent = aci;
 
    // we want to be able to include or exclude the root namespace so we strip
    // it if it's in the namespace
    if (nsparts[0] === root) {
        nsparts = nsparts.slice(1);
    }
 
    // loop through the parts and create a nested namespace if necessary
    for (var i = 0; i < nsparts.length; i++) {
        var partname = nsparts[i];
        // check if the current parent already has the namespace declared
        // if it isn't, then create it
        if (typeof parent[partname] === "undefined") {
            parent[partname] = {};
        }
        // get a reference to the deepest element in the hierarchy so far
        parent = parent[partname];
    }
    // the parent is now constructed with empty namespaces and can be used.
    // we return the outermost namespace
    return parent;
};

aci.createNS("aci.controller","aci");
aci.createNS("aci.model","aci");
aci.createNS("aci.view","aci");

// main.utils.js

// main.models.js

/*
 * Context object. Not used effectively. Need to figure out what all can go into the context
 * Jeetobharat has a better utilization of the context for data/action on the server side
 */
aci.createNS("aci.context");

aci.context = function(){
	if (!window.location.origin) {
		  window.location.origin = window.location.protocol + "//" + window.location.host;
		}
	//console.log('window.location - ',window.location.origin);
	var url = ''; 
	var templatePath = window.location.origin+baseUrl+'/themes/aci/templates/utils/';
	var mode = '';
	var pageId = '';
	var loggedIn = false;
};

/*
 * Global instance of the Context object.
 */
var context = new aci.context;

// main.

// main.controller.js
// main.controller.js


// main.models.js

// main.views.js

// main.controllers.js

/*
 * General action - calls appropriate controller action of the model triggered on ui
 * For eg. add content or update content for a subtopic on the subtopics list page   
 */
aci.action = function(){
	var action;
	var model;
	var controller;
	var params;
	var template;
	var plugin;
	var postUpload;
	var save;
	
	var doAction = function(){
		//console.log('doAction ',this.params,this.action,this.controller,this.model);
		this.controller[this.action](this.params,plugin);
	};

	var setPlugin = function(p){
		plugin = p;
	};
	
	return{
		action: action,
		model: model,
		controller: controller,
		doAction: doAction,
		template: template,
		setPlugin: setPlugin,
		postUpload: postUpload,
		save: save
	}
}


/* 
 * Initialization
 */

$(document).ready(function(){

	context.url = $('[data-url]').attr('data-url');
	context.templatePath = window.location.origin+baseUrl+'/themes/aci/templates/';
	context.pageId = $('[data-pageId]').attr('data-pageId');
	if(context.url=="||new||") context.mode = "create";
	else context.mode = '';
	//console.log('context url',context.url,context.templatePath);
	/*
	 * The html page has the bare structure and no content. Iterate through all
	 * the data-snippets on the page, and load the appropriate data
	 */
	$('[data-snippet]').each(function(){
		//if($(this).attr('data-snippet') == 'title') return;
		//alert('snippet: '+$(this).attr('data-snippet'));
		//console.log('snippet: '+$(this).attr('data-snippet'));
		//if($(this).attr('data-snippet') == 'home-slider'){
			//console.log('snippet: '+$(this).attr('data-snippet'));
			var pageController = new aci.controller.page;
			pageController.setSnippetElement($(this));
			var sort = null;
			var params = null;
			var onloadComplete = null;
			if($(this).hasAttr('data-sort')) sort = $(this).attr('data-sort');
			if($(this).hasAttr('data-params')) params = $(this).attr('data-params');
			//console.log('data-snippet params',params);
			pageController.setParams(params);
			if($(this).hasAttr('data-onloadcomplete')) onloadComplete = $(this).attr('data-onloadcomplete');
			//console.log('onloadcomplete',onloadComplete);
			pageController.setOnloadComplete(onloadComplete);
/*			if(context.mode == 'create'){
				//pageController.prepareNew(context.url,$(this));
			}*/
			//else 
			pageController.getSnippet(context.url,params,null,sort,$(this).attr('data-snippet'));
		//}
	});
	
	/*
	 * Content on the page can be edited by initiating the edit function - through either an edit button or 
	 * an edit link of the page. When edit is clicked, prepare all the data-snippet elements for editing.
	 * Set the plugin for each data-snippet
	 */
	$('#edit').on('click',function(){
		if($(this).text() == 'Edit'){
            //bindRedactorElements();
			$(this).text('Close Edit');
			/*
			 * Currently there is a single controller instance. So, the plugin object has to be passed on each
			 * call to the controller from the plugin. If we move this to create a controller for each plugin instance
			 * below, and set the plugin object for that controller, we can obviate the need to pass the plugin object
			 * on each call.  Changed - 25th Aug '13 - HP
			 */ 
			
			//find all snippets and set them up for edit functionality
			$('[data-snippet]').each(function(){
					if($(this).attr('data-snippet') != 'accordion-items'){
						var pageController = new aci.controller.page;
						//console.log('t:',$(this).attr('data-edit'));
						var template = $(this).attr('data-edit')+'.html';
						var plugin =  $(this).m42Snippet({
							editTemplate: template,
							//dialog:'revealEdit',			//edit dialog
							dialog:'myModal',			//edit dialog
							onClick: pageController.editSnippet, 		//getting relevant data for edit
							snippet: $(this).attr('data-snippet'),		//pass snippet name
							saveCallback: pageController.saveSnippet,		//the save routine
                            initRedactor: initRedactor,
                            onRedactorSave: onRedactorSave
						});
						//console.log('plugin obj',plugin);
						pageController.setPlugin(plugin);
					}
			});
			
			$('[data-action]').each(function(){
				//console.log('edit action',$(this));
					var pageController = new aci.controller.page;
					//console.log('t:',$(this).attr('data-edit'));
					var save = pageController.saveSnippet;
					if($(this).hasAttr('data-save')) save = $(this).attr('data-save');
					var template = $(this).attr('data-edit')+'.html';
					var plugin =  $(this).m42Snippet({
						editTemplate: template,
						//dialog:'revealEdit',			//edit dialog
						dialog:'myModal',			//edit dialog
						onClick: pageController.editSnippet, 		//getting relevant data for edit
						snippet: $(this).attr('data-snippet'),		//pass snippet name
						saveCallback: save		//the save routine
					});
					//console.log('plugin obj',plugin);
					pageController.setPlugin(plugin);				
			});
			//$('.one').m42Slider();
			//$('.heroSlider').testy();
		}
		else{
			$(this).text('Edit');
			
			//find all snippets and remove the set up for edit functionality
			$('[data-snippet]').each(function(){
				$(this).off('click');
				$(this).removeClass('edit');
			});
			
		}
	});
	
	$('[data-family]').each(function(){
		var pageController = new aci.controller.page;
		//console.log('t:',$(this).attr('data-edit'));
		var template = $(this).attr('data-edit')+'.html';
		var plugin =  $(this).m42Snippet({
			editTemplate: template,
			//dialog:'revealEdit',			//edit dialog
			dialog:'myModal',			//edit dialog
			onClick: pageController.editSnippet, 		//getting relevant data for edit
			snippet: $(this).attr('data-snippet'),		//pass snippet name
			saveCallback: pageController.saveSnippet		//the save routine
		});
		//console.log('plugin obj',plugin);
		pageController.setPlugin(plugin);
		
	});
	
	$('#url').on('click',function(){
		var pageController = new aci.controller.page;
		plugin = $('#urlEdit').m42Snippet({
			editTemplate: 'utils/editUrl.html',
			dialog: 'revealEdit',
			onClick: pageController.editUrl,
			snippet: '',
			saveCallback: pageController.saveUrl,
			afterInit: pageController.editUrl
		});
		
	});
	
	$('#create-content').on('click',function(){
		createSnippet($(this));
	});
	
	
	
/*	$('div.video').on('click',function(){
		console.log('video clicked',$(this).closest('[data-snippet]'));
		var controller = new aci.controller.page();
		controller.setSnippetElement($(this).closest('[data-snippet]'));
		controller.showVideo($(this).closest('[data-snippet]').attr('data-snippet'));
	});
*/
	$('body').on('click','#openVideoBtn',function(){
		//console.log('video clicked',$(this).closest('[data-snippet]'));
		var controller = new aci.controller.page();
		if($(this).closest('[data-snippet]').length){
			controller.setSnippetElement($(this).closest('[data-snippet]'));
			controller.showVideo($(this).closest('[data-snippet]'));
		}
		else if($(this).closest('[data-source]').length){
			controller.setSnippetElement($(this).closest('[data-source]'));
			controller.showVideo($(this).closest('[data-source]'));
		}
	});

	$('body').on('click','#asideVideoBtn',function(){
		var url = $(this).closest('div#openVideo').attr('data-url');
		var preview = $(this).closest('.imgWrap').siblings('[data-type="html"]').first().html();
		youtubeId = getYoutubeVideoId(url); 
		//console.log('video popup',url,preview);
		var video = '<div class="popupClose"></div> '+
						'<iframe  title="YouTube video player" class="youtube-player" width="640" height="390" src="http://www.youtube.com/embed/'+youtubeId+'?autoplay=1&rel=0" frameborder="0" allowfullscreen></iframe>'+
/*						'<iframe title="YouTube video player" class="youtube-player" type="text/html" '+
							'width="640" height="390" src="'+url+'?autoplay=1&html5=1" frameborder="0" allowFullScreen> '+
						'</iframe>'+
*/						'<p>'+preview+'</p>'+
					'</div>';
		$('#myVideo').html(video);
		$('#myVideo').bPopup({			
			//zIndex: 2,
			modalClose: false,
			onClose: function(){
				//console.log('popup close fired');
				$('#myVideo').html('');
			},
			onOpen: function(){
				//console.log('popup opened');
			}
		});
	});


	$('body').on('click','#asideVideoBtn-m',function(evt){
		var url = $(this).closest('div#openVideo').attr('data-url');
		var preview = $(this).closest('.imgWrap').siblings('[data-type="html"]').first().html();
		youtubeId = getYoutubeVideoId(url); 
		//console.log('video popup',url,preview);
		//console.log('lightbox',$(this));
		html5Lightbox.html5lightbox({
			bordersize: 16,
			barheight: 100,
			overlayopacity: 0.7,
			stamp: true,
			bgcolor: '#000000',
			freemark:'',
			freelink:'',
			titlecss: "{color:#ffffff; font-size:16px; height:80px; float:left; font-family:Helvetica,Arial; text-overflow:normal;}"
		});
		html5Lightbox.showLightbox(3,url,preview,640,390);
		//$(this).html5lightbox.showLightbox(();
		
		evt.stopImmediatePropagation();
		return false;
	});	
	
	$('.video-edit').on('click',function(){
		//console.log('video-edit clicked',$(this).closest('media').attr('data-params'));
		var controller = new aci.controller.media();
		controller.showVideo($(this).closest('media').attr('data-params'));
	});

	$('[data-action]').on('click',function(){
		fnAction($(this));
	});

	$('.ourLetter .thumbnailBox').slimscroll({
		  height: 'auto'
		});

	$('.right aside').slimscroll({
		  height: 'auto',
		  width: '305px'
		});

	$(".gateway.accordion h3:first").css("border", 0);

	$('body').on("click",'.gateway.accordion h3', function() {
		$(this).next(".content").slideToggle(600); 
		var plusmin;
		plusmin = $(this).children("span").text();
		
		if( plusmin == '+')
		$(this).children("span").text('-');
		else
		$(this).children("span").text('+');

    });
	
	$('#login').on('click',function(){
		//console.log($('#username').val(),' ',$('#password').val());
		data = {'username':$('#username').val(),'password':$('#password').val()};
		//console.log(baseUrl);
		$.ajax({
			url: baseUrl+'site/login',
			type: 'POST',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log('back from save: ',data);
				if(data['status'] == 1){
					context.loggedIn = true;
					$('.loginBtn').dropdown('toggle');
					//console.log(data['user']);
					location.reload();
				}
				else{
					$('.loginerror').find('#msg').text(data['msg']);
					$('.loginerror').show();
					return false;
				}
			} 
		});
		return false;
	});

	$('#myVideo').on('click','div .popupClose',function(){
		//console.log('popup close',$(this).siblings('iframe'));		
		$(this).siblings('iframe').remove(); //attr('src', '')
	});

//    $('body div').on('click','.redactor_editor, img[id^="red-image"]',redactorImageClicked($(this)));

    $('body').on('click',' .redactor_btn_modal_close',function(){
/*        console.log('clikced moxiemgr close');
        $('#redactor_modal #selected-image').attr('data-file','');
        $('#redactor_modal #selected-image img').attr('src','');
        $('#redactor_modal #selected-image').attr('data-edit','0');*/
        closeMoxieMgrModal($(this));
    });
	//$('.carousel').carousel();

    $('body').on('click','.yt-playicon',function(){
        //console.log('play ytvideo',$(this).parent('div'));
        bindYtVideo($(this).parent('div').find('img'));
    });

/*	$('#logout').on('click',function(){
		window.location = baseUrl+'site/logout';
		$.ajax({
			url: baseUrl+'site/logout',
			type: 'GET',
			success: function(data){
				//console.log('back from save: ',data);
			} 
		});
		
	})*/

    $('#myModal').on('shown',function(){
        $(this).find('.tm-input').each(function(){
            var prefilled = $(this).attr('data-tags');
            utils.setTagsManager(prefilled);
        });
    });
});


function createSnippet($el){
	var controller = new aci.controller.snippet;
	var contentType = $('#content-type option:selected').val();
	var tpl = contentType;
	if(contentType == 'Program introduction class' || contentType == 'Adoption class') tpl  = 'class';
	if(!$('#content-edit').hasAttr('data-template')) $('#content-edit').attr('data-template',tpl+'/edit/edit-'+tpl);
	//console.log('on launch content Type new',contentType);
	$('#content-edit').attr('data-content-type',contentType);
	var plugin = $('#content-edit').m42Snippet({
		editTemplate: tpl+'/edit/edit-'+tpl+'.html',
		dialog: 'myModal',
		//onClick: controller.editSnippet,
		snippet: contentType,
		saveCallback: controller.save
		//afterInit: controller.editSnippet
	});
	controller.setPlugin(plugin);
	controller.editSnippet('type:template',plugin);
	
}

function getYoutubeThumb($el){
	//console.log('getYoutubeVideoThumb',$el);
	id = getYoutubeVideoId($el.val());
	thumb = 'http://img.youtube.com/vi/'+id+'/hqdefault.jpg';
	//console.log('getYoutubeThumb thumb',thumb);
	//console.log($el.closest('#form-wrapper').find('.ytthumb').find('img').attr('src'));
	$el.closest('#form-wrapper').find('.ytthumb').find('img').attr('src',thumb);
	//console.log($el.closest('#form-wrapper').find('.ytthumb').find('img').attr('src'));
}

function getYoutubeVideoId(url){
	//http://www.youtube.com/v/FZsXy0fGnwY
	
	urlparts = url.split('/');
	id = urlparts[urlparts.length-1]
	return id;
}

function fnAction($el){
	//console.log($el);
	model = $el.attr('data-model');
	//console.log('model: ',$el.attr('model'),model);
	var action = new aci.action;
	action.model = model;
	action.controller = new aci['controller'][model];
	action.params = $el.attr('data-params');
	action.action = $el.attr('data-action');
	action.template = $el.attr('data-edit');
	if($el.hasAttr('data-postUpload')) action.postUpload = $el.attr('data-postUpload');
	else action.postUpload = '';
	if($el.hasAttr('data-save')) action.save = $el.attr('data-save');
	else action.save = '';
	if($el.hasAttr('data-uploadUrl')) action.uploadUrl = $el.attr('data-uploadUrl');
	else action.uploadUrl = '';
	var aplugin = $el.m42Snippet({
		templatePath: baseUrl+'themes/aci/templates/',
		editTemplate: action.template+'.html',
		dialog:'myModal',			//edit dialog
		//dialog:'revealEdit',			//edit dialog
		//onClick: action.controller[action.action], 		//getting relevant data for edit
		snippet: $el.attr('data-model'),		//pass snippet name
		saveCallback: action.controller[action.save],	//the save routine
		uploadCallback: action.postUpload,
		uploadUrl: action.uploadUrl
	});
	action.setPlugin(aplugin);
	//console.log(action);
	action.doAction();
	
}

/*
 * Relook at this whole adding asides to page - HP 10/01
 */
function addToPage($el){
	var data = {};
	data.id = $el.attr('data-pageid');
	data.snippetid = $el.attr('data-snippetid');
	data.type = $el.attr('data-type');
	data.name = $el.attr('data-name');
	data.source = $el.attr('data-source');
	$.ajax({
		url: baseUrl+'p/a',
		type: 'POST',
		dataType: 'json',
		data: {data:JSON.stringify(data)},
		success: function(data){
			//console.log('back from referenced save: ',data);
			//afterSave(data[0]['snippets'][0],plugin);
		} 
	});
	
}

function ourLetterSetImage($el){
	//console.log('our-letter bigimage',$('.left figure').find('img'),$('.thumbnailBox').find('img'));
	if($el == 'undefined' || $el == null)
		$el = $('.thumbnailBox').find('img').first();
	var imgWidth = '';
	var imgHeight = '';
	$("<img/>") // Make in memory copy of image to avoid css issues
    .attr("src", $el.attr("src"))
    .load(function() {
        imgWidth = this.width;   // Note: $(this).width() will not
        imgHeight = this.height; // work for in memory images.
    });
	setTimeout(function(){
		cWidth = $('figure').width();
		cHeight = $('figure').height();
		//console.log('dimensions',cWidth,cHeight,imgWidth,imgHeight);
		if(imgHeight > imgWidth){
			if(imgHeight > cHeight){
				nHeight = cHeight;
				nWidth = imgWidth/imgHeight*cHeight; 
			}
			else{
				nHeight = imgHeight;
				nWidth = imgWidth;
			}
		}
		else{
			nWidth = cWidth;
			nHeight = imgHeight/imgWidth*cWidth;
		}
		//console.log('ourlettersetimage ',$el,$el.attr('src'),nHeight,nWidth);
		$('.left figure').find('img').attr('src',$el.attr('src'));
		$('.left figure').find('img').css('width',nWidth);
		$('.left figure').find('img').css('height',nHeight);
		
	},500)
	//imgWidth = $el.width();
	//imgHeight = $el.height();
}

function prepItemsForEdit(){

}

function youtubeGetId(url){
	  var ID = '';
	  url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
	  if(url[2] !== undefined) {
	    ID = url[2].split(/[^0-9a-z_]/i);
	    ID = ID[0];
	  }
	  else {
	    ID = url;
	  }
	    return ID;
	}

/*
 *  Moxiemanager integration
 */
function loadMoxman(selector,oninsert){

    moxman.browse({
        path: 'images',
        //rootpath: '/aci/uploads',
        oninsert: function(args) {
            //console.log(args.focusedFile);
            //oninsert(selector,args.focusedFile.path,args.focusedFile.parentPath,args.focusedFile.thumbnailUrl);
            oninsert(selector,args.focusedFile.path,args.focusedFile.thumbnailUrl);
        }
        //'general.license':'WXTE-FPJJ-ZMMR-GJJI-GYMR-RGL4-UL6G-HJBM'
    })
}

/*function oninsert(selector,file,thumbnail){
 $(selector).attr('data-file',file.path).html(file.path);
 showImage(selector,file,thumbnail,'',0)
 }*/

function showImage(selector,img,thumbnail,id,edit){
    //console.log('thumbnail',thumbnail,img);
    //console.log('parentPath',parentPath);
    /*
     * baseUrl includes a '/' at the end.
     * Moxiemanager returns with a '/' in the front. Need to remove from baseUrl
     */
    bUrl = baseUrl.substr(0,baseUrl.length-1);
    edit = (typeof edit == 'undefined')?0:edit;
    if(edit) $(selector).attr('data-file',img).find('img').attr('src',thumbnail);
    else $(selector).attr('data-file',bUrl+mmBase+img).find('img').attr('src',thumbnail);
    $(selector).attr('data-edit',edit);
    //$(selector).attr('data-ppath',parentPath);
    if(id != '') $(selector).attr('data-id',id);
}

function editMMImage(selector){
    var file = $(selector).attr('data-file');
    //var parentPath = $(selector).attr('data-ppath');
    //if($(selector).attr('data-edit') == '1'){
        //console.log('before stripping',file);
        var index = file.indexOf(baseUrl+mmBase)+baseUrl.length+mmBase.length;
        file = file.substr(index);
        //file = file.substr(index);
    //}
    //console.log('filename',file);
    moxman.edit({
        path: file,
        onsave: function(args){
            //console.log('edited',args.file);
            $(selector).attr('data-file',bUrl+mmBase+args.file.path);
            $(selector).find('img').attr('src',args.file.thumbnailUrl);
        }
    })
}

function redactorEditImage($img){

    //console.log('red edit img',$img);
    var index = $img.attr('src').indexOf(baseUrl)+baseUrl.length;
    var filename = $img.attr('src').substr(index);
    //var pPath = $img.attr('data-ppath');
    //console.log('filename',filename);
    showImage('#selected-image',filename,$img.attr('data-th'));
}

function closeMoxieMgrModal($el){
    //console.log('clikced moxiemgr close');
    $('#redactor_modal #selected-image').attr('data-file','');
    $('#redactor_modal #selected-image img').attr('src','');
    $('#redactor_modal #selected-image').attr('data-edit','0');
    $('#rich-text').redactor('modalClose');
    $('[data-snippet="main"]').redactor('modalClose');
    return false;
}

function closeYtVideoModal($el){
    //console.log('clikced moxiemgr close');
    //$('#redactor_modal #selected-image').attr('data-file','');
    //$('#redactor_modal #selected-image img').attr('src','');
    //$('#redactor_modal #selected-image').attr('data-edit','0');
    $('#rich-text').redactor('modalClose');
    $('[data-snippet="main"]').redactor('modalClose');
    return false;
}

function closeM42redactorModal($el){
    $('#rich-text').redactor('modalClose');
    $('[data-snippet="main"]').redactor('modalClose');
    return false;
}

function selectYtVideo($el){
    //console.log($el);
    var $container = $el.closest('#content').siblings('#selected-video');
    showSelectedYtVideo($container,$el,$el.siblings('p').text());
}

function showSelectedYtVideo($container,$el,title,edit){
    $cloned = $el.clone();
    //console.log($cloned.html());
    $cloned.css('float','left').css('margin-right','10px');
    //$selVideoContainer.html('<label class="control-label" >Selected Video</label><img src="'+$el.attr('src')+'" style="float:left;margin-right:10px" data-videoid=""/><p>'+$el.siblings('p').text()+'</p><div style="clear:both">');
    $container.html('<label class="control-label" ><b>Selected Video</b></label>');
    if(typeof edit != 'undefined') $container.attr('data-edit',edit);
    $cloned.appendTo($container);
    //$container.append('<p>'+title+'</p><br><a id="remove-video" href="#remove-video" onclick="removeRedactorVideo()">Remove</a><div style="clear:both">');
    $container.append('<p>'+title+'</p><div style="clear:both">');

}

function showYtVideo($el){
    var youtubeId = $el.attr('data-videoid');
    var video = '<div class="popupClose"></div> '+
        '<iframe  title="YouTube video player" class="youtube-player" width="640" height="390" src="http://www.youtube.com/embed/'+youtubeId+'?autoplay=1&rel=0" frameborder="0" allowfullscreen></iframe>'+
        '</div>';
    $('#myVideo').html(video);
    $('#myVideo').bPopup({
        //zIndex: 2,
        modalClose: false,
        onClose: function(){
            $('#myVideo').html('');
        },
        onOpen: function(){
            //console.log('popup opened');
        }
    });
}

function bindYtVideo($el){
    showYtVideo($el);
}

function bindRedactorElements(){
    //console.log('binding redactor elements',$('.redactor_editor img[id^="red-image"]'),$('.redactor_editor img[id^="ytvideo-thumb"]'));
    $('.redactor_editor img[id^="red-image"]').each(function(){
        /*console.log('resize ',$(this));
        $(this).resizable({
            handles:  'n, e, s, w, se, ne'
            //handles: { 'e': '.ui-resizable-e .ui-resizable-handle', 's': '.ui-resizable-s .ui-resizable-handle', 'se': '.ui-resizable-se .ui-resizable-handle'}
        });*/
        //$resizeWrap = $('<div id="resizable"/>');
        /*$(this).wrap('<div id="resizable"/>');
         $resizeWrap = $(this).closest('div');
         $resizeWrap.append('<div class="ui-resizable-handle ui-resizable-nw" id="nwgrip"></div>');
         $resizeWrap.append('<div class="ui-resizable-handle ui-resizable-ne" id="negrip"></div>');
         $resizeWrap.append('<div class="ui-resizable-handle ui-resizable-sw" id="swgrip"></div>');
         $resizeWrap.append('<div class="ui-resizable-handle ui-resizable-se" id="segrip"></div>');
         $resizeWrap.append('<div class="ui-resizable-handle ui-resizable-n" id="ngrip"></div>');
         $resizeWrap.append('<div class="ui-resizable-handle ui-resizable-s" id="sgrip"></div>');
         $resizeWrap.append('<div class="ui-resizable-handle ui-resizable-e" id="egrip"></div>');
         $resizeWrap.append('<div class="ui-resizable-handle ui-resizable-w" id="wgrip"></div>');
         $resizeWrap.resizable();*/
    });
    $('.redactor_editor img[id^="red-image"]').on('click',function(){
        //$('body div').on('click','.redactor_editor, img[id^="red-image"]',function(){
        redactorImageClicked($(this));
    });

    //$('.redactor_editor img[id^="ytvideo-thumb"]').on('click',function(){
    $('.redactor_editor div[id^="pop-wrap"]').on('click',function(){
        //console.log('popup video clicked');
        redactorVideoClicked($(this),'popup');
    });
    //$('.redactor_editor div[id^="embed-wrap"]').on('click',function(){
    $('.redactor_editor div.embed img.edit').on('click',function(){
        //console.log('embed video clicked');
        redactorVideoClicked($(this).closest('div.embed'),'embed');
    });


    /*$('body div#rich-text').on('click','.redactor_editor, img[id^="red-image"]',function(){
     redactorImageClicked($(this));
     });*/
}

function unbindRedactorElements(){
    //$('body div').off('click','.redactor_editor, img[id^="red-image"]');
    /*$('.redactor_editor img[id^="red-image"]').each(function(){
        $(this).resizable('destroy');
    })*/
    $('.redactor_editor img[id^="red-image"]').off('click');
    //$('.redactor_editor img[id^="ytvideo-thumb"]').off('click');
    $('.redactor_editor div[id^="pop-wrap-"]').off('click');
    $('.redactor_editor div[id^="embed-wrap-"]').off('click');
}

function redactorImageClicked($el){
    //console.log('redactor img clicked',$el,$('a.redactor_btn_mmImage'));
    $('a.redactor_btn_mmImage').click();
    $('#moxieMgr img').attr('src','');
    $('#redactor_modal #alt').val($el.attr('alt'));
    var imgPos = $($el).css('float');
    //console.log('imgPos',imgPos,$('#redactor_modal button[data-align="'+imgPos+'"]'),$el.closest('p').css('text-align'));
    if($el.closest('p').css('text-align') == 'center') $('#redactor_modal button[data-align="middle"]').addClass('active');
    else if($('#redactor_modal button[data-align="'+imgPos+'"]')) $('#redactor_modal button[data-align="'+imgPos+'"]').addClass('active');
    showImage('#selected-image',$el.attr('src'),$el.attr('data-th'),$el.attr('id'),"1");
}

function redactorVideoClicked($el,mode){
    //console.log('redactor video clicked',$el,$('a.redactor_btn_ytvideo'));
    $('a.redactor_btn_ytvideo').click();
    //console.log('sel video',$('#selected-video'),$el.clone());
    //$('#selected-video').append($el.clone());
    $('#selected-video').attr('data-mode',mode);
    $('#selected-video').attr('data-sel-id',$el.attr('id'));
    //$img = $el.not('edit');
    $('#redactor_modal button[data-mode="'+mode+'"]').addClass('active');
    if(mode == 'embed'){
        $img = $('<img src="'+$el.attr('data-thumb')+'" data-videoid="'+$el.attr('data-videoid')+'" />');
        var title = $el.attr('title');

    }
    else{
        $img = $el.find('img');
        var title = $img.attr('title');
        $('#redactor_modal #alt').val($img.attr('alt'));
        var imgPos = $img.css('float');
        //console.log('imgPos',imgPos,$('#redactor_modal button[data-align="'+imgPos+'"]'),$img.closest('p').css('text-align'));
        if($img.closest('p').css('text-align') == 'center') $('#redactor_modal button[data-align="middle"]').addClass('active');
        else if($('#redactor_modal button[data-align="'+imgPos+'"]')) $('#redactor_modal button[data-align="'+imgPos+'"]').addClass('active');
    }
    showSelectedYtVideo($('#selected-video'),$img,title,true);
    var imgPos = $img.css('float');
    $('#selected-video').attr('data-embid',$img.attr('id'));
    $('#selected-video').attr('data-edit',true);
    //$('#redactor_modal button[data-align="'+"]')
}

function removeRedactorVideo($el){
    //console.log('removevideo',$el);
    var selId = $('#redactor_modal #selected-video').attr('data-sel-id');
    $('.redactor_editor #'+selId).remove();
    closeYtVideoModal($el);
}

function selectLinkPage(url,title){
    $('#redactor_modal #selected-page').html(title);
    $('#redactor_modal #selected-page').attr('data-url',url);
}

function initRedactor($el){
    //console.log('redactor initialized');
    $('.redactor_editor div[id^="embed-wrap"]').append('<img class="edit" style="width:64px" src="'+baseUrl+'images/change.jpg">');

}

function onRedactorSave($el){
    //console.log('onRedactorSave',$el.find('.edit'));
    $el.find('.edit').remove();
}

function setJournalStatus(){
    $('article').each(function(){
        var status = $(this).attr('data-status');
        $(this).find('div.pull-right').append('<p>Status: '+status);
        $(this).removeAttr('data-status');
    })
}
