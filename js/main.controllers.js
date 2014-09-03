/*
 * Controller - youtube videos
 */

aci.controller.yt_video = function(){
    var afterVideosReady;

    var getVideos = function(callback){
        var ytVideo = new aci.model.yt_video;
        ytVideo.getVideos(gotVideos);
        afterVideosReady = callback;
    }

    var gotVideos = function(data){
        var viewYtVideo = aci.view.yt_video;
        //viewYtVideo.prepareVideoList(data,function(){
            window[afterVideosReady(data)];
        //});

    }

    return{
        getVideos: getVideos,
        gotVideos: gotVideos
    }
}

/*
 * Controller - family
 */
aci.controller.waiting_families = function(){
	var plugin;
	var params;
	
	var setPlugin = function(pg){
		plugin = pg;
	}
	
	var editProfile = function(ps,pg){
		plugin = pg;
		//console.log('in controller.family edit',plugin.settings.$element);
		params = plugin.settings.$element.attr('data-params');
		var aggregate = plugin.settings.$element.attr('data-aggregate');
		var model = new aci.model.waiting_families;
		model.getProfile(params,aggregate,profileLoaded);
	};
	
	var profileLoaded = function(data){
		var view = new aci.view.waiting_families;
		view.showForm(data,plugin);
	}
	
	return{
		setPlugin: setPlugin,
		editProfile: editProfile,
		profileLoaded: profileLoaded
	}
	
}

/*
 * Controller - snippet
 * Serves as a router primarily. Whenever a model function is called, a callback function to the controller is passed
 */
aci.controller.snippet = function(){
	var plugin;

	var setPlugin = function(pg){
		plugin = pg;
	}
	
	var addSnippet = function(pg){
		plugin = pg;
		var snippet = {};
		snippetLoaded(plugin.$elem.attr('data-content-type'),snippet,plugin);
	};
	
	var editSnippet = function(params,pg){
		plugin = pg;
		//console.log('in controller.snippet edit',plugin.settings.$element);
		var model = new aci.model.snippet;
		model.getSnippet(params,plugin.settings.$element.attr('data-content-type'),snippetLoaded);
	};
	
	/*
	 * Callback once snippet is retrieved from the server
	 */
	var snippetLoaded = function(contentType,snippet){
		//console.log('snippetLoaded ',snippet);
		var view = new aci.view.snippet;
		view.showSnippetForm(contentType,snippet,plugin);
	};
	
	var save = function(snippet,params,aggregates,sort,oPlugin){
		//console.log('snippet save ',snippet);
		setPlugin(oPlugin);
		var model = new aci.model.snippet;
		model.save(snippet,plugin.settings.$element.attr('data-content-type'),params,aggregates,sort,afterSave);
	}
	
	var afterSave = function(data){
		//console.log('in controller.snippet.afterSave');
		plugin.afterSave(true);
	}
	
	return{
		addSnippet: addSnippet,
		editSnippet: editSnippet,
		snippetLoaded: snippetLoaded,
		save: save,
		setPlugin: setPlugin
	}
};

/*
 * Controller - page
 */
