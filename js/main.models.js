/*
 * Model - youtube Videos
 */

aci.model.yt_video = function(){

    var getVideos = function(callback){
        $.ajax({
            url: baseUrl+'ytVideo/list',
            type: 'GET',
            //dataType: 'json',
            //data: data,
            success: function(data){
                //console.log(data);
                callback(data);
            }
        });
    }

    return{
        getVideos: getVideos
    }
}

/*
 * Model - waiting_families
 */
aci.model.waiting_families = function(){
	
	var getProfile = function(ps,aggregate,callback){
		data = {};
		if(ps != null){
			var aParams = ps.split(';');
			//console.log('aParams',aParams);
			params = {};
			for(i=0,l=aParams.length;i<l;i++){
				//aParam = aParams[i];
				aParam = aParams[i].split(':');
				params[aParam[0]] = aParam[1];
			}
			data.params = JSON.stringify(params);
		}
		if(aggregate != null){
			var aAggs = aggregate.split(';');
			//console.log('aAggs',aAggs);
			aggregates = {};
			for(i=0,l=aAggs.length;i<l;i++){
				//aAggregate = aAggs[i];
				aAgg = aAggs[i].split(':');
				//console.log(aAgg);
				if(aAgg.length > 1) aggregates[aAgg[0]] = aAgg[1];
				else aggregates[aAgg[0]] = '';
			}
			data.aggregate = JSON.stringify(aggregates);
		}
		$.ajax({
			url: baseUrl+'page/familyProfile',
			type: 'GET',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log(data);
				callback(data);
			} 
		});
		
	};
	
	return{
		getProfile: getProfile
	}
}

/*
 * Model - Snippet
 */
aci.model.snippet = function(){
	var $element;
	
	/*
	 * Get the template for the contenttype
	 */
	var getTemplate = function(contentType,callback,plugin){
		var data={'contenttype':contentType};
		var self = this;
		$.ajax({
			url: baseUrl+'s/template',
			type: 'GET',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log(data);
				callback(contentType,data['_id'],data,plugin);
			} 
		});
	};
	
	var getSnippet = function(ps,contentType,callback){
		data = {};
		if(ps != null){
			var aParams = ps.split(';');
			//console.log('aParams',aParams);
			params = {};
			for(i=0,l=aParams.length;i<l;i++){
				//aParam = aParams[i];
				aParam = aParams[i].split(':');
				params[aParam[0]] = aParam[1];
			}
			data.params = JSON.stringify(params);
		}
		data.contenttype = contentType;
		$.ajax({
			url: baseUrl+'s/snippet',
			type: 'GET',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log(data);
				callback(contentType,data);
			} 
		});
		
	}
	
	/*
	 * Save the snippet
	 * snippet - snippet of data that needs to be saved. It is json object
	 * params - params that will be used in the "where" clause of the query
	 * aggregates - the parameters on which aggregation will be peformed on mongodb. 
	 * 				of the form this.is.a.parameter
	 * sort - parameter on which you need to sort the data. 
	 * 			The above parameters (params, aggregates, sort) are common, and not all of them apply in each case.
	 * 			Where any of these are not required they are passed as ''.
	 * afterSave - callback function after return from the server. Usually it is back 
	 * 				to the controller that called this save
	 */
	var save = function(snippet,type,params,aggregates,sort,afterSave){
		//var data = {'data':snippet.data,'type':snippet.snippet};
		var data = {'data':snippet.data,'type':type};
		var self = this;
		$.ajax({
			url: baseUrl+'s',
			type: 'POST',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log('back from save: ',data);
				afterSave(data);
			} 
		});
	};
	
	return{
		getTemplate: getTemplate,
		getSnippet: getSnippet,
		save: save,
	}
	
};

/*
 * Model - page
 */
