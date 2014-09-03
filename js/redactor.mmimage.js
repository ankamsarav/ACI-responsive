if (typeof RedactorPlugins === 'undefined') var RedactorPlugins = {};

RedactorPlugins.mmimage = {

	init: function()
	{
		var callback = $.proxy(function()
		{
            this.selectionSave();
            //$('#moxieMgr-link').trigger('click');
            $('#redactor_modal #selected-image').attr('data-edit','0');
            $('#redactor_modal #selected-image').attr('data-file','');
            //$('#redactor_modal #selected-image').attr('data-ppath','');
            $('#redactor_modal #selected-image').find('img').attr('src','');
			$('#redactor_modal #mmimage-save').click($.proxy(function()
			{
				image = $('#redactor_modal #selected-image').attr('data-file');
				//console.log('mmimage',image);
				thumbnail = $('#redactor_modal #selected-image img').attr('src');
				align = $('#redactor_modal .red-img-align').find('.active').attr('data-align');
                alt = $('#redactor_modal #alt').val();
                //pPath = $('#redactor_modal #selected-image').attr('data-pPath');
				//console.log('mmimage this',this);
				//console.log($('#redactor_modal .red-img-align').find('.active'),$('#redactor_modal .red-img-align').find('.active').attr('data-align'));
				var imgalign = '';
				//if(align == 'left') imgalign = 'style="float:left;margin-left:10px;"';
				//var img = '<div '+imgalign+'><img src="'+baseUrl+image+'" data-th="'+thumbnail+'"/></div><div class="clearfix"></div>';
				if($('#redactor_modal #selected-image').attr('data-edit') == '1'){
					var $img = $('#'+ $('#redactor_modal #selected-image').attr('data-id'));
					//console.log('edited mmimage',$img);
					$img.attr('src',image);
					$img.attr('data-th',thumbnail);
                    $img.attr('alt',alt);
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
				else{
					if(align == 'left') imgalign = 'style="float:left;margin-right:10px"';
					if(align == 'right') imgalign = 'style="float:right;margin-left:10px;margin-right:10px"';
					if(align == 'middle') imgalign = 'style="margin:auto"';
                    if(align == 'none') imgalign = '';
					random = Math.floor(((Math.random())*100000)+1);
					//var img = '<p '+imgalign+'><img src="'+baseUrl+image+'" '+imgalign+' data-th="'+thumbnail+'" id="'+random+'"/></p>';
					//var img = $('<p'+imgalign+' />').html('<img src="'+baseUrl+image+'" data-th="'+thumbnail+'" id="red-image-'+random+'" />');
                    var img = $('<p />').html('<img '+imgalign+' src="'+image+'" data-th="'+thumbnail+'" id="red-image-'+random+'" alt="'+alt+'"/>');
					//console.log('generated img',img);
					//if(align == 'middle') img = '<center>'+img+'</center>';
					this.insertFromMmImage(img,this);
					$('#redactor_modal #selected-image').attr('data-file','');
					$('#redactor_modal #selected-image img').attr('src','');
                    //$('#redactor_modal #selected-image').attr('data-ppath','');
					$('#redactor_modal #selected-image').attr('data-edit','0');
				}
				return false;

			}, this));
		}, this);

		this.buttonAdd('mmImage', 'Image Manager', $.proxy(function()
		{
            var moxieMgr = '<div id="moxieMgr">'
                    +'<section>'
                        +'<p><button class="btn" id="moxieMgr-link" onclick="loadMoxman(\'#selected-image\',showImage)">Select Image</button></p>'
                        +'<div id="selected-image" data-file="" data-edit="0"><img style="float:left;margin:0 10px 10px 0" src="" /></div><a class="btn btn-small btn-primary" id="mm-image-edit" onclick="editMMImage(\'#selected-image\')">Edit</a>'
                        +'<div style="clear:both"/>'
                        +'<div class="control-group">'
                            +'<label for="alt">Alt text</label>'
                            +'<div class="controls">'
                                +'<input class="input-large" type="text" id="alt" value=""/>'
                            +'</div>'
                        +'</div>'
                        +'<label class="control-label" >Align</label>'
                        +'<div class="btn-group red-img-align" data-toggle="buttons-radio" data-align >'
                            +'<button data-align="left" class="btn">Left</button>'
                            +'<button data-align="middle" class="btn">Middle</button>'
                            +'<button data-align="right" class="btn">Right</button>'
                            +'<button data-align="none" class="btn">None</button>'
                        +'</div>'
                    +'</section>'
                    +'<footer>'
                    +'<a href="#" id="mmimage-save" class="redactor_modal_btn redactor_btn_modal_save">Insert</a>'
                    +'<a href="#" class="redactor_modal_btn moxieMgr_modal_close" onclick="closeMoxieMgrModal($(this));return false">Close</a>'
                +'</footer>'
                +'</div>';

			this.modalInit('Image Manager', moxieMgr, 500, callback);
            $('#redactor_modal_close').on('click',function(){
                //console.log('clicked close');
                closeMoxieMgrModal($(this).closest('#redactor_modal').find('.moxieMgr_modal_close'));
                return false;
            });
        }, this));

		this.buttonAddSeparatorBefore('mmImage');

	},
	insertFromMmImage: function(img,redactor)
	{
		//console.log('insertFromMMImage',img);
		this.selectionRestore();
		//this.execCommand('inserthtml', img);
		redactor.insertNode(img);
		this.execCommand('inserthtml','<p></p>'); //not sure why with only an insertnode of the img, redactor failed to recognize it...
		this.modalClose();
	}

}