aci.controller.page = function(){
	var model = aci.model;
	var $snippetElement;
	var $targetElement;
	var page ;
	var plugin;
	var ps;  //params
	var onloadComplete;
    var afterGetPages;
	
	var setSnippetElement = function($element){
		$snippetElement = $element;
		/*
		 * Set targetElement to be same as the snippetElement. 
		 * If required targetElement may be modified by other actions.
		 */
		$targetElement = $element;
	};
	
	var setPlugin = function(pg){
		plugin = pg;
	}
	
	/*
	 * Creating a new snippet - prepare the ui. No model call. Don't think this is used.
	 */
	var prepareNew = function(url,$snippetElement){
		var view = new aci.view.page;
		view.newSnippet($snippetElement);
	};
	
	/*
	 * Get content for page. Not used.
	 */
	var getPage = function(url){
		page = new aci.model.page;
		page.setUrl(url);
		page.loadContent(this.contentLoaded);
	}; 

    var getPages = function(callback){
        var page = new aci.model.page;
        page.getPagesList(gotPagesList);
        afterGetPages = callback;
    };

    var gotPagesList = function(data){
        window[afterGetPages(data)];
    };
	/*
	 * Get snippet for the url and any additional params passed.
	 */
	var getSnippet = function(url,params,aggregates,sort,snippet){
		ps = params;
		page = new aci.model.page;
		page.setUrl(url);
		page.loadSnippet(snippet,null,aggregates,sort,this.snippetLoaded);
	};
	
	/*
	 * Get the referenced snippet(s) - refs - from the collection identified by
	 * referenced
	 */
	var getReferenced = function(referenced,refs){
		if($snippetElement.hasAttr('data-params')) var ps = $snippetElement.attr('data-params');
		if($snippetElement.hasAttr('data-aggregate')) var aggregate = $snippetElement.attr('data-aggregate');
		//console.log('getReferenced: ',referenced,refs);
		
		page = new aci.model.page;
		page.getReferenced(referenced,refs,ps,aggregate,gotReferenced);
		//page.getReferenced(referenced,id,gotReferenced);
	}
	
	/*
	 * Callback after the referenced snippets are got.
	 * Referenced data is returned as an array of data objects.
	 * Eg. could be data['object'] + data['anotherobject'] etc. 
	 * The actual content for each object is in data['object'][<values>].
	 * 
	 * If the snippetElement has target set, then the view displays the
	 * data in the targetElement
	 * 
	 * onloadComplete is still defined on the snippetElement.
	 */
	var gotReferenced = function(data){
		if(typeof $targetElement == 'undefined')
			$targetElement = $snippetElement;
		if($snippetElement.hasAttr('data-target')){ 
			$targetElement = $($snippetElement.attr('data-target'));
		}
		//console.log('gotReferenced ',$snippetElement,$targetElement);
		//console.log('gotReference: ',data,$snippetElement,$targetElement);
		view = new aci.view.page;
		if($snippetElement.hasAttr('data-onloadcomplete'))
			onloadComplete = $snippetElement.attr('data-onloadcomplete');
		else onloadComplete = null;
		view.buildSnippetElement(data,$targetElement,function(html,$snippetElement){
//			var onloadComplate = null;
/*			if($snippetElement.hasAttr('data-onloadcomplete'))
				onloadComplete = $snippetElement.attr('data-onloadcomplete');
			else onloadComplete = null;
*/			//console.log('gotReferenced olc',$snippetElement,onloadComplete);
			view.showSnippetElement(html,$targetElement,function(){ if(onloadComplete != null) window[onloadComplete]()});
		});
	}
	
	/*
	 * Callback after snippet is got
	 */
	var snippetLoaded = function(snippet){
		//console.log('snippetloaded ',snippet);
		if(snippet != null){
			var view = new aci.view.page;
			view.showSnippet(snippet,$snippetElement);
		}
		else
			$snippetElement.css('display','none');
	};
	
	/*
	 * Update snippet
	 */
	var editSnippet = function(plugSnippet,params,aggregates){
		//console.log('plugin called:',plugSnippet.settings.template);
		plugin = plugSnippet;
		$snippetElement = plugSnippet.$elem;
		page = new aci.model.page;
		//console.log('context url:',context.url);
		page.setUrl(context.url);
		var ps = null;
		var aggregate = null;
		if($snippetElement.hasAttr('data-params')) ps = $snippetElement.attr('data-params');
		if($snippetElement.hasAttr('data-aggregate')) aggregate = $snippetElement.attr('data-aggregate');
		/*
		 * Check if the data is from a referenced document.
		 */
		if(plugSnippet.$elem.hasAttr('data-source')){
			
			//showSnippetEdit(plugSnippet)
			//console.log(plugSnippet.$elem.attr('data-source'));
			if(plugSnippet.$elem.hasAttr('data-id')){
				refs = new Array();
				ids = {};
				ids.id  = plugSnippet.$elem.attr('data-id');
				//console.log('ids',ids);
				refs.push(ids);
				//console.log('refs',refs);
			}
			else refs = null;
			referenced = plugSnippet.$elem.attr('data-source');
			page = new aci.model.page;
			page.getReferenced(referenced,refs,ps,aggregate,function(data){
				//snippet = data['object']['values'][0];
				snippet = data;
                /*
                 *  check if the edit needs to be inplace - HP 1/22/2014
                 *  If inplace, snippet.name = name of the snippet in the html
                 *  if not, it needs to be set or referenced.
                 *  Influences the way the view handles the display of the editor - in place or in a dialog.
                 */
                //console.log('inplace edit?',plugSnippet.$elem.attr('data-inplace'));
                if(plugSnippet.$elem.hasAttr('data-inplace') && plugSnippet.$elem.attr('data-inplace') == true)
                    snippet.name = plugSnippet.$elem.attr('data-snippet');
                else snippet.name = referenced;
				showSnippetEdit(plugSnippet,snippet);
			});
			
		}
		else{
			page.loadSnippet(plugSnippet.settings.snippet,params,aggregates,null,function(snippet){
				showSnippetEdit(plugSnippet,snippet);
			});
		}
	};
	
	
	var showSnippetEdit = function(plugSnippet,snippet){
		//console.log('plugin passed:',plugSnippet.settings.template);
		//console.log('snippet: ',snippet);
		var view = new aci.view.page;
		view.editSnippet(snippet,plugSnippet);
	};

	/*
	 * One thing here - I don't think we need to pass the plugin object from the plugin call to 
	 * the controller functions. If we instantiate a controller object for each snippet on the page,
	 * and set the plugin object in the controller after we instantiate the plugin, we should have
	 * access to the right plugin. 
	 */
	var saveSnippet = function(content,params,aggregates,sort,oPlugin){
		//console.log(plugin,oPlugin,params,aggregate);
		//plugin = oPlugin;
		//console.log('url: ',context.url,' content: ',content, 'params: ',params,'plugin: ',oPlugin);
		//setPlugin(oPlugin);
		//Totally failed in the ability to create JS objects.like.this from
		//the keys and values in the content. Sending it as it is, since in
		//reality we do not need to convert them further. On the server,
		//the update criteria really needs to use the keys.as.it.were when updating
/*		j=0;
		var vs = {};
		for(var key in content){
			aKey = key.split('.');
			var currObj = vs;
			var splits = new Array;
			splits = splitVariable(vs,splits);
			for(i=0,l=aKey.length;i<l-1;i++){
				console.log(splits);
				if(aKey[i] != splits[i]){
					console.log('loop: ',i,currObj,vs);
				//if(typeof currObj[aKey[i]] === 'undefined'){
					currObj[aKey[i]] = {};
					currObj = currObj[aKey[i]];
			
					//variables = currObj;
					console.log('loop: ',i,currObj,'variables:',vs);
				//}
				}
			}
			if(aKey[i] != splits[i]) {
				currObj = currObj[aKey[i-1]];
				currObj[aKey[i]] = {};
				currObj = currObj[aKey[i]];
				//currObj[aKey[i-1]][aKey[i]] = content[key];
			}
				currObj[aKey[i]] = content[key];
			//vs = currObj;
			//if(i-1) variables[aKey[i-1]] = content[key];
			//variables[aKey[i]] = content[key];
			//variable = content;
			console.log('key: ',key,'value: ',vs);
			j++;
			for(var prop in vs)
				console.log(vs[prop]);
		}*/
		var mPage = new aci.model.page;
		if(plugin.$elem.hasAttr('data-source')){
			var id = null;
			var params = null;
			if(plugin.$elem.hasAttr('data-id'))
				id = plugin.$elem.attr('data-id');
			if(plugin.$elem.hasAttr('data-params'))
				var params = plugin.$elem.attr('data-params'); 
			if(plugin.$elem.hasAttr('data-aggregate'))
				var aggregate = plugin.$elem.attr('data-aggregate'); 
			referenced = plugin.$elem.attr('data-source');
			//console.log('save referenced',referenced,id,plugin.$elem,params,aggregate);
            //console.log('content to save',content);
			mPage.saveReferencedSnippet(content,referenced,id,params,aggregate,function(){plugin.afterSave(true);});
		}
		else{
			
			//if(context.mode == 'create')
			//	mPage.createSnippet(content,params,aggregates,sort,afterSave);
			//else
			mPage.saveSnippet(content,params,aggregates,sort,afterSave);
		}

	};
	
	//var saveLetter = function(content,params,aggregates,sort,)
	
	var afterSaveRef = function(data){
		$snippetElement = plugin.$elem;
		$targetElement = plugin.$elem;
		gotReferenced(data);
		plugin.afterSave(true);
	};
	
	/*
	 * This has gotten really ugly - HP 9/29
	 * For some reason, the data-snippet attribute disappears once the concerned snippet is loaded - only in the case of referenced data
	 * So, a hack. 
	 * Check if it has data-source, then it is referenced and therefore, don't look for data-snippet
	 * Otherwise, it is the usual method. 
	 *   
	 */
	var showVideo = function($snippet){
		page = new aci.model.page;
		page.setUrl(context.url);
		if($snippet.hasAttr('data-source')){
			//getReferenced($snippet.attr('data-source'));
			if($snippetElement.hasAttr('data-params')) var ps = $snippetElement.attr('data-params');
			if($snippetElement.hasAttr('data-aggregate')) var aggregate = $snippetElement.attr('data-aggregate');
			//console.log('getReferenced: ',referenced,refs);
			
			page = new aci.model.page;
			page.getReferenced($snippet.attr('data-source'),'',ps,aggregate,videoLoaded);
		}
		else{ 
			page.loadSnippet($snippet.attr('data-snippet'),null,null,null,this.videoLoaded);
		}
	}
	
	/*
	 * Another hack. - HP 9/29
	 * We need to let showVideo in the view know that we are passing a referenced data.
	 * Based on that the view determines whether to call processTemplate (for loops) or just fillTemplate. 
	 */
	var videoLoaded = function(data){
		view = new aci.view.page;
		if($snippetElement.hasAttr('data-source')) view.showVideo(data,'showRefVideo',true); //true = refsnippets
		else{
			//data = data['snippets'];
			view.showVideo(data,'showVideo',false);  //false = original method
		}
	}
	
	var editUrl = function(plugin){
		//console.log('editUrl');
		snippet = {};
		snippet.type = 'url';
		snippet.url = context.url;
		var view = new aci.view.page;
		view.editUrl(snippet,plugin);
	};
	
	var saveUrl = function(content,params,aggregates,sort,plugin){
		var mPage = new aci.model.page;
		mPage.saveUrl(content,plugin);
	};
	
	var afterSave = function(snippet){
		var view = new aci.view.page;
		//console.log('aftersave in controller ',snippet,plugin.$elem);
		view.showSnippet(snippet,plugin.$elem);
		plugin.afterSave(true);
	};
	
	var splitVariable = function(variable,splits){
		//console.log(variable,typeof(variable));
		for(var prop in variable){
			//console.log(variable[prop],typeof(variable[prop]));
			splits.push(prop);
			if(typeof(variable[prop]) == 'object') splitVariable(variable[prop],splits);
		}
		return splits;
		
	}
	
	var setParams = function(params){
		this.ps = params;
		//console.log('setparams ',this.ps);
	}
	
	var setOnloadComplete = function(olc){
		onloadComplete = olc;
	}

	var editMetadata = function(params,pgin){
		ps = params;
		plugin = pgin;
		//console.log('editMetadata',params,pgin);
		var model = new aci.model.page;
		model.getMetadata(params,gotMetadata);
	}
	
	var gotMetadata = function(data){
		var view = new aci.view.page;
		view.showForm(plugin,data);
	}
	
	var saveMetadata = function(content,params,aggregates,sort,plugin){
		//console.log('save metadata',content,params);
		var model = new aci.model.page;
		model.saveMetadata(content,params,aggregates,afterSaveMetadata);
	}
	
	var afterSaveMetadata = function(data){
		plugin.afterSave(true);
	}
	
	return{
		setSnippetElement: setSnippetElement,
		setPlugin: setPlugin,
		getPage: getPage,
		getSnippet: getSnippet,
		getReferenced: getReferenced,
		gotReferenced: gotReferenced,
		snippetLoaded: snippetLoaded,
		editSnippet: editSnippet,
		showSnippetEdit: showSnippetEdit,
		saveSnippet: saveSnippet,
		showVideo: showVideo,
		videoLoaded: videoLoaded,
		prepareNew: prepareNew,
		editUrl: editUrl,
		saveUrl: saveUrl,
		afterSave: afterSave,
		//shiftAndShow: shiftAndShow,
		setParams: setParams,
		setOnloadComplete: setOnloadComplete,
		editMetadata: editMetadata,
		gotMetadata: gotMetadata,
		saveMetadata: saveMetadata,
		afterSaveMetadata: afterSaveMetadata,
        getPages: getPages
	}
}


