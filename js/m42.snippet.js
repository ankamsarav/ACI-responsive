// Utility - create Object
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {};
		F.prototype = obj;
		return new F();
	};
}

(function( $, window, document, undefined ) {
	
	var counter = 0;
	var content='';

	var M42Snippet = {
		
		/* Initialization*/
		init: function(options, elem){

			//console.log(this,'settings',$.fn.m42Snippet.settings);
			var plugin = this;
			plugin.elem = elem;
			plugin.$elem = $(elem);

			/*
			 * Extend the default settings with user supplied ones
			 */
	        plugin.settings = $.extend({}, $.fn.m42Snippet.settings, options);
	        plugin.settings.$element = $(elem);
	    	plugin.clickEnable = true;
	    	/*
	    	 * Capture click event
	    	 */
	    	plugin.$elem.click(function(){
	    		//console.log('clicked');
	    		if(plugin.settings.onClick != null) 
	    			plugin.onClick();
	    		return false;
	    	}) 
	    	/*
	    	 * Wrap the element with 'edit' class - 
	    	 */
            var snippet = plugin.$elem.html();
            //snippet = plugin._wrap(snippet,counter);
			plugin.$elem.html(snippet);
			plugin.$elem.addClass('edit');
			counter++;
			/*
			 * If callback function supplied, call it
			 */
	    	if(plugin.settings.afterInit != null){
	    		//console.log('after Init');
	    		plugin.settings.afterInit(plugin);
	    	}
		},	
		
		onClick: function(){
			var plugin = this;
			//console.log(plugin.clickEnable);
			//console.log('clicked',plugin.$elem);
			var params = null;
			var aggregates = null;
			var sort = null;
			if(plugin.$elem.hasAttr('data-params')) params = plugin.prepareParams(plugin.$elem.attr('data-params'));
			else params = null;
			if(plugin.$elem.hasAttr('data-aggregate')) aggregates = plugin.prepareParams(plugin.$elem.attr('data-aggregate'));
			else aggregates = null;
			if(plugin.$elem.hasAttr('data-sort')) sort = plugin.prepareParams(plugin.$elem.attr('data-sort'));
			else sort = null;
			//console.log('params',params,'aggregate',aggregates);
			if(plugin.clickEnable){
				//remove the previous reveal contents
				$('#'+plugin.settings.dialog).find('#content').html('');
				plugin.settings.onClick(plugin,params,aggregates,sort);
			}
		},

		/*
		 * Prepare params - params in the element are specified as a string of the form first.param:fvalue;second.param:svalue etc. 
		 * Create a json object from this string.
		 */
		prepareParams: function(params){
			var plugin = this;
			var aParams = params.split(';');
			//console.log('aParams:',aParams);
			var listParams = {};
			for(i=0,l=aParams.length;i<l;i++){
				var p = aParams[i].split(':');
				//console.log('split',p[0],p[1]);
				/* Checking to see if the value is a number. If it is store it is as a number
				 * Potential issues with this - you could be converting something that you don't want to convert
				 * Other option - check if the param is a 'seq' and convert it to number. Not an elegant solution. - HP 7/20/13 
				 */
				if(plugin.isNumber(p[1]))
					listParams[p[0]] = parseInt(p[1]);
				else
					listParams[p[0]] = p[1];
/*				if(isNaN(parseInt(p[1])))
					listParams[p[0]] = p[1];
				else
					listParams[p[0]] = parseInt(p[1]);
*//*				if(typeof(p[1]) == 'integer') 
					listParams[p[0]] = parseInt(p[1]);
				else
					listParams[p[0]] = p[1];
*/				//console.log('lp',listParams);
			}
			return listParams;
		},
		
		isNumber: function(value){
			  return !isNaN(parseFloat(value)) && isFinite(value);
		},
		
		/*
		 * Get the dialog up and running.
		 */
		setReveal: function(content,snippetName){
			var plugin = this;
	    	plugin.setDialog(content);
	    	plugin.prepareUi(snippetName);

	    	/*$('#'+plugin.settings.dialog).slimscroll({
	    		  height: 'auto'
	    		});*/

		},
		
		/*
		 * Launch the redactor editor inplace as opposed to in a dialog
		 */
		inPlace: function(content,snippetName,saveCallback){
			var plugin = this;
			//console.log('inplace',plugin.$elem);
			plugin.$elem.removeClass('edit');
	    	//$('[data-snippet="'+snippetName+'"]').removeClass('edit');
	    	//console.log('inPlace click',plugin.clickEnable);
	    	//disable click on the element, while editing.
	    	plugin.clickEnable = false;
	    	$el = $('[data-snippet="'+snippetName+'"]'); 
	    	$el.attr('data-orig-height',$el.css('height'));
	    	//set the height of the editor - need to be part of settings instead of hardcoding it.
	    	$('[data-snippet="'+snippetName+'"]').css('height','400px');  
	    	plugin.launchEditor($('[data-snippet="'+snippetName+'"]'),true);
	    },
	    
	    /*
	     * Launch the editor
	     */
	    launchEditor: function($el,inplace){
	    	var plugin = this;
	    	//console.log('in launch:',$el);
	    	plugin.content = $el.html();
	    	var destroyAfterSync = false;
	    	var elHeight = $el.css('height');
	    	$el.redactor({
	    		focus: true,
	    		buttons: ['html', '|', 'formatting', '|', 'bold', 'italic', 'underline', 'deleted', '|', 'unorderedlist', 'orderedlist', 'outdent', 'indent', '|', 'table', '|', 'alignment', '|', 'horizontalrule','|','link'],
                plugins: ['fullscreen','mmimage','ytvideo','linkpage'],
                imageUpload: baseUrl+'/index.php?r=page/file',
                clipboardUpload: true,
                clipboardUploadUrl: baseUrl+'/index.php?r=page/file',
                observeImages: false,
                convertDivs: false,
	    		syncAfterCallback: function(html){
   					if(destroyAfterSync){
   						//console.log('after sync',$el);
   						//$el.addClass('edit');
   						//$el.destroyEditor();
   						//remove the custom button. Seems to remove it, but it still is retained, when the editor is launched again.
   						this.buttonRemove('button1');
   						this.destroy();
   						//$el.css('height',$el.attr('data-orig-height'));
   						
   						$el.css('height','');
   					}
   				},
                initCallback: function(){
                    if(typeof plugin.settings.initRedactor != 'undefined') plugin.settings.initRedactor($el);
                }

	    	});
	    	//console.log('button:',$el.redactor('buttonGet','button1').length);

	    	//Add the save button. This should be added only when we do inplace editing. The dialog one will have its own Save button.
	    	if(inplace){
		    	if($el.redactor('buttonGet', 'save').length == 0){
		    		//console.log('button1 does not exist');
		    		$el.redactor('buttonAdd','save','Save',
		    				function(buttonName, buttonDOM, buttonObject) {
                            unbindRedactorElements();
		                	destroyAfterSync = true;
		    				this.sync();
		    				//console.log('element? ',$el);
                            data = {};
		    				data.data = {};
		    				data.snippet = plugin.settings.snippet;
		    				//get the editor content
                            plugin.settings.onRedactorSave($el);
		    				data['data'][$el.attr('data-variable')] = plugin.htmlEscape(this.get());
		    				//console.log(data['data'][$el.attr('data-variable')]);
		    				plugin.save(data);
		    				//plugin.settings.saveCallback(data,afterSave);
		    				plugin.clickEnable = true;

	                	}
		    		);
		    	}
	
		    	if($el.redactor('buttonGet', 'cancel').length == 0){
		    		//console.log('button1 does not exist');
		    		$el.redactor('buttonAdd','cancel','Cancel',
		    				function(buttonName, buttonDOM, buttonObject) {
		                	//destroyAfterSync = true;
		    				//console.log('editor cancel',plugin);
                            unbindRedactorElements();
		    				this.destroy();
		                	plugin.closeModal();
	   						$el.css('height','');
		                	$el.html(plugin.content);
	/*	    				this.sync();
		    				//console.log('element? ',$el);
		    				data = {};
		    				data.data = {};
		    				data.snippet = plugin.settings.snippet;
		    				//get the editor content
		    				data['data'][$el.attr('data-variable')] = plugin.htmlEscape(this.get());
		    				//console.log(data['data'][$el.attr('data-variable')]);
		    				plugin.save(data);
	*/	    				//plugin.settings.saveCallback(data,afterSave);
		    				plugin.clickEnable = true;
	                	}
		    		);
		    	}
	    	}
            bindRedactorElements();
        },

	    /*
	     * prepare the dialog and launch it. 
	     */
	    setDialog: function(content){
			var plugin = this;
			//console.log('setDialog:', plugin.settings.dialog);
			//plugin.settings.clonedDialog = $('#'+plugin.settings.dialog);
			if(plugin.settings.dialog == 'myModal'){
				$('#'+plugin.settings.dialog).find('.modal-body').html(content);
		       	options = {};
	        	options.backdrop = 'static';
				plugin.settings.reveal = $('#'+plugin.settings.dialog).modal(options);
	        	//Handle the Save click. Need to write for the Cancel button
	        	$('#'+plugin.settings.dialog).find('#revealSave').on('click',function(evt){
	        		/*
	        		 * #content of the dialog contains the form (template) for edit
	        		 */
	        		data = plugin.getSnippetData($('#'+plugin.settings.dialog).find('.modal-body'));
	        		//console.log('plugin onsave click ',data);
	        		plugin.save(data);
	        		evt.stopImmediatePropagation();
	        		return false;
	        	});
	        	$('#'+plugin.settings.dialog).find('#revealCancel').on('click',function(){
	        		$('#'+plugin.settings.dialog).modal('hide');
	        		//data = pgin.getSnippetData($('#'+pgin.settings.dialog).find('.modal-body'));
	        		//console.log('pgin onsave click ',data);
	        		//pgin.save(data);
	        		return false;
	        	});
	        	$('#'+plugin.settings.dialog).find('#revealReset').on('click',function(){
	        		plugin.resetForm($('#'+pgin.settings.dialog));
	        		$('#'+plugin.settings.dialog).find('#revealSave').html('Save').removeAttr('disabled');
	        		//data = pgin.getSnippetData($('#'+pgin.settings.dialog).find('.modal-body'));
	        		//console.log('pgin onsave click ',data);
	        		//pgin.save(data);
	        		return false;
	        	});
				$('.date').datetimepicker({
					//language: 'pt-BR'
				});	
				$('.time').datetimepicker({
					pickDate: false
					//language: 'pt-BR'
				});	
			}
			else{
				$('#'+plugin.settings.dialog).find('#content').html(content);
				plugin.settings.reveal = $('#'+plugin.settings.dialog).reveal({close: plugin.closeReveal,plugin: plugin});
	        	$('#'+plugin.settings.dialog).find('#revealSave').on('click',function(){
	        		/*
	        		 * #content of the dialog contains the form (template) for edit
	        		 */
	        		data = plugin.getSnippetData($('#'+plugin.settings.dialog).find('#content'));
	        		//console.log('plugin onsave click ',data);
	        		plugin.save(data);
	        		return false;
	        	});
			}
        	//Increase the opacity of all the other elements other than the one being edited. There are issues with this.
    		//plugin.$elem.siblings().animate({'opacity':0.4},300);
    		//plugin.$elem.css('opacity','1');
	    },
	    
	    /* 
	     * Prepare the UI for display
	     */
	    prepareUi: function(){
			var plugin = this;
            console.log($('[data-type]'));
        	$('[data-type]').each(function(i,$el){
        		console.log($el);
        		if($(this).attr('data-type') !== false){
        			switch($(this).attr('data-type')){
        				/*
        				 * enable Dropzone for file upload 
        				 */
        				case 'upload':
        					//console.log('upload div');
        					var self = $(this);
        					$(this).dropzone({ url: baseUrl+"f", 
        						init: function() {
        							this.on("addedfile", function(file) { 
        								//console.log("Added file.",file.name);
        								self.attr('data-file',file.name);
        							});
        						},
        						success: function(e,data){
    								//console.log("Saved file.",baseUrl+data);
        							self.attr('data-file',baseUrl+data);
        						},        						
        						previewTemplate: '<div id="previewTemplate" class="dz-preview dz-image-preview"><div class="dz-details"><div class="dz-filename" style="display:none"><span data-dz-name></span></div>    <div class="dz-size"  style="display:none" data-dz-size></div><img data-dz-thumbnail alt=""/></div><div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div></div>',
        					});
        					break;
        				/*
        				 * Rich-text. Launch the editor
        				 */	
        				case 'rich-text':
        					console.log('rich text',$(this));
       						$(this).html($(this).text()); //has a side effect of messing with already formatted htmls
        					plugin.launchEditor($(this));
        			}
        		}
        	});
	    },
	    
	    /*
	     * Get the data and call the defined callback for save.
	     * params, aggregates and sort specified in the element are sent
	     */
	    save: function(data){
	    	var plugin = this;
	    	var aggregates = null;
	    	var params = null;
	    	var sort = null;
			if(plugin.$elem.hasAttr('data-params')) params = plugin.prepareParams(plugin.$elem.attr('data-params'));
			else params = null;
			if(plugin.$elem.hasAttr('data-aggregate')) aggregates = plugin.prepareParams(plugin.$elem.attr('data-aggregate'));
			else aggregates = null;
			if(plugin.$elem.hasAttr('data-sort')) sort = plugin.prepareParams(plugin.$elem.attr('data-sort'));
			else sort = null;
			//console.log('params',params,'aggregate',aggregates,'afterSave',this);
    		plugin.settings.saveCallback(data,params,aggregates,sort,this);

	    },
	    
	    /*
	     * Once save is clicked, call Closereveal. Change opacity of the siblings. Currently used only for this.
	     */
	    closeReveal: function(revealOptions){
	    	//var plugin = this;
	    	//console.log(revealOptions);
	    	//Do we need to do this? Shouldn't 'this' work? Recheck this code.
	    	plugin = revealOptions.plugin;
	    	//console.log('reveal closed:',plugin);
	    	plugin.clickEnable = true;
	    	//console.log('cr - plguin elem:',plugin.$elem);
	    	plugin.$elem.css('opacity','1');
	    	plugin.$elem.siblings().animate({'opacity':1},300);
	    	//console.log(plugin.settings.reveal);
	    	//$('#'+plugin.settings.dialog).remove();
	    	//$('body').append(plugin.settings.clonedDialog);
	    },
	    
	    /*
	     * Get the snippet data from the form when Save is clicked on the dialog, or within the inplace editor
	     */
	    getSnippetData: function($form){
	    	var plugin = this;
	    	data = {};
	    	data.data = {};
	    	data.snippet = plugin.settings.snippet;
	    	//console.log('getSnippetData ',plugin.settings.snippet);
	    	//console.log('$form:',$form);
	    	/*
	    	 * For each variable in the form, get the associated data. Different based on type of element - text is different from rich-text is different from upload. 
	    	 */
	    	$form.find('[data-variable]').each(function(i,variable){
	    		if($(variable).is(':input')) data['data'][$(variable).attr('data-variable')] = $(variable).val();
	    		if($(variable).is('textarea')) data['data'][$(variable).attr('data-variable')] = $(variable).val();
	    		if($(variable).attr('data-type') == 'upload') data['data'][$(variable).attr('data-variable')] = $(variable).attr('data-file');
	    		if($(variable).attr('data-type') == 'rich-text') data['data'][$(variable).attr('data-variable')] = plugin.htmlEscape($(variable).redactor('get'));
                if($(variable).attr('data-type') == 'tags'){
                    hiddentag = 'hidden'+$(variable).attr('data-variable');
                    //console.log('tags related',$(variable),$(variable).attr('data-taglist'));
                    hiddentag = $(variable).attr('data-taglist');
                    data['data'][$(variable).attr('data-variable')] = $('#'+hiddentag).val(); //naming scheme for hidden tags of tagsmanager - "hidden"+variable name
                }
	    		//console.log('getSnippetData.each - variable: ',$(variable).attr('data-variable'),'value: ',data['data'][$(variable).attr('data-variable')]);
	    		//if($(variable).attr('data-type') == 'upload') console.log($(variable).attr('data-file'));
	    	});
	    	return data;
	    },
	    
	    /*
	     * Wrapping the element with a div
	     */
	    _wrap: function(snippet,i){
			var plugin = this;
            return $('<div id="m42snip'+i+'"/>').html(snippet);
	    },
	    
	    /*
	     * utility function for escaping various html tags.
	     */
	    htmlEscape: function(str) {
	        return String(str)
	                .replace(/&/g, '&amp;')
	                .replace(/"/g, '&quot;')
	                .replace(/'/g, '&#39;')
	                .replace(/</g, '&lt;')
	                .replace(/>/g, '&gt;');
	    },
		
	    /*
	     * When Save is clicked on the dialog, the controller's save is called. This function handles the return from the server. 
	     * Primarily to close the dialog only when the save is successful.
	     */
		afterSave: function() {
			//console.log('plugin.afterSave',this.settings.element);
		    //$('#'+plugin.settings.dialog).find('#revealSave').unbind('click');
			//$('#'+this.settings.dialog).trigger('reveal:close');
			this.destroy();
			this.$elem.addClass('edit');
			
		 },

	    closeModal: function(){
			this.$elem.addClass('edit');
	    	this.clickEnable = true;
            unbindRedactorElements();
	    	$('#'+this.settings.dialog).modal('hide');
	    },

		destroy: function(){
			//this.$elem.unbind('click');
			$('#'+this.settings.dialog).find('.modal-body').html('');
			$('#'+this.settings.dialog).find('#modalSave').html('Save').off('click');
			this.closeModal();
			//this.$elem = null;
		},
	    	    
	};

	 $.fn.m42Snippet = function( options ) {
	     //return this.each(function() {
	    	 var m42Snippet = Object.create(M42Snippet);
	    	 m42Snippet.init(options,this);
	    	 return m42Snippet;
	     //});
	 };
	
	
	// Plugin definition.
    $.fn.m42Snippet.settings = {
    	dialog: 'revealEdit',
    	templatePath: window.location.origin+baseUrl+'themes/aci/templates/',
    	snippet: '',
    	onClick: null,
    	saveCallback: null,
    	afterInit: null,
    	reveal: null,
    	inPlaceContent: '',
    };

    $.fn.m42Snippet.click = function() {
    	this.onClick(this,null,null,null);	
    } ;   

/*	$.fn.m42Snippet.aferSave = function() {
		console.log('plugin.afterSave',$('#'+this.settings.dialog));
		$('#'+plugin.settings.dialog).trigger('reveal:close');
	};
*/    
    // End of closure.
 
})( jQuery, window, document );

// End m42snippet plugin

/*
 * Ignore this for now.
 */

(function($){
	$.fn.m42Slider = function() {
		
		return this.each(function(){
			//console.log('m42slider');
			$(this).m42Snippet();
		});
		
		var extensions = {
			clicked: function(){
				//console.log('clickked',$(this));
			}
			
		};
		
		$.extend(true,$['fn']['m42Snippet'].prototype,extensions);
	};
})(jQuery);

$.fn.hasAttr = function(attr) { 
	var attribVal = this.attr(attr); 
	return (attribVal !== undefined) && (attribVal !== false); 
};
