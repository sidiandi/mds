var restore = undefined;

$(document).ready(function(){

    let currentRelPath;

    restore = function(commitHash) {
        api({
            path: currentRelPath,
            version: commitHash,
            html: true,
        }, (data) => {
            $('#source').val(data.source);
        });
    }

    function showStatus(text) {
        const s = $('status');
        s.html(text);
        s.slideDown('fast', function(){
          window.setTimeout(function(){ s.slideUp()}, 5000);
        });
    }

    function api(req, callback) {
        $.ajax({
            url: '/api',
            type: 'POST',
            data: JSON.stringify(req),
            contentType: "application/json",
            complete: (response) => {
                const data = response.responseJSON;
                if (data) {
                    if (data.status) {
                        showStatus(data.status);
                    }
                    if (data.history) {
                        setHistory(data.history);
                    }
                    if (data.title) {
                        document.title = data.title;
                    }
                    if (data.breadCrumbs) {
                        $('breadCrumbs').html(data.breadCrumbs);
                    }
                    if (data.html) {
                        $('article').html(data.html);
                    }
                    if (data.navbar) {
                        $('navbar').html(data.navbar);
                    }

                    if (callback) {
                        callback(data);
                    }
                }
            }
        });
    }

    function getPathFromHash(hash) {
        if (hash === '') {
            return '#/Readme.md';
        }
        return hash;
    }

    function commitWithoutFeedback() {
        api({
            path: currentRelPath,
            source: $('#source').val(),
            commit: true,
        });
    }

    function scrollToId(id) { 
        if (id) {
            const scrollTo = $(id);
            const container = $('article');
            container.animate({
                scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
            });
        }
    }

    function navigateTo(hash) {
        const hashParts = getPathFromHash(hash).split('#');
        const path = '#' + hashParts[1];
        let id = hashParts[2];
        if (id) {
            id = '#' + id;
        }

        console.log({ currentRelPath: currentRelPath, path: path });

        if (currentRelPath === path) {
            scrollToId(id);
        }
        else {
            commitWithoutFeedback();

            api({
                path: path,
                html: true,
                breadCrumbs : true,
                navbar: true,
                history: true
                // history: true
            }, (data) => {
                currentRelPath = path;
                $('#source').val(data.source);
                scrollToId(id);
            });
        }
    }

    function setHistory(h) {
        const li = h.map((i) => { return `<li onClick="restore('${i.version}')">${i.relativeDate} (${i.date}) - ${i.message}</li>`});
        const html = "<ul>" + li.join('') + "</ul>";
         $('history').html(html);
    }

    window.onhashchange = function() {
        navigateTo(window.location.hash);
    };

    function setSource(source) {
    }

    function commit() {
        const source = $('#source').val();

        api({
            path: currentRelPath,
            source: source,
            commit: true,
            html: true,
            history: true,
            navbar: true,
        }, (data) => {
        });
    }

    function updateTempSource(source) {
        api({
            path: currentRelPath,
            source: source,
            commit: false,
            html: true,
        }, (data) => {
        });
    }

    // Binding keys
    $('#source').bind('keydown', 'ctrl+return', function() {
        commit();
    });

    function searchFocus() {
        $('#search').focus();
        $('#search').select();
    }

    $('#source').bind('keydown', 'ctrl+/', function() {
        searchFocus();
    });

    $(document).bind('keydown', 'ctrl+/', function() {
        searchFocus();
    });

    $('#source').keyup(function() {
        updateTempSource($('#source').val());
    });

    $('#search').keyup(function() {
        api({ 
            search: $('#search').val()
        });
    })

    $('#commit').click(function() {
        commit();
    });

    $(window).on('unload', function() {
        commitWithoutFeedback();
    });
    
    window.onhashchange();

});