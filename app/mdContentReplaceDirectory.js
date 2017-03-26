// Constructor
function MdContent(next) {
    this.next = next;
}

MdContent.prototype.init = function() {
    return this.next.init();
}

MdContent.prototype.transformPath = function(path) {
    if (path.endsWith('/')) {
        path = path + 'Readme.md';
    }
    return path;
}

MdContent.prototype.get = function(path, version) {
    path = this.transformPath(path);
    return this.next.get(path, version);
}

MdContent.prototype.getTitleFromRelPath = function(path) {
    return this.next.getTitleFromRelPath(path);
}

MdContent.prototype.getBreadcrumbs = function(path) {
    return this.next.getBreadcrumbs(path);
}

MdContent.prototype.getHistory = function(path) {
    path = this.transformPath(path);
    return this.next.getHistory(path);
}

MdContent.prototype.preview = function(path, source) {
    path = this.transformPath(path);
    return this.next.preview(path, source);
}

MdContent.prototype.set = function(path, source) {
    path = this.transformPath(path);
    return this.next.set(path, source);
}

// export the class
module.exports = MdContent;
