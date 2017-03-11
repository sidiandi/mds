var restore = undefined;

$(document).ready(function(){

    let currentRelPath;

    restore = function(commitHash) {
        api({
            path: currentRelPath,
            version: commitHash,
            html: true,
        }, (data) => {
            $('article').html(data.html);
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
                if (callback) {
                    const data = response.responseJSON;
                    if (data.status) {
                        showStatus(data.status);
                    }
                    if (data.history) {
                        setHistory(data.history);
                    }
                    callback(data);
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

    function navigateTo(hash) {
        commitWithoutFeedback();

        currentRelPath = getPathFromHash(hash);

        api({
            path: currentRelPath,
            html: true,
            breadCrumbs : true,
            navbar: true,
            history: true
            // history: true
        }, (data) => {
            $('article').html(data.html);
            $('#source').val(data.source);
            $('header').html(data.breadCrumbs);
            $('navbar').html(data.navbar);
        });
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
            $('article').html(data.html);
            $('navbar').html(data.navbar);
        });
    }

    function updateTempSource(source) {
        api({
            path: currentRelPath,
            source: source,
            commit: false,
            html: true,
        }, (data) => {
            $('article').html(data.html);
        });
    }

    // Binding keys
    $('#source').bind('keydown', 'ctrl+return', function() {
        commit();
    });

    $('#source').keyup(function() {
        updateTempSource($('#source').val());
    });

    $('#commit').click(function() {
        commit();
    });

    $(window).on('unload', function() {
        commitWithoutFeedback();
    });
    
    window.onhashchange();

});