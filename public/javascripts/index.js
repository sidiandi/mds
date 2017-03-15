var restore = undefined;

$(document).ready(function(){

    let hash = null;

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
                    if (callback) {
                        callback(data);
                    }
                }
            }
        });
    }

    function commitWithoutFeedback() {
        if (!(hash === null)) {
            api({
                hash: hash,
                source: $('#source').val(),
                commit: true,
            });
        }
    }

    function scrollTo(hash) { 
        const p = parseHash(hash)
        const id = p.anchor;
        if (id) {
            const elementToScrollTo = $(id);
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
                breadCrumbs : true,
                navbar: true,
                history: true
                // history: true
            }, (data) => {
                $('#source').val(data.source);
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
            hash: hash,
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
            hash: hash,
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

    for (e of [$('#source'), $('#search'), $(document)]) {
        e.bind('keydown', 'ctrl+/', function() {
            searchFocus();
        });

        e.bind('keydown', 'F2', function() {
            toggleEditMode();
        });
    }

    $('#source').keyup(function() {
        updateTempSource($('#source').val());
    });

    $('#search').bind('keydown', 'return', function() {
        const firstA = $('article').find('a:first');
        if (firstA) {
            window.location.href = firstA.attr('href');
            $('article').focus();
        }
    });

    $('#search').keyup(function(e) {
        if (e.which == 13) {
            e.preventDefault();
        } else {
            window.location.hash = commandSearch + encodeURI($('#search').val());
        }
    })

    $('#commit').click(function() {
        commit();
    });

    function toggleEditMode() {
        if ($('edit').is(":visible")) {
            $('edit').toggle(100, () => {
                $('article').focus();
            });
        } else {
            $('edit').toggle(100, () => {
                $('#source').focus();
            });
        }
    }

    $('#editMode').click(function() {
        toggleEditMode();
    });

    $(window).on('unload', function() {
        commitWithoutFeedback();
    });
    
    window.onhashchange();

});