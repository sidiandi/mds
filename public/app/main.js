// Start the main app logic.
requirejs([
    'jquery',
    "jquery-throttle-debounce",
    "jquery-ui",
    "jquery.hotkeys"
    ],
function(
    jQuery,
    throttle,
    jQueryUi,
    jqueryHotkeys
) {

var restore = undefined;

$(document).ready(function(){

    let hash = null;
    let sourceChanges = 0;
    let source = '';
    let editMode = false;

    const commandSearch = '#search/';

    const parseHash = function(hash) {
        if (hash === null || hash === undefined) {
            return { path: null, anchor: null };
        }
        for (command of [commandSearch]) {
            if (hash.startsWith(command)) {
                return {
                    command: command, 
                    args: decodeURI(hash.substr(command.length))
                }
            }
        }
        if (hash) {
            var re = /^#([^#]+)(#([^#]+))?/;
            var m = re.exec(hash);
            return { 
                path: m[1],
                anchor: m[3],
            }
        } else {
            return { path: '/', anchor: undefined }
        }
    }

    restore = function(commitHash) {
        api({
            hash: hash,
            version: commitHash,
            source: true,
            html: true,
        });
    }

    function showStatus(text) {
        if (text) {
            const s = $('status');
            s.html(text);
            s.slideDown('fast', function(){
                window.setTimeout(function(){ s.slideUp()}, 3000);
            });
        }
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
                    if (data.hash) {
                        hash = data.hash;
                    }
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
                        scrollTo(data.hash);
                    }
                    if (data.navbar) {
                        $('navbar').html(data.navbar);
                    }
                    if (data.source) {
                        if (data.source) {
                            sourceChanges = 0;
                            $('#source').val(data.source);
                            $('#sourceChanges').html(sourceChanges);
                        }
                    }
                    if (callback) {
                        callback(data);
                    }
                }
            }
        });
    }

    function commitWithoutFeedback() {
        if (sourceChanges > 0 && !(hash === null)) {
            api({
                hash: hash,
                newSource: $('#source').val(),
                commit: true,
            });
        }
    }

    function scrollTo(hash) { 
        const p = parseHash(hash)
        const id = p.anchor;
        if (id) {
            const elementToScrollTo = $("#" + id);
            const container = $('article');
            container.animate({
                scrollTop: elementToScrollTo.offset().top - container.offset().top + container.scrollTop()
            });
        }
    }

    function navigateTo(toHash) {
        const to = parseHash(toHash);
        const current = parseHash(hash);

        if (to.path && (to.path === current.path)) {
            hash = toHash;
            scrollTo(hash);
        }
        else {
            commitWithoutFeedback();

            api({
                hash: toHash,
                html: true,
                source: true,
                breadCrumbs : true,
                navbar: true,
                history: true
                // history: true
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

    function commit() {
        const source = $('#source').val();

        api({
            hash: hash,
            newSource: source,
            commit: true,
            html: true,
            history: true,
            navbar: true,
        }, (data) => {
            sourceChanges = 0;
            $('#sourceChanges').html(sourceChanges);
        });
    }

    function undo() {
        api({
            hash: hash,
            commit: false,
            html: true,
            source: true,
            history: true,
            navbar: true,
        });
    }

    function preview(source) {
        api({
            hash: hash,
            newSource: source,
            commit: false,
            html: true,
        });
    }

    // Binding keys
    $('#source').bind('keydown', 'ctrl+return', function() {
        commit();
    });

    $('#source').bind('keydown', 'ctrl+z', function() {
        undo();
    });

    function searchFocus() {
        $('#search').focus();
        $('#search').select();
    }

    for (e of [$('#source'), $('#search'), $(document)]) {
        e.bind('keydown', 'ctrl+/', function() {
            searchFocus();
        });

        e.bind('keydown', 'F2', function() {
            toggleEditMode();
        });
    }

    function doPreview() {
        preview($('#source').val());
        ++sourceChanges;
        $('#sourceChanges').html(sourceChanges);
    }

    $('#source')[0].addEventListener('input', $.debounce(50, $.throttle(1000, doPreview)), false);
    
    $('#search').bind('keydown', 'return', function() {
        const firstA = $('article').find('a:first');
        if (firstA) {
            window.location.href = firstA.attr('href');
            $('article').focus();
        }
    });

    $('#search')[0].addEventListener('input', function() {
        if (e.which == 13) {
            e.preventDefault();
        } else {
            window.location.hash = commandSearch + encodeURI($('#search').val());
        }
    }, false);

    $('#commit').click(function() {
        commit();
    });

    $('#undo').click(function() {
        undo();
    });

    function toggleEditMode() {
        if (editMode) {
            $('edit').toggle(100, () => {
                $('article').focus();
                editMode = false;
            });
        } else {
            $('edit').toggle(100, () => {
                $('#source').focus();
                editMode = true;
            });
        }
    }

    $('#editMode').click(function() {
        toggleEditMode();
    });

    $(window).on('unload', function() {
        commitWithoutFeedback();
    });

    $("article").on(
        'dragover',
        function(e) {
            e.preventDefault();
            e.stopPropagation();
        }
    )

    $("article").on(
        'dragenter',
        function(e) {
            e.preventDefault();
            e.stopPropagation();
        }
    )

    $("article").on('drop', (ev) => {
        ev.preventDefault();  
        ev.stopPropagation();
        var data = ev.originalEvent.dataTransfer.getData("text");
        alert(data);
    });
    
    window.onhashchange();

});

});