aci.controller.media = function(){
	var pgin;
	var params;
	
	var addMedia = function(ps,plugin){
		params = ps;
		pgin = plugin;
		//console.log('aci.controller.media addMedia',params);
		
		var view = new aci.view.media;
		
		actionParams = [];
		aParams = params.split(';');
		for(i=0,l=aParams.length;i<l;i++){
			ps = aParams[i].split(':');
			actionParams[ps[0]] = ps[1];
		}
		data = {};
		data.content = {};
		data.content.type = actionParams['type'];
		data.content.title = '';
		data.content.url = '';  //should be hyphenated title
		data.content.description = '';
		data.content.caption = '';
		data[actionParams['type']] = '';
 		switch(params['type']){
			case 'video':
				data.content.thumb = 'Thumbnail for video';
				data.content.video = '';
				break;
			
			case 'image':
				data.content.alt = '';
				data.content.image = '';
				break;
		}
		view.showForm(pgin,data);
				
	}
	
	var editMedia = function(params,plugin){
		pgin = plugin;
		//console.log('aci.controller.media edit',params);
		var model = new aci.model.media;
		model.get(params,gotMedia);
		
	}
	
	var gotMedia = function(data){
		var view = new aci.view.media;
		view.showForm(pgin,data);
	}
	
	var saveMedia = function(content,params,aggregates,sort,oPlugin){
		//console.log('aci.controller.media saveMedia',content);
		model = new aci.model.media;
		model.save(content,params,afterSave);
	}
	
	var afterSave = function(data){
		pgin.afterSave();
	}
	
	var showVideo = function(params){
		model = new aci.model.media;
		model.get(params,gotVideo);
	}
	
	var gotVideo = function(data){
		view = new aci.view.media;
		view.showVideo(data);
	}

	var getPhotos = function(ps,plugin){
		pgin = plugin;
		params = ps;
		
		/*
		 * Trying something different here. From this controller, calling action of another controller
		 * In this case, getReferenced of page controller. I am passing 'albums' as the referenced collection
		 * Everything else from there on is what getReferenced does.
		 */
		//console.log('getPhotos controller');
		controller = new aci.controller.page;
		controller.setParams(ps);
		controller.setPlugin(pgin);
		//console.log('media snippet',pgin.settings.$element)
		controller.setSnippetElement(pgin.settings.$element);
		controller.getReferenced('albums','');
/*		model = new aci.model.media;
		model.getPhotos(params,gotPhotos);
*/	}
	
	var gotPhotos = function(data){
		//console.log('gotPhotos ',data);
		
	}	
	
	return{
		addMedia: addMedia,
		editMedia: editMedia,
		gotMedia: gotMedia,
		saveMedia: saveMedia,
		afterSave: afterSave,
		showVideo: showVideo,
		gotVideo: gotVideo,
		getPhotos: getPhotos
	}
}

aci.controller.album = function(){
	var pgin;
	var params;
	

}
