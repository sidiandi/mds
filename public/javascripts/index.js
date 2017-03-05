$(document).ready(function(){

    let currentRelPath;

    function navigateTo(relPath) {
        $.get('/breadCrumbs' + relPath, (data) => {
            $('#header').html(data);
        });

        $.get('/render' + relPath, (data) => {
            $('#article').html(data);
        });

        $.get('/source' + relPath, (data) => {
            $('#source').val(data);
        });

        currentRelPath = relPath;
    }

    window.onhashchange = function() {
        navigateTo(window.location.hash.substr(1));
    };

    function setContent(content) {
        $.post('/render' + currentRelPath, { content: content, commit: true }, (data) => {
            $('#article').html(data);
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