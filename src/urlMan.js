module.exports = class UrlMan {
    constructor(rootUrl) {
        this.rootUrl = rootUrl;

        let url = new URL(rootUrl);
        this.protocol = url.protocol;
        this.hostname = url.hostname;
    }

    getUrl(uri) {
        if (uri.indexOf(this.protocol) === -1) {
            return this.protocol + '//' + this.hostname + uri;
        }
        return uri;
    }

    getByPath(path) {
        return this.rootUrl + path;
    }
}