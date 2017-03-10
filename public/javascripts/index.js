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

    function api(req, callback) {
        $.ajax({
            url: '/api',
            type: 'POST',
            data: JSON.stringify(req),
            contentType: "application/json",
            complete: (response) => {
                const data = response.responseJSON;
                callback(data);
            }
        });
    }

    function navigateTo(relPath) {
        currentRelPath = relPath;

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
            $('history').html(data.history);
            $('header').html(data.breadCrumbs);
            $('navbar').html(data.navbar);
        });
    }

    window.onhashchange = function() {
        navigateTo(window.location.hash);
    };

    function setSource(source) {
        api({
            path: currentRelPath,
            source: source,
            commit: true,
            html: true,
            history: true,
        }, (data) => {
            $('article').html(data.html);
            $('history').html(data.history);
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

    $('#source').keyup(function() {
        updateTempSource($('#source').val());
    });

    $('#commit').click(function() {
        setSource($('#source').val());
    });

    window.onhashchange();
});