/*
 * Utilities - we need to take this out of main.js and make it its own library
 * Has functions to create slider, create snippets from data using templates,
 * htmlEscapte utility etc.
 */
aci.utils = function(){
	
	var createSlider = function(sliderContent){
		var slider = '';
		//console.log('createSlider: '+JSON.stringify(sliderContent));
		slides = $(sliderContent);
		slider += '<ul class="rs-slider">';
		slides.each(function(){
			//console.log('each slide: '+JSON.stringify(this.slide));
			slider += '<li id="slide">'+ $('<div/>').html(this.slide).text().replace(/\\r\\n/g, '<br />')+'</li>';
		})
		slider += '</ul>';
		return slider;
	}; 

	var escapeRegExp = function(s) {
	    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
	};
	
/*	var processTemplate = function(template,data){

		//console.log('process template',template,data);
		segment = findControlSegments(template,data);
		//templates = findNestedTemplates(segment[1]);
		//console.log('segment',segment[1],'data',data);
		replacedTemplate = template;
		//console.log(data);
		while(segment != null){
			templates = findNestedTemplates(segment[1]);
			filledSegment = '';
			$option = $('<div/>').html(segment[1]);
			//console.log('$option',$option.html());
			var segmentData = data[$option.children(':first').attr('data-object')];
			values = $option.children(':first').attr('data-key');
			//console.log('segmentData ',$option.children(':first').attr('data-key'),values,segmentData[values].length);
			for(var index=0;index<segmentData[values].length;index++){
				if(segmentData[values][index].hasOwnProperty('type')){
					//console.log('data has type',segmentData[values][index]['type']);
					var type = segmentData[values][index]['type'];
					filledSegment += fillTemplate(templates[type],segmentData[values][index],index);  //passing the index is a hack - the current loop index
				}
				else
					filledSegment += fillTemplate(segment[1],segmentData[values][index],index);
				//console.log('here',segment,filledSegment);
			}
			//console.log('replaced',segment[1],filledSegment);
			escSegment = escapeRegExp(segment[0]);
			//console.log(escSegment);
			replacedTemplate = replacedTemplate.replace(new RegExp(escSegment),filledSegment);
			segment = findControlSegments(replacedTemplate,data);
		}
		//console.log('processTemplate data[content]',data['content']);
			//if(data.hasOwnProperty('content')){ 
				//console.log('ownproperty content');
				//replacedTemplate = fillTemplate(replacedTemplate,data['content']);
			//}
			
		replacedTemplate = fillTemplate(replacedTemplate,data);			
		return replacedTemplate;
			
	}
*/	
	var processTemplate = function(template,data){

		//console.log('process template',template,data);
        //template = template.replace(/(\r\n|\n|\r)/gm,'');
        //template = template.replace(/> +(?= )/g,'>');
        //template = template.replace(/> +(?= )/g,'>');
        //console.log('replaced template',template);
		segment = findControlSegments(template,data);
		//templates = findNestedTemplates(segment[1]);
		//console.log('segment',segment[1],'data',data);
		replacedTemplate = template;
		//console.log(data);
		while(segment != null){
			templates = findNestedTemplates(segment[1]);
			//console.log('ts',templates);
			filledSegment = '';
			$option = $('<div/>').html(segment[1]);
			//console.log('$option',$option.html());
			var segmentData = data[$option.children(':first').attr('data-object')];
			values = $option.children(':first').attr('data-key');
            var removeWrap = $option.children(':first').attr('data-remove-wrap');
            //console.log('remove-wrap flag',removeWrap);
			//console.log('segmentData ',$option.children(':first').attr('data-key'),values,segmentData[values].length);
			//if(typeof segmentData[values] != 'undefined' && segmentData[values] != null){
				for(var index=0;index<segmentData[values].length;index++){
					keyFilled = false;
					//console.log('sgmentData',index);
					//check if templates.size > 0. If yes, there are nested templates.
					if(!jQuery.isEmptyObject(templates)){
						for(var key in templates){
							if(segmentData[values][index].hasOwnProperty(key)){
								//console.log('data has key',key,'-',segmentData[values][index][key]);
								var value = segmentData[values][index][key];
                                var filledTemplate = fillTemplate(templates[key][value],segmentData[values][index],index);  //passing the index is a hack - the current loop index
                                if(removeWrap == 1){
                                    //console.log('remove wrap',$(filledTemplate).find('div:first').html());
                                    filledSegment += $(filledTemplate).html();
                                }
                                else filledSegment += filledTemplate;
								//filledSegment += fillTemplate(templates[key][value],segmentData[values][index],index);  //passing the index is a hack - the current loop index
								keyFilled = true;
							}
							//else filledSegment += fillTemplate(segment[1],segmentData[values][index],index);
							//console.log('filledSeg',filledSegment);
						}
					}
					else{
                        var filledTemplate = fillTemplate(segment[1],segmentData[values][index],index);  //passing the index is a hack - the current loop index
                        if(removeWrap == 1){
                            //console.log('remove wrap alt',$(filledTemplate).html());
                            filledSegment += $(filledTemplate).html();
                        }
                        else filledSegment += filledTemplate;
						//filledSegment += fillTemplate(segment[1],segmentData[values][index],index);
                    }
					//if(!keyFilled)
					//console.log('here',segment,filledSegment);
				}
			//}
			//console.log('replaced',segment[1],filledSegment);
			escSegment = escapeRegExp(segment[0]);
			//console.log(escSegment);
			replacedTemplate = replacedTemplate.replace(new RegExp(escSegment),filledSegment);
			segment = findControlSegments(replacedTemplate,data);
			//console.log('segment after fill',segment);
		}
		replacedTemplate = fillTemplate(replacedTemplate,data);			
		//console.log(replacedTemplate);
		return replacedTemplate;
			
	}
	
	var fillSpecialControls = function(template,data){
		
		var controlSegment = findControlSegments(template);
		//console.log('obj?',$(controlSegment));
		//fillTemplate(controlSegment,data)
		return template;
	};
	
	var findControlSegments = function(template){

          //console.log('before cleanup\n',template);
          //console.log('post cleanup\n',template);

		  var segments = [], re = '\{loop\}(.*)\{\/loop\}', text;
		  //var segments = [], re = '/\{loop\}(\S)*?\{\/loop\}/gi', text;

		  segments = template.match(re);
		 //console.log('segments:',segments);
		  return segments;
		
	}
	
/*	var findNestedTemplates = function(segment){
		var nestedTemplates = {};
		//console.log('nested templates segment',segment);

		$(segment).find('m42tpl').each(function(){
			//console.log('nested found m42tpl',$(this).html(),$(this).attr('data-type'));
			type = $(this).attr('data-type');
			nestedTemplates[type] = $(this).html();
			//console.log(nestedTemplates);
		});
		//console.log('nested templates',nestedTemplates);
		return nestedTemplates;
	}
*/
	var findNestedTemplates = function(segment){
		var nestedTemplates = {};
		//console.log('nested templates segment',segment);
		var i=0;
		$(segment).find('m42tpl').each(function(){
			//console.log('nested found m42tpl',$(this),$(this).attr('data-cond'));
			cond = $(this).attr('data-cond').split(':');
			if(!nestedTemplates.hasOwnProperty(cond[0]))
				nestedTemplates[cond[0]] = {};
			nestedTemplates[cond[0]][cond[1]] = $(this).html();
			i++;
			//console.log(nestedTemplates);
		});
		//nestedTemplates['size'] = i;
		//console.log('nested templates',nestedTemplates);
		return nestedTemplates;
	}
	
	
	/*
	 * Given a template and a json data object, creates an html snippet from it that can be rendered.
	 * The template has the variables declared as {{this.is.a.variable}} allowing easy substitution of 
	 * data given a json object.
	 * The json object needs to have a data.type specified (can be of <object>.type form, where object 
	 * could be a snippet, content etc.). The idea is that for new data types, you can add the required
	 * functionality in the data.type switch.  
	 * 
	 * index - when fillTemplate is called within a loop, indicates the current index of the loop
	 */
	var fillTemplate = function(template,data,index){
		//console.log('data: ',data);
		//data = data.data;
		//Get the variables from the template
		var variables = getVariables(template);
		//console.log('vars:',variables);
		//console.log('template',template);
		var replacedText = template;
		switch(data.type){
			case 'rich-text':
				// do this for every variable in the template
				$.each($(variables),function(i,variable){
					//Replace \r\n with <br>
					content = $('<div/>').html(data[variable]).text().replace(/\\r\\n/g, '<br />');
					var toReplace = '{{'+variable+'}}';
					replacedText = replacedText.replace(toReplace,content);
				});
				break;
		
			case 'faq':
				/*
				 * Faqs have question and answer. 
				 * This needs to take into account that the passed data could have either a single faq
				 * or multiple faqs. Need to apply the template for each faq
				 */
				//console.log('faq',data);
				if(data.hasOwnProperty('_id')){
					var id = data._id.$id;
					template = template.replace("{{_id.$id}}",id);
				}
				if(data.hasOwnProperty('faq') && data.faq.length){
					//There are multiple faqs.
					faqs = data.faq;
					var snippetName = data.name;
					//console.log('here??',faqs);
				}
				else{
					/*
					 * Its a single faq. However, in order to handle both single and multiple faqs the same way,
					 * create a faqs array with a single faq object.  
					 */
					faqs = new Array();
					faqs.push(data.faq);
					//faqs = data;
					var snippetName = data.name;
					//console.log('single',faqs, snippetName);
				}
				var replacedFaqs = '';
				for(i=0,l=faqs.length;i<l;i++){
					replacedText = template;
					//temporary - fixing the snippet.name for each faq. This needs to be done at an abstract level
					//based on data-multi=true kind of scenario.
					replacedText = replacedText.replace("{{snippet.name}}",snippetName);
					faq = faqs[i];
					//console.log(faq);
					$.each($(variables),function(i,variable){
						var toReplace = '{{'+variable+'}}';
						//console.log('faq[variable]',variable,faq[variable]);
						content = $('<div/>').html(faq[variable]).text().replace(/\\r\\n/g, '<br />');
						replacedText = replacedText.replace(toReplace,content);
					});				
					//console.log('faq filled:',replacedText);
					replacedFaqs += replacedText;
				}
				replacedText = replacedFaqs;
				break;

			case 'waiting-families'://alert(JSON.stringify(data.content));
				if(data.hasOwnProperty('content') && data.content.length){
					//There are multiple faqs.
					pics = data.content;
					var snippetName = data.name;
					//console.log('here??',pics);
				}
				cats = pics;
				var replacedCats = '';
				//for(i=0,l=cats.length;i<l;i++){
					replacedText = template;
					//temporary - fixing the snippet.name for each faq. This needs to be done at an abstract level
					//based on data-multi=true kind of scenario.
					replacedText = replacedText.replace("{{snippet.name}}",snippetName);
					cat = cats[0];
					//console.log("Families",cat);
					$.each($(variables),function(vi,variable){
						var toReplace = '{{'+variable+'}}';
						
						if (/:/i.test(variable)) {
							// split it the variable
							var keywords = variable.split(':');
							var lcontent = '';
							var loopContent = '';
							// check for first element
							switch(keywords[0]){
								case 'forloop':
									// docs = cat[keywords[1]];
									docs = cat;
									// 0 is loop, 1 is full array, 2 is individual values in array, 3 is the template.
									// now get the template string and its variables.
									var loopTemplate = context.templatePath+keywords[3]+'.html';
									
									$.ajax({url:loopTemplate, async: false})
									.done(function(loopTemplate){
										// content is in loopTemplate
										var loopVariables = getVariables(loopTemplate);
										// now run the loop.
										//console.log("docdocsget","$$$");
										doclist = '';
										for(ld=0,ldl=docs.length;ld<ldl;ld++){
											doc = docs[ld];
											loopContent = loopTemplate;
											$.each($(loopVariables),function(li,loopVariable){
												var toReplace = '{{'+loopVariable+'}}';
												
												if (/_id\.\$id/i.test(loopVariable)) {
													lcContentValue = doc._id.$id;
												} else if(/\./i.test(loopVariable)) { // if variable is of type image.url or value.key
													var vs = loopVariable.split('.'); // assume 2;
													lcContentValue = doc[vs[0]][vs[1]];
												} else {
													lcContentValue = doc[loopVariable];
												}
												loopContent = loopContent.replace(toReplace, lcContentValue);
											});
											lcontent += loopContent;
											//alert(lcontent);
										}
										//console.log("docdocloopend",lcontent);
									});
									
									
									break;
							}
							//alert(lcontent);
							content = lcontent;
						} 
						else {
							content = $('<div/>').html(cat[variable]).text().replace(/\\r\\n/g, '<br />');
						}
						//console.log("toReplace:",toReplace, " --text:", content);
						replacedText = replacedText.replace(toReplace,content);
					});				
					//console.log('cat filled:',replacedText);
					replacedCats += replacedText;
				//}
				replacedText = replacedCats;
				
				break;

			case 'document-list':
				//console.log('doc-categories',data);
				if(data.hasOwnProperty('list') && data.list.length){
					//There are multiple faqs.
					cats = data.list;
					var snippetName = data.name;
					//console.log('here??',cats);
				}
				
				var replacedCats = '';
				for(i=0,l=cats.length;i<l;i++){
					replacedText = template;
					//temporary - fixing the snippet.name for each faq. This needs to be done at an abstract level
					//based on data-multi=true kind of scenario.
					replacedText = replacedText.replace("{{snippet.name}}",snippetName);
					cat = cats[i];//console.log("docdocscat",cat);
/*					console.log('snippetName',snippetName);
					console.log('catlog',cat);
					console.log('catvariables',$(variables));
					console.log("docdocsnext",145);
*/					$.each($(variables),function(vi,variable){
						var toReplace = '{{'+variable+'}}';
						//console.log('cat[variable]',variable,cat[variable]);
						
						
						/*if (variable == 'doclist') { // this condition is not under use.
							docs = cat.documents;
							
							doclist = '';
							for(d=0,dl=docs.length;d<dl;d++){
								doc = docs[d];
								console.log('cat.doc',doc);
								doclist = doclist + '<li><a href="'+doc.url+'">'+doc.title+'</a></li>';
							}
							content = $('<ol/>').html(doclist).html().replace(/\\r\\n/g, '<br />');
						} else */
						
						if (/:/i.test(variable)) {
							// split it the variable
							var keywords = variable.split(':');
							//console.log('keywordscat',cat);
							var lcontent = '';
							var loopContent = '';
							// check for first element
							switch(keywords[0]){
								case 'forloop':
									docs = cat[keywords[1]];
									// 0 is loop, 1 is full array, 2 is individual values in array, 3 is the template.
									// now get the template string and its variables.
									var loopTemplate = context.templatePath+keywords[3]+'.html';
									
									$.ajax({url:loopTemplate, async: false})
									.done(function(loopTemplate){
										// content is in loopTemplate
										var loopVariables = getVariables(loopTemplate);
										// now run the loop.
										//console.log("docdocsget","$$$");
										doclist = '';//console.log("docdocs",cat);
										for(ld=0,ldl=docs.length;ld<ldl;ld++){
											doc = docs[ld];
											//////console.log("docdoc",doc);
											loopContent = loopTemplate;
											$.each($(loopVariables),function(li,loopVariable){
												var toReplace = '{{'+loopVariable+'}}';
												
												loopContent = loopContent.replace(toReplace, doc[loopVariable])
												//console.log("docdoceach",loopContent);
											});
											lcontent += loopContent;
											//alert(lcontent);
										}
										//console.log("docdocloopend",lcontent);
									});
									
									
									break;
							}
							//alert(lcontent);
							content = lcontent;
						} 
						else {
							content = $('<div/>').html(cat[variable]).text().replace(/\\r\\n/g, '<br />');
						}
						//console.log("toReplace:",toReplace, " --text:", content);
						replacedText = replacedText.replace(toReplace,content);
					});				
					//console.log('cat filled:',replacedText);
					replacedCats += replacedText;
				}
				replacedText = replacedCats;
				
			break;
		
				
			default:
				/*
				 * Catch all for all other types that have no special attributes/rules.
				 */
				//iterate through the variables in the template
				//console.log('in default filltemplate:',data);
				$.each($(variables),function(j,variable){
					content = data;
					//break up the variable of the form content.parameter into its individual 
					//constituents. Iterate through and get the value for the variable
					aVariables = variable.split('.');
					//console.log('variable data:',aVariables);
					for(i=0,l=aVariables.length;i<l;i++){
						content = content[aVariables[i]];
						if(typeof content === 'undefined') content = '';
						//if(/(&lt;)[a-z][\s\S]*(&gt;)/i.test(content))
							//content = $('<div/>').html(content).text().replace(/\\r\\n/g, '<br />');
						//console.log(i,content);
					}
					//content = data;
					//console.log('variable: ',variable,'replacedText :',replacedText);
					var toReplace = '{{'+variable+'}}';
					if(index != 'undefined'){
						if(variable.indexOf('_') == 0 && variable == '_loopindex') replacedText = replacedText.replace(toReplace,index);
						else replacedText = replacedText.replace(toReplace,content);
					}
					else replacedText = replacedText.replace(toReplace,content);
		
				});
			break;
		}
		//console.log(replacedText);
		return replacedText;
	};

    var htmlEscape = function(str) {
        return String(str)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
    };
	
	/*
	 * Extract the variables from the template
	 */
	var getVariables = function (template) {
			//console.log('templateData:',template);
		  var variables = [], re = /{{([^}}]+)}}/g, text;

		  while(text = re.exec(template)) {
		    variables.push(text[1]);
		  }
		  //console.log('variables:',variables);
		  return variables;
	};

	var resetForm = function($form){
		//console.log('reset');
		$form.find('[data-variable]').each(function(i,variable){
    		if($(variable).is(':input')) $(variable).val('');
    		if($(variable).is('textarea')) $(variable).val('');
    		if($(variable).attr('data-type') == 'upload') $(variable).attr('data-file','');
    		if($(variable).attr('data-type') == 'rich-text') $(variable).redactor('set','');
		});
	};
	
	var setCheckbox = function($el){
		//console.log('in setUi',$el);
		$el.find('[data-checked]').each(function(i,$checkbox){
			//console.log('checkbox ',$(this),$(this).attr('data-checked'));
			if($(this).attr('data-checked') == "1")
				$(this).attr('checked',true);
		});
	/* 	if($checkbox.attr('data-checked'))
		$el.each(function(i,$child){
			console.log('setUi child',$child);
			switch($child.prop('tagName')){
				case 'input':
					switch($child.attr('type')){
						case 'checkbox':
							if($child.attr('data-checked'))
								$child.attr('checked',true);
						break;
					}
				break;
			}
		});
	 */
	};

	var setSelected = function($el){
		//console.log('in setSelected',$el,$('.modal-body').find('#form-wrapper'));
		$el.find('[data-selected]').each(function(i,$select){
			//console.log('select ',$(this),$(this).attr('data-selected'));
			$(this).val($(this).attr('data-selected'));
		});
		
	};
	
	/* 
	 * if type of content is escaped html, make sure to set it as html.
	 * The content has an attribute data-type="rich-text" or "html"
	 */
	var setHtml = function($el){
		/*$($el).find('[data-type="rich-text"]').each(function(){
			//console.log('sethtml',$(this).html());
			$(this).html($(this).text());
		});*/
		$($el).find('[data-type="html"]').each(function(){
			$(this).html($(this).text());
		});
	}

    /*
     * Does the link set up needs to have the baseUrl for the app prepended?
     */
    var setBaseUrl = function($el){
        $el.find('a[data-baseurl]').each(function(i,$link){
            //console.log('link',$(this));
            $(this).attr('href',baseUrl+$(this).attr('href'));
        });
    }

	var sort_unique = function (arr) {
	    arr = arr.sort(function (a, b) { return a*1 - b*1; });
	    var ret = [arr[0]];
	    for (var i = 1; i < arr.length; i++) { // start loop at 1 as element 0 can never be a duplicate
	        if (arr[i-1] !== arr[i]) {
	            ret.push(arr[i]);
	        }
	    }
	    return ret;
	}

	var ourLetterSetImage = function($el){
		//console.log('our-letter bigimage',$('.left figure').find('img'),$('.thumbnailBox').find('img'));
		if($el == 'undefined' || $el == null)
			$el = $('.thumbnailBox').find('img').first();
		var imgWidth = '';
		var imgHeight = '';
		imgWidth = $el.width();
		imgHeight = $el.height();
		var cWidth = $('figure').width();
		var cHeight = $('figure').height();
		//console.log('dimensions',cWidth,cHeight,imgWidth,imgHeight);
		if(imgHeight > imgWidth){
			var nHeight = cHeight;
			var nWidth = imgWidth/imgHeight*cHeight; 
		}
		else{
			var nWidth = cWidth;
			var nHeight = imgHeight/imgWidth*cWidth;
		}
		//console.log('ourlettersetimage ',$el,$el.attr('src'),nHeight,nWidth);
		$('.left figure').find('img').attr('src',$el.attr('src'));
		$('.left figure').find('img').css('width',nWidth);
		$('.left figure').find('img').css('height',nHeight);		
/*		console.log('our-letter bigimage',$('.left figure').find('img'),$('.thumbnailBox').find('img'));
		if($el != 'undefined' && $el != null){
			console.log('ourlettersetimage ',$el,$el.attr('src'));
			$('.left figure').find('img').attr('src',$el.attr('src'));
		}
		else
			$('.left figure').find('img').attr('src',$('.thumbnailBox').find('img').first().attr('src'));
*/	}

	var getPage = function (el,actionUrl,qparams,elToUpdate){
		var page = $(el).closest('ul').attr('data-page');
		//console.log($(el));
		var dir = $(el).attr('data-dir');
		if(dir == '1'){
			++page;
			if(page > $(el).parent().attr('data-pages')){
				page--; 
				$(el).addClass('disabled');
				return;
			}
			$(el).parent().attr('data-page',page);
			$(el).siblings().removeClass('disabled');
		} 
		else{ 
			--page;
			if(page == 0){
				$(el).addClass('disabled');
				page = 1;
				return;
			}
			$(el).parent().attr('data-page',page);
			$(el).siblings().removeClass('disabled');
		}	
		
		$.ajax({
			url: baseUrl+actionUrl+'?page='+page,
			type: 'GET',
			//dataType: 'json',
			success: function(data){
				if(data != '')
					$('#'+elToUpdate).html(data);
			} 
		});			
		return false;
	}
	
	var youtubeUrltoEmbed = function($el){
		$el.find('a').each(function(){
			//console.log('youtubeUrlEmbed',$(this),$(this).attr('href'));
			var url = $(this).attr('href');
			var id = getYoutubeVideoId(url);
			$(this).attr('href','http://www.youtube.com/embed/'+id+'?autoplay=1');
		})
	}

    var setTagsManager = function(prefilled,source,ajaxPush,ajaxPushParameters){
        //console.log('setTagsManager called',$('.tm-input'),prefilled);
        aprefilled = prefilled.split(',');
        var aPush = null;
        var aPushParams = null;
        if(typeof ajaxPush != 'undefined' || ajaxPush != null){
            aPush = ajaxPush;
            if(typeof ajaxPushParameters != 'undefined' || ajaxPushParameters != null){
                aPushParams = ajaxPushParameters;
            }
        }
        //console.log('tags manager set',aPush,aPushParams);
        $('.tm-input').tagsManager({
            typeahead: true,
            prefilled: aprefilled,
            //typeaheadAjaxSource: null,
            typeaheadSource: source,
            blinkBGColor_1: '#FFFF9C',
            blinkBGColor_2: '#CDE69C',
            hiddenTagListId: 'hiddentags',
            AjaxPush: aPush,
            AjaxPushParameters: aPushParams,
            AjaxPushAllTags: true
            //hiddenTagListName: 'hiddentags'
        });
    }

    var setDatetimePicker = function($el,pDate,pTime){
        var options = {};
        pDate = typeof pDate!=undefined?pDate:true;
        pTime = typeof pTime!=undefined?pTime:true;
        if(!pDate) options.pickDate = false;
        if(!pTime) options.pickTime = false;
        $el.datetimepicker(options);
    }

    return{
		createSlider: createSlider,
		fillTemplate: fillTemplate,
		htmlEscape: htmlEscape,
		resetForm: resetForm,
		setCheckbox: setCheckbox,
		processTemplate: processTemplate,
		escapeRegExp: escapeRegExp,
		sort_unique: sort_unique,
		setSelected: setSelected,
		setHtml: setHtml,
        setBaseUrl: setBaseUrl,
		ourLetterSetImage: ourLetterSetImage,
		getPage: getPage,
		youtubeUrltoEmbed: youtubeUrltoEmbed,
        setTagsManager: setTagsManager,
        setDatetimePicker: setDatetimePicker
	}
}

var utils = new aci.utils;