aci.model.page = function(){
	var header;
	var footer;
	var content;
	
	var setUrl = function(pageUrl){
		url = pageUrl;
	};

	/*
	 * Get content. Should be called getContent acutally. 
	 * In this case, given the url, get the data from the server. 
	 * I don't think this function is ever called, since we get individual
	 * snippets rather than the entire content for the page
	 */
	var loadContent = function (callback){
		var data = '';
		var self = this;
		
		$.ajax({
			url: baseUrl+url,
			type: 'POST',
			dataType: 'json',
			data: data,
			success: function(data){
				self.callback(data);
			} 
		});
	};
	
	/*
	 * Get the snippet. Again should be called getSnippet. 
	 * snippet - actually it is the snippet.name. Need to change the variable name accordingly. Has an impact on the server side too.
	 * params - Usually a snippet is retrieved based on snippet.name. However, if further filtering is required, additional
	 * 			parameters are passed through params of form this.is.a.parameter
	 * aggregates - the parameters on which aggregation will be peformed on mongodb. 
	 * 				of the form this.is.a.parameter
	 * sort - When an array of data is retrieved from the mongodb document, it may need to be sorted. This identifies the parameter 
	 * 			on which it needs to be sorted
	 * callback - callback on successful return - usually the controller 
	 */
	var loadSnippet = function (snippet,params,aggregates,sort,callback){
		if(params == null) params = '';
		else params = JSON.stringify(params);
		if(aggregates == null || aggregates == '') aggregates = '';
		else aggregates = JSON.stringify(aggregates);
		if(sort == null || sort == '') sort = '';
		var data = {'snippet': snippet, 'url': url, 'params':params, 'aggregates':aggregates, 'sort':sort};
		var self = this;
		//console.log('before ajax: ',data);
		$.ajax({
			url: baseUrl+'p',
			type: 'GET',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log('back from snippet: ',data[0]['snippets'][0]);
				if(data.length)
					callback(data[0]['snippets'][0]);
				else
					callback(null);
			} 
		});
	};
	
	/*
	 * Save the snippet for the page. 
	 * For variable definition, see loadSnippet
	 */
	
	var saveSnippet = function (snippet,params,aggregates,sort,afterSave){
		if(params == null) params = '';
		else params = JSON.stringify(params);
		if(aggregates == null || aggregates == '') aggregates = '';
		else aggregates = JSON.stringify(aggregates);
		if(sort == null || sort == '') sort = '';
		else sort = JSON.stringify(sort);
		//console.log('in aci.model.saveSnippet - params: ',params,' aggregates: ',aggregates,' sort: ',sort);
		var data = {'url': context.url, 'snippet':snippet, 'params':params, 'aggregates':aggregates, 'sort': sort};
		var self = this;
		//console.log('before ajax: '+data.snippet+' ; '+data.url);
		$.ajax({
			url: baseUrl+'p',
			type: 'POST',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log('back from save: ',data);
				afterSave(data[0]['snippets'][0]);
			} 
		});
	};
	
	var createSnippet = function(snippet,params,aggregates,sort,afterSave){
		
	};

	/*
	 * Special case - save updates to the URL for the page
	 */
	var saveUrl = function(content,afterSave){
		//console.log('save Url',content);
		var data = {'dataType':'saveUrl', 'url': content.data.url, 'pageId':context.pageId};
		$.ajax({
			url: baseUrl+'p',
			type: 'POST',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log('back from save: ',data);
				afterSave('done');
			} 
		});
		
	};
	
	var getReferencedOne = function(ps,referenced,id,gotReference){
		if(ps != null){
			var aParams = ps.split(';');
			//console.log('aParams',aParams);
			params = {};
			for(i=0,l=aParams.length;i<l;i++){
				//aParam = aParams[i];
				aParam = aParams[i].split(':');
				params[aParam[0]] = aParam[1];
			}
		}
		else params = null;
		//console.log('ps',params); 		
		//console.log('model get referenced',referenced,id);
		var data = {'referenced':referenced, 'id': id, 'params':JSON.stringify(params)};
		$.ajax({
			url: baseUrl+'p/r',
			type: 'GET',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log('back from referenced: ',data);
				gotReference(data);
			} 
		});
		
	};

	/*
	 * ps - additional parameters that may have been set for the snippet
	 * For eg. when showing snippets related under waiting families, the subpages
	 * would need a family id that is passed in ps
	 * 
	 */
	var getReferenced = function(referenced,refs,ps,aggregate,gotReference){
		if(refs == '') var ids = '';
		else ids = JSON.stringify(refs);
		var data = {'referenced':referenced, 'ids': ids};
		if(ps != null){
			var aParams = ps.split(';');
			//console.log('aParams',aParams);
			params = {};
			for(i=0,l=aParams.length;i<l;i++){
				//aParam = aParams[i];
				aParam = aParams[i].split(':');
				params[aParam[0]] = aParam[1];
			}
			data.params = JSON.stringify(params);
		}
		if(aggregate != null){
			var aAggs = aggregate.split(';');
			//console.log('aAggs',aAggs);
			aggregates = {};
			for(i=0,l=aAggs.length;i<l;i++){
				//aAggregate = aAggs[i];
				aAgg = aAggs[i].split(':');
				//console.log(aAgg);
				//if(aAgg.length > 1) 
					aggregates[aAgg[0]] = aAgg[1];
				//else aggregates[aAgg[0]] = '';
			}
			data.aggregate = JSON.stringify(aggregates);
		}
		//console.log('data',data); 		
		//console.log('model get referenced',referenced,id);
		//console.log('model get referenced',referenced,refs);
		$.ajax({
			url: baseUrl+'p/r',
			type: 'GET',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log('back from referenced: ',data);
				gotReference(data);
			} 
		});

	};
	
	var saveReferencedSnippet = function (snippet,referenced,id,ps,aggregate,afterSave){
		var params = '';
		var aggregates = '';
		if(ps != null){
			var aParams = ps.split(';');
			//console.log('aParams',aParams);
			params = {};
			for(i=0,l=aParams.length;i<l;i++){
				//aParam = aParams[i];
				aParam = aParams[i].split(':');
				params[aParam[0]] = aParam[1];
			}
		}
		if(aggregate != null){
			var aAggs = aggregate.split(';');
			//console.log('aAggs',aAggs);
			aggregates = {};
			for(i=0,l=aAggs.length;i<l;i++){
				//aAggregate = aAggs[i];
				aAgg = aAggs[i].split(':');
				//console.log(aAgg);
				if(aAgg.length > 1) aggregates[aAgg[0]] = aAgg[1];
				else aggregates[aAgg[0]] = '';
			}
		}
/*		if(sort == null || sort == '') sort = '';
		else sort = JSON.stringify(sort);
*/		//console.log('mode save referenced',referenced,id,params,aggregate,snippet);
		var data = {'referenced':referenced,'id': id, 'snippet':snippet, 'params':JSON.stringify(params), 'aggregate':JSON.stringify(aggregates)};
		var self = this;
		//console.log('mode save referenced',data);
		//console.log('before ajax: '+data.snippet+' ; '+data.url);
		$.ajax({
			url: baseUrl+'p/r',
			type: 'POST',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log('back from referenced save: ',data);
				afterSave(data);
				//afterSave(data[0]['snippets'][0],plugin);
			} 
		});
	};
	
	var getMetadata = function(ps,afterSave){
		var data = {};
		if(ps != null){
			var aParams = ps.split(';');
			//console.log('aParams',aParams);
			params = {};
			for(i=0,l=aParams.length;i<l;i++){
				//aParam = aParams[i];
				aParam = aParams[i].split(':');
				params[aParam[0]] = aParam[1];
			}
			data.params = JSON.stringify(params);
		}
		$.ajax({
			url: baseUrl+'page/meta',
			type: 'GET',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log('back from getMeta: ',data);
				afterSave(data);
			} 
		});
	}
	
	var saveMetadata = function(data,params,aggregates,sort,afterSave){
		if(params == null) params = '';
		else params = JSON.stringify(params);
		if(aggregates == null || aggregates == '') aggregates = '';
		else aggregates = JSON.stringify(aggregates);
		if(sort == null || sort == '') sort = '';
		else sort = JSON.stringify(sort);
		//console.log('in aci.model.saveSnippet - params: ',params,' aggregates: ',aggregates,' sort: ',sort);
		var data = {'data':data, 'params':params, 'aggregates':aggregates, 'sort': sort};
		$.ajax({
			url: baseUrl+'page/meta',
			type: 'POST',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log('back from saveMeta: ',data);
				afterSave(data);
			} 
		});
		
	}

    var getPagesList = function(callback){
        $.ajax({
            url: baseUrl+'page/getPagesList',
            type: 'POST',
            //dataType: 'json',
            success: function(data){
                callback(data);
            }
        });

    }
	
	return{
		setUrl: setUrl,
		loadContent: loadContent,
		loadSnippet: loadSnippet,
		saveSnippet: saveSnippet,
		createSnippet: createSnippet,
		saveUrl: saveUrl,
		getReferenced: getReferenced,
		saveReferencedSnippet: saveReferencedSnippet, 
		getMetadata: getMetadata,
		saveMetadata: saveMetadata,
        getPagesList: getPagesList
	};
};


