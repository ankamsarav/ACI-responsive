/*
 * View - Youtube videos for
 */

aci.view.yt_video = function(){

    var prepareVideoList = function(html){

    }
}

/*
 * View - Media
 */

aci.view.media = function(){

	var utils = new aci.utils;

	var showForm = function(plugin,data){
		//console.log('aci.view.media showForm',data);
		$.get(plugin.settings.templatePath+plugin.settings.editTemplate,function(form){
			var filledTemplate = utils.processTemplate(form,data);
			plugin.setReveal(filledTemplate,function(){
				utils.setCheckbox($('.modal-body'));
				utils.setSelected($('.modal-body'));
			});
		});
		
	}
	
	var showVideo = function(data){
		$.get(context.templatePath+'utils/showVideoAdmin.html',function(template){
			//console.log(template,data);
			var utils = new aci.utils;
			var filledTemplate = utils.fillTemplate(template,data);			
			$('#myVideo').html(filledTemplate);
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
		
	}
		
	
	return{
		showForm: showForm,
		showVideo: showVideo
	}
}


/*
 * View - Snippet
 */

aci.view.snippet = function(){
	
	/*
	 * Show the form for create/update of the snippet.
	 */
	var showSnippetForm = function(contentType,snippet,plugin){
		if(plugin.settings.$element.hasAttr('data-template'))
			var templateName = context.templatePath+plugin.settings.$element.attr('data-template')+'.html'+'?'+Math.random();
		else
			var templateName = context.templatePath+contentType+'/edit/edit-'+contentType+'.html'+'?'+Math.random();
		$.get(templateName,function(template){
			var utils = new aci.utils;
			var filledTemplate = utils.processTemplate(template,snippet);
			$toDisplay = $('<div/>').html(filledTemplate);
			utils.setHtml($toDisplay);
			filledTemplate = $toDisplay.html();
			plugin.setReveal(filledTemplate);
			$('.date').datetimepicker({
				//language: 'pt-BR'
			});
            //bindRedactorElements(); //added HP 1/30/14
		});
		
	};
	
	return{
		showSnippetForm: showSnippetForm
	}
};

/*
 * View - Page
 */
aci.view.page = function(){
	
	/*
	 * display the snippet - appending it to a DOM $element.
	 * Depending on the type, instantiate appropriate jquery library if applicable.
	 * For example, slider - use refineSlide  - Todo: change this to use bootstrap's carousel.
	 * Faq - use accordian - Todo: change this to use bootstrap's accordian.
	 */
	var showSnippet = function(snippet,$element){
		//console.log('showSnippet :',snippet,'type',snippet.type);
		switch(snippet.type){
			case 'rich-text':
				content = $('<div/>').html(snippet.content).text().replace(/\\r\\n/g, '<br />');
				$element.html(content);
				break;
			
			case 'slider':
				var utils = new aci.utils;
				////console.log('view: '+snippet.content);
				content = utils.createSlider(snippet.content);
				$element.html(content);
				
				$('.rs-slider').refineSlide({
			        maxWidth: 960, // set to native image width (px)
			        transition         : 'fade',
		            transitionDuration : 1000,
		            autoPlay           : true,
		            keyNav             : false,
		            delay              : 5000,
		            controls           : null,
		            useThumbs		   : false,
		            useArrows		   : true,
		            arrowTemplate      : '<div class="rs-arrows"><a href="#" class="rs-prev"></a><a href="#" class="rs-next"></a></div>',
			    });

				break;
				
			case 'video':
			case 'home-preview-video':
				//if there is a template associated with this for display, use that.
				//console.log('templatePath: ',context.templatePath,$element);
				$.get(context.templatePath+$element.attr('data-view')+'.html',function(template){
					var utils = new aci.utils;
					var filledTemplate = utils.fillTemplate(template,snippet);
					$element.html(filledTemplate);
				});
				break;
			
			case 'faq':
				$.get(context.templatePath+$element.attr('data-view')+'.html',function(template){
					var utils = new aci.utils;
					var filledTemplate = utils.fillTemplate(template,snippet);
					$element.append(filledTemplate);
					$element.removeAttr('data-snippet');
				});
				
				//Need to enable accordion on the faq
				//Need to find a different way to handle this. Delay timers are a no-no.
				//Trigger accordion only after the added elements above are available
				window.setTimeout(function() {
					$('.accordion').accordion({
						cookieName:  'aci-accoridon-faq'
					});
				}, 500 /* but after 500 ms */);
				break;

			case 'waiting-families':
				$.get(context.templatePath+$element.attr('data-view')+'.html',function(template){
					var utils = new aci.utils;
					var filledTemplate = utils.fillTemplate(template,snippet);
					$element.html(filledTemplate);
					$element.removeAttr('data-snippet');
				});
				break;
			case 'document-list':
				$.get(context.templatePath+$element.attr('data-view')+'.html',function(template){
					var utils = new aci.utils;
					var filledTemplate = utils.fillTemplate(template,snippet);
					$element.html(filledTemplate);
					$element.removeAttr('data-snippet');
				});
				
				//Need to enable accordian on the faq
				//Need to find a different way to handle this. Delay timers are a no-no.
				//Trigger accordian only after the added elements above are available
				window.setTimeout(function() {
					$('.accordion').accordion({
						cookieName:  'aci-accoridon-faq'
					});
				}, 500 /* but after 500 ms */);
				break;
				
				
			/*
			 * The snippet type is a collection - that means the data comes from a different collection and is
			 * not part of the document. You have references to the documents within that other collection in the
			 * snippet.content. The content typically has an id and a seq, if several.
			 */
			case 'collection':
				if(snippet.source.length){
					var controller = new aci.controller.page;
					controller.setSnippetElement($element);
					controller.getReferenced(snippet.source,snippet.content);
/*					for(i=0,l=snippet.content.length;i<l;i++){
						console.log('collection: ',snippet.content[i]);
						controller.getReferenced(snippet.source,snippet.content[i].id);
					}
*/				}
		}
	};
	
	var buildSnippetElement = function(snippet,$element,callback){
		//console.log('showSnippet :',snippet,'type',snippet.type);
		var filledTemplate = '';
		switch(snippet.type){
			case 'faq':
			default:
				//console.log('buildSnippet',context.templatePath,callback);
				$.get(context.templatePath+$element.attr('data-view')+'.html'+'?'+Math.random(),function(template){
					//console.log('buildSnippet',template,snippet);
					var utils = new aci.utils;
					filledTemplate = utils.processTemplate(template,snippet);
					//console.log('buildSnippet',filledTemplate);
					callback(filledTemplate,$element);
				});
				
				break;
		}

	};
	
	var showSnippetElement = function(html,$element,onload){
		//console.log('showSnippetElement',html);
		$element.html(html);
		//$element.removeAttr('data-snippet');
		var utils = new aci.utils;
		utils.setHtml($element);
        utils.setBaseUrl($element);
		launchAccordion($element);
		//console.log('showSnippetElement onload',onload);
		if(onload) onload();
	}
	
	var launchAccordion = function($element){

		/*
		 * find each accordion body and set a unique id to trigger collapse and expand
		 */
		$element.find('.accordion-body	').each(function(){
			var uuid = parseInt(Math.floor(Math.random()*101));
			//console.log('launch accordion',$(this),$(this).closest('.accordion-toggle'),uuid);
			$(this).attr('id',uuid);
			$(this).siblings('.accordion-heading').find('a').attr('href','#'+uuid);
		});
		$('.accordion').collapse();
		$('.accordion').css('height','');
/*		$('.accordion').accordion({
			cookieName:  'aci-accoridon-faq'
		});
*/
	}
	
	/*
	 * Show the edit form to update snippet
	 */
	var editSnippet = function(snippet,plugin){
		
		$.get(plugin.settings.templatePath+plugin.settings.editTemplate+'?'+Math.random(),function(template){
				//console.log(template);
				var utils = new aci.utils;
				var filledTemplate = utils.processTemplate(template,snippet);
				switch(snippet.name){
					//in place editing for main article in each page
					case 'main':
						var snippetCtrlr = new aci.controller.page; 
						plugin.inPlace(filledTemplate,'main',snippetCtrlr.saveSnippet);
						//plugin.setReveal(filledTemplate);
						break;
					
					//display edit form in pop-up
					default:
						/*
						 * Some content in the filledTemplate may be HTML which is escaped and needs to unescaped.
						 * This should be done prior to launching the redactor on the element.
						 * So, create a temp element, unescape the html and then send it to setReveal. - HP 10/10/13 
						 */
						$tmpEl = $('<div/>').html(filledTemplate);
						var utils = new aci.utils;
						utils.setHtml($tmpEl);
						plugin.setReveal($tmpEl.html());
						$('.date').datetimepicker({
							//language: 'pt-BR'
						});	
						break;
				}
        	});
	};
	
	/*
	 * Creating a new snippet. Display the form
	 */
	var newSnippet = function($el){
		//console.log('in new Snippet',$el,context.templatePath+'utils/new-snippet.html');
		$.get(context.templatePath+'utils/new-snippet.html',function(template){
			//console.log(template);
			$el.html(template);
		});
	};
	
	/*
	 * Hack. - HP 9/29
	 * We need to let showVideo in the view know that we are passing a referenced data.
	 * Based on that the view determines whether to call processTemplate (for loops) or just fillTemplate.
	 */
	var showVideo = function(data,template,referenced){
		$.get(context.templatePath+'utils/'+template+'.html'+'?'+Math.random(),function(template){
			//console.log(template);
			var utils = new aci.utils;
			if(referenced) var filledTemplate = utils.processTemplate(template,data);
			else var filledTemplate = utils.fillTemplate(template,data);
			$('#myVideo').html(filledTemplate);
			$('#myVideo').bPopup({			
				zIndex: 2,
				modalClose: false
			});
		});
		
	}
	
	/*
	 * Show the edit form for updating the url of the page
	 */
	var editUrl = function(snippet,plugin){
		$.get(plugin.settings.templatePath+plugin.settings.editTemplate,function(template){
			//console.log(template);
			var utils = new aci.utils;
			var filledTemplate = utils.fillTemplate(template,snippet);
			plugin.setReveal(filledTemplate);
		});
	};

	var showForm = function(plugin,data){
		//console.log('aci.view.page showForm',data);
		$.get(plugin.settings.templatePath+plugin.settings.editTemplate,function(form){
			var filledTemplate = utils.processTemplate(form,data);
			plugin.setReveal(filledTemplate,function(){
				utils.setCheckbox($('.modal-body'));
				utils.setSelected($('.modal-body'));
			});
		});
		
	}
	

	return {
		showSnippet: showSnippet,
		editSnippet: editSnippet,
		newSnippet: newSnippet,
		showVideo: showVideo,
		editUrl: editUrl,
		buildSnippetElement: buildSnippetElement,
		showSnippetElement: showSnippetElement,
		launchAccordion: launchAccordion,
		showForm: showForm
	}
};