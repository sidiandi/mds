var restore = undefined;

$(document).ready(function(){

    let currentRelPath;

    restore = function(commitHash) {
        $.post('/source' + currentRelPath, { commitHash: commitHash }, (data) => {
            $('#source').val(data);
            updateTempContent(data);
        });
    }

    function navigateTo(relPath) {
        currentRelPath = relPath;

        $.get('/breadCrumbs' + currentRelPath, (data) => {
            $('#header').html(data);
        });

        $.get('/render' + currentRelPath, (data) => {
            $('article').html(data);
        });

        $.get('/nav' + currentRelPath, (data) => {
            $('navbar').html(data);
        });

        $.get('/source' + currentRelPath, (data) => {
            $('#source').val(data);
        });

        $.get('/history' + currentRelPath, (data) => {
            $('history').html(data);
        });
    }

    window.onhashchange = function() {
        navigateTo(window.location.hash.substr(1));
    };

    function setContent(content) {
        $.post('/render' + currentRelPath, { content: content, commit: true }, (data) => {
            $('#article').html(data);

            $.get('/history' + currentRelPath, (data) => {
                $('history').html(data);
            });
        });
    }

    function updateTempContent(content) {
        $.post('/render' + currentRelPath, { content: content }, (data) => {
            $('#article').html(data);
        });
    }

    $('#source').keyup(function() {
        updateTempContent($('#source').val());
    });

    $('#commit').click(function() {
        setContent($('#source').val());
    });

    window.onhashchange();
});