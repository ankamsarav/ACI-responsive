if (typeof RedactorPlugins === 'undefined') var RedactorPlugins = {};

RedactorPlugins.ytvideo = {

	init: function()
	{
		var callback = $.proxy(function()
		{
            this.selectionSave();
            this.loadVideos();
            bindRedactorElements();
			$('#redactor_modal #ytvideo-save').click($.proxy(function()
			{
				var align = $('#redactor_modal .red-ytthumb-align').find('.active').attr('data-align');
                //console.log('align',align);
                var mode = $('#redactor_modal .red-ytvideo-mode').find('.active').attr('data-mode');
                var alt = $('#redactor_modal #alt').val();
                var $selImage = $('#redactor_modal #selected-video').find('img');
                var selMode = $('#redactor_modal #selected-video').attr('data-mode');
                var selId = $('#redactor_modal #selected-video').attr('data-sel-id');
                console.log('selmode, selid',mode,selMode,selId,$('#redactor_modal #selected-video').attr('data-edit'),alt);
				var imgalign = '';
                //console.log('mode selmode',mode,selMode);
				if($('#redactor_modal #selected-video').attr('data-edit') == "true"){
                    if(mode != selMode){
                        if(selMode == 'embed'){
                            console.log('modes equal - existing mode = embed');
                            //var $textSibling = $('#'+selId).next();
                            //var random = Math.floor(((Math.random())*100000)+1);
                            //$textSibling.attr('id',random);
                            $('.redactor_editor #'+selId).remove();
                            //this.setCaret(document.getElementById($textSibling.attr('id')),0);
                            this.popupVideo(this,align,alt);
                        }
                        else{
                            console.log('modes not equal - existing mode = popup');
/*
                            var current = this.getCurrent();
                            this.selectionElement(document.getElementById(selId));
                            console.log(this.getSelectionHtml());
                            //this.selectionEnd(document.getElementById(selId));
                            this.selectionRemove();
                            this.sync();
*/
                            //this.setCaret(document.getElementById(selId),0);
                            $('#'+selId).remove();
                            this.selectionRestore();
                            this.embedVideo(this);
                        }
                    }
                    else{
                        if(mode == 'embed'){
                            console.log('modes same, embed');
                            $('.redactor_editor #'+selId).remove();
                            this.embedVideo(this);
                        }
                        else{
                            //$('#redactor_editor div[id^="embed-wrap-"]').remove();
                            console.log('modes same',selId,$('#redactor_editor #'+selId));
                            //$('.redactor_editor #'+selId).remove();
                            var $img = $('#'+ $('#redactor_modal #selected-video').attr('data-sel-id')).find('img');
                            console.log('edit pop',$('#'+ $('#redactor_modal #selected-video').attr('data-sel-id')),$('#'+ $('#redactor_modal #selected-video').attr('data-sel-id')).find('img'))
                            var src = $selImage.attr('src');
                            src = src.replace(/(.*)\/.*(\.jpg$)/i, '$1/mqdefault$2');
                            $img.attr('src',src);
                            $img.attr('alt',alt);
                            $img.attr('title',$selImage.siblings('p').text());
                            $img.attr('data-videoid',$selImage.attr('data-videoid'));
                            $img.attr('id',$selImage.attr('id'));
                            console.log('edited video',$img);
                            /*$img.attr('src',image);
                            $img.attr('data-th',thumbnail);
                            $img.attr('alt',alt);*/
                            //$img.attr('pPath',pPath);
                            this.modalClose();
                            /*if(align == 'left') $img.closest('p').css('text-align','').css('text-align','left');
                            if(align == 'right') $img.closest('p').css('text-align','').css('text-align','right').css('margin-right','10px');
                            if(align == 'middle') $img.closest('p').css('text-align','center').css('float','none');*/

                            console.log('align',align,$img);

                            $img.css('float','').closest('p').css('text-align','').css('margin','auto');
                            if(align == 'left') $img.css('float','').css('float','left').css('margin-right','10px');
                            if(align == 'right') $img.css('float','').css('float','right').css('margin-right','10px');
                            if(align == 'middle') $img.css('float','none').closest('p').css('text-align','center').css('margin','auto');
                            if(align == 'none') $img.css('float','');
                        }
                    }
				}
				else{
					//var img = '<p '+imgalign+'><img src="'+baseUrl+image+'" '+imgalign+' data-th="'+thumbnail+'" id="'+random+'"/></p>';
					//var img = $('<p'+imgalign+' />').html('<img src="'+baseUrl+image+'" data-th="'+thumbnail+'" id="red-image-'+random+'" />');
                    //var img = $('<p />').html('<img '+imgalign+' src="'+image+'" data-th="'+thumbnail+'" id="red-image-'+random+'" alt="'+alt+'"/>');

                    this.selectionRestore();
                    if(mode == 'embed') this.embedVideo(this);
                    else this.popupVideo(this,align,alt);
					//console.log('generated img',img);
					//if(align == 'middle') img = '<center>'+img+'</center>';
					//this.insertFromYtVideo(img,this);
					$('#redactor_modal #selected-image').attr('data-file','');
					$('#redactor_modal #selected-image img').attr('src','');
                    //$('#redactor_modal #selected-image').attr('data-ppath','');
					$('#redactor_modal #selected-image').attr('data-edit','0');
				}
				return false;

			}, this));
		}, this);

		this.buttonAdd('ytvideo', 'Select Youtube Video', $.proxy(function()
		{
            var ytVideoMgr = '<div id="ytVideoMgr">'
                    +'<section>'
                        +'<div id="content" data-selected="" data-thumb="" style="height: 300px;overflow: auto;padding: 5px;background: rgba(0,0,0,0.03);border-bottom: 1px solid rgba(0,0,0,0.05);"></div>'
                        +'<div id="selected-video" style="margin-top:10px;min-height:115px"></div>'
                        +'<div style="float:left;margin-right:10px">'
                        +'<div class="control-group">'
                            +'<label for="alt"><b>Alt text</b></label>'
                            +'<div class="controls">'
                                +'<input class="input-large" type="text" id="alt" value=""/>'
                            +'</div>'
                        +'</div>'
                        +'</div>'
                        +'<div style="float:left;margin-right:10px">'
                        +'<label class="control-label" ><b>Align</b></label>'
                        +'<div class="btn-group red-ytthumb-align" data-toggle="buttons-radio" data-align >'
                            +'<button data-align="left" class="btn">Left</button>'
                            +'<button data-align="middle" class="btn">Middle</button>'
                            +'<button data-align="right" class="btn">Right</button>'
                            +'<button data-align="none" class="btn">None</button>'
                        +'</div>'
                        +'</div>'
                        +'<div style="float:left">'
                        +'<label class="control-label" ><b>Video mode</b></label>'
                        +'<div class="btn-group red-ytvideo-mode" data-toggle="buttons-radio" data-mode >'
                            +'<button data-mode="embed" class="btn">Embed</button>'
                            +'<button data-mode="popup" class="btn">Popup</button>'
                        +'</div>'
                        +'</div>'
                        +'<div style="clear:both"></div>'
                    +'</section>'
                    +'<footer>'
                        +'<a href="#" id="ytvideo-save" class="redactor_modal_btn redactor_btn_modal_save">Insert</a>'
                        +'<a href="#" class="redactor_modal_btn ytVideo_modal_close" onclick="closeYtVideoModal($(this));return false">Close</a>'
                        +'<a href="#" class="redactor_modal_btn ytVideo_modal_remove" onclick="removeRedactorVideo($(this).closest(\'footer\').siblings(\'section\').find(\'#selected-video\'));return false">Remove</a>'
                    +'</footer>'
                +'</div>';

			this.modalInit('Select Youtube Video', ytVideoMgr, 800, callback);
            $('#redactor_modal_close').on('click',function(){
                //console.log('clicked close');
                closeYtVideoModal($(this).closest('#redactor_modal').find('.ytVideo_modal_close'));
                return false;
            });
        }, this));

		this.buttonAddSeparatorBefore('mmImage');

	},

    loadVideos: function(){
        videos = new aci.controller.yt_video;
        videos.getVideos(this.showVideos);
    },

    showVideos: function(videoList){
        $('#ytVideoMgr').find('div#content').html(videoList);
    },

    embedVideo: function(redactor){
        var random = Math.floor(((Math.random())*100000)+1);
        var youtubeId = $('#redactor_modal #selected-video').find('img').attr('data-videoid');
        var imgUrl = $('#redactor_modal #selected-video').find('img').attr('src');
        console.log('embed video',youtubeId,imgUrl);
        $embed = $('<div style="position:relative" class="embed" data-videoid="'+youtubeId+'" data-thumb="'+imgUrl+'" title="'+$('#redactor_modal #selected-video').find('p').text()+'" id="embed-wrap-'+random+'">'
                        +'<iframe  title="YouTube video player" class="youtube-player" width="475" height="290" src="http://www.youtube.com/embed/'+youtubeId+'?autoplay=0&rel=0" frameborder="0" allowfullscreen></iframe>'
                        +'<img class="edit" style="width:64px" src="'+baseUrl+'images/change.jpg">'+
                '</div>');
        redactor.insertNode($embed);
        //this.execCommand('inserthtml','<p></p>'); //not sure why with only an insertnode of the img, redactor failed to recognize it...
        $('.redactor_editor div.embed img.edit').on('click',function(){
            console.log('embed video clicked');
            redactorVideoClicked($(this).closest('div.embed'),'embed');
        });
        this.modalClose();
    },

    popupVideo: function(redactor,align,alt){
        this.selectionRestore();
        $img = $('#redactor_modal #selected-video').find('img').clone();
        $img.attr('alt',alt);
        var src = $img.attr('src');
        console.log('before replace',src);
        src = src.replace(/(.*)\/.*(\.jpg$)/i, '$1/mqdefault$2');
        $img.attr('src',src);
        console.log('after replace',src);
        var imgWidth = $('#redactor_modal #selected-video').find('img').width();
        random = Math.floor(((Math.random())*100000)+1);
        var videoWrap = '<div id="pop-wrap-'+random+'"></div>';
        $img.addClass('ytpop');
        $img.attr('title',$('#redactor_modal #selected-video').find('p').text());
        $playIcon = $('<div class="yt-playicon"></div>');
        if(align == 'middle'){
            $videoWrap = $('<div id="pop-wrap-'+random+'" style="margin:auto;text-align: center"></div>');
            $img.css('float','');
            $img = $('<div style="position:relative;width='+imgWidth+'px;margin:auto"/>').append($img).append($playIcon);
            var $img = $videoWrap.append($img);
        }
        else{
            if(align == 'left') $img.css('float',align).css('margin-right','10px');
            if(align == 'right') $img.css('float',align).css('margin-left','10px').css('margin-right','10px');
            if(align == 'none') $img.css('float','none');
            $img = $('<div id="pop-wrap-'+random+'" style="position:relative" />').append($img).append($playIcon);
        }
        redactor.insertNode($img);
        //this.execCommand('inserthtml','<p></p>'); //not sure why with only an insertnode of the img, redactor failed to recognize it...
        $('#redactor_editor yt-playicon').on('click',function(){
            bindYtVideo($(this).siblings('img'));
            //showYtVideo($(this));
        })
        bindRedactorElements();
        this.modalClose();
    }

}