aci.model.media = function(){
	
	var get = function(params,callback){
		//console.log('model.qandA getAnswer',params,typeof params);
		data = {};
		//data.data = new Array;
		aParams = params.split(';');
		for(i=0,l=aParams.length;i<l;i++){
			ps = aParams[i].split(':');
			data[ps[0]] = ps[1];
		}
		//console.log('model.qandA get',data);
		$.ajax({
			url: baseUrl+'media/get',
			type: 'GET',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log('back from get: ',data);
				callback(data);
			} 
		});			
		
	}
	
	var save = function(content,params,afterSave){
		data = {};
		for(key in params){
			data[key] = params[key];
		}
		data['data'] = JSON.stringify(content);
		//console.log('model.qandA save',data);
		$.ajax({
			url: baseUrl+'media/save',
			type: 'POST',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log('back from save: ',data);
				//afterSave(data[0]['snippets'][0],plugin);
				afterSave();
			} 
		});			
	}

	
	var getPhotos = function(params,callback){
		//console.log('model.album getPhotos',params,typeof params);
		data = {};
		//data.data = new Array;
		aParams = params.split(';');
		for(i=0,l=aParams.length;i<l;i++){
			ps = aParams[i].split(':');
			data[ps[0]] = ps[1];
		}
		//console.log('model.album get',data);
		$.ajax({
			url: baseUrl+'media/getAlbumPhotos',
			type: 'GET',
			dataType: 'json',
			data: data,
			success: function(data){
				//console.log('back from get: ',data);
				callback(data);
			} 
		});			
		
	}	
	return{
		save: save,
		get: get,
		getPhotos: getPhotos
	}
}

aci.model.album = function(){

}