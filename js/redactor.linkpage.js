if (typeof RedactorPlugins === 'undefined') var RedactorPlugins = {};

RedactorPlugins.linkpage = {

	init: function()
	{

		var setLink = $.proxy(function()
		{
            this.selectionSave();
            var sel = this.getSelection().toString();
            $('#redactor_modal #link-text').val(sel);
            this.loadPages();
            bindRedactorElements();
			$('#redactor_modal #m42redactor-save').click($.proxy(function()
			{
                var selPage = $('#redactor_modal #selected-page').text();
                var openMode = $('#redactor_modal #link-new-window').attr('data-mode');
				if($('#redactor_modal #selected-video').attr('data-edit') == "true"){
				}
				else{
                    this.pageLinkProcess();
                    //this.selectionRestore();
				}
				return false;

			}, this));
		}, this);

        btnCallback = function(obj,event,key){

        }

        var dropdown = {
            link: {
                title: 'Link Page',
                callback: function(obj,event,key) { //set the font size to small }
                    var linkPageMgr = '<div id="linkPageMgr">'
                        +'<section>'
                        +'<div id="pages" data-selected="" style="height: 300px;overflow: auto;padding: 5px;background: rgba(0,0,0,0.03);border-bottom: 1px solid rgba(0,0,0,0.05);"></div>'
                        +'<div id="selected-page" style="margin-top:10px;min-height:50px"></div>'
                        +'<div class="span4">'
                            +'<div class="control-group">'
                                +'<label for="alt"><b>Link text</b></label>'
                                +'<div class="controls">'
                                    +'<input class="input-large" type="text" id="link-text" value=""/>'
                                +'</div>'
                            +'</div>'
                        +'</div>'
                        +'<div class="span4">'
                            +'<label class="checkbox inline">'
                                +'<input type="checkbox" id="link-new-window" value="0"><b> Open in new window</b>'
                            +'</label>'
                        +'</div>'
                        +'<div style="clear:both"></div>'
                        +'</section>'
                        +'<footer>'
                        +'<a href="#" id="m42redactor-save" class="redactor_modal_btn redactor_btn_modal_save">Insert</a>'
                        +'<a href="#" class="redactor_modal_btn m42redactor_modal_close" onclick="closeM42redactorModal($(this));return false">Close</a>'
                        //+'<a href="#" class="redactor_modal_btn linkPage_modal_remove" onclick="removeRedactorVideo($(this).closest(\'footer\').siblings(\'section\').find(\'#selected-video\'));return false">Remove</a>'
                        +'</footer>'
                        +'</div>';

                    this.modalInit('Insert link to a page within the site', linkPageMgr, 800, setLink);
                    $('#redactor_modal_close').on('click',function(){
                        //console.log('clicked close');
                        closeYtVideoModal($(this).closest('#redactor_modal').find('.m42redactor_modal_close'));
                        return false;
                    });
                }
            },
            unlink: {
                title: 'Remove link',
                callback: function(obj,event,key) {
                    this.execCommand('unlink');
                }
            }
        }
		this.buttonAdd('linkPage', 'Link Page within the site', false, dropdown);

		this.buttonAddSeparatorBefore('linkPage');
        this.buttonAddSeparatorAfter('linkPage');

	},

    pageLinkProcess: function()
    {
        var tab_selected = '1'; //$('#redactor_tab_selected').val();
        var link = '', text = '', target = '', targetBlank = '';

        // url
        if (tab_selected === '1')
        {
            link = $('#redactor_modal #selected-page').attr('data-url');
            text = $('#redactor_modal #link-text').val();

            console.log('pagelinkprocess ',link, text, $('#redactor_modal #link-text'));
            if ($('#redactor_modal #link-new-window').prop('checked'))
            {
                target = ' target="_blank"';
                targetBlank = '_blank';
            }

            // test url (add protocol)
/*
            var pattern = '((xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}';
            var re = new RegExp('^(http|ftp|https)://' + pattern, 'i');
            var re2 = new RegExp('^' + pattern, 'i');

            if (link.search(re) == -1 && link.search(re2) == 0 && this.opts.linkProtocol)
            {
                link = this.opts.linkProtocol + link;
            }
*/
        }
        // mailto
        else if (tab_selected === '2')
        {
            link = 'mailto:' + $('#redactor_link_mailto').val();
            text = $('#redactor_link_mailto_text').val();
        }
        // anchor
        else if (tab_selected === '3')
        {
            link = '#' + $('#redactor_link_anchor').val();
            text = $('#redactor_link_anchor_text').val();
        }

        this.linkInsert('<a href="'+ baseUrl + link + '"' + target + '>' + text + '</a>', $.trim(text), link, targetBlank);

    },
    pageLinkInsert: function (a, text, link, target)
    {
        this.selectionRestore();

        if (text !== '')
        {
/*
            if (this.insert_link_node)
            {
                this.bufferSet();

                $(this.insert_link_node).text(text).attr('href', link);

                if (target !== '') $(this.insert_link_node).attr('target', target);
                else $(this.insert_link_node).removeAttr('target');

                this.sync();
            }
            else
            {
*/
                this.exec('inserthtml', a);
/*
            }
*/
        }

        this.modalClose();
    },

    loadPages: function(){
        page = new aci.controller.page;
        page.getPages(this.showPages);
    },

    showPages: function(pageList){
        $('#linkPageMgr').find('div#pages').html(pageList);
    }

}