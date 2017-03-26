const mdExtension = '.md';
const dirSep = '/';

function join(parts) {
    return parts.join(dirSep);
}

function split(path) {
    return path.split(dirSep);
}

function canonic(path) {
    let y = [];
    let count = 0;
    const parts = split(path);
    for (i of parts) {
        if (i === '.') {

        } else if (i == '..') {
            y.pop();
        } else if (i || count == 0 || count == parts.length -1 ) {
            y.push(i);
        }
        count++;
    }
    return join(y);
}

function getLineage(relPath) {
    let lineage = [];
    let i = -1;
    for (;;)
    {
        i = relPath.indexOf('/', i+1);
        if (i<0)
        {
            lineage.push(relPath);
            break;
        }
        lineage.push(relPath.substr(0, i+1));
        if (i+1 >= relPath.length) {
            break;
        }
    }
    return lineage;
}

function ensureTrailingSlash(path) {
    path = canonic(path);
    if (path.endsWith('/')) {
    }
    else {
        path = path + '/';
    }
    return path;
}

function getParent(relPath) {
    var lin = getLineage(canonic(relPath));
    return lin[lin.length-2];
}

module.exports = {
    join: join,
    split: split,
    canonic: canonic,
    getLineage: getLineage,
    ensureTrailingSlash: ensureTrailingSlash,
    getParent: getParent,

    mdExtension: mdExtension
}
