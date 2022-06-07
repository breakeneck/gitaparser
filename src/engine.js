const axios = require('axios');
const cheerio = require('cheerio')

module.exports = class Engine {
    constructor(engineName) {
        this.engineName = engineName;
    }

    setUrlMan(urlMan) {
        this.urlMan = urlMan;
    }

    getDbName() {
        return this.engineName + '.db';
    }

    async getCheerio(url = '') {
        console.log(`Loading page ${url}`);

        let page = await axios.get(url);
        return cheerio.load(page.data);
    }

    async generalParseChapters(url, selector) {
        let $ = await this.getCheerio(url);

        let chapters = [];
        for (let el of $(selector)) {
            let $el = $(el);
            chapters.push({
                url: this.urlMan.getUrl($el.attr('href')),
                title: $el.text()
            });
        }
        return chapters;
    }

    async parseBookTitle(url) {}

    async parseChapters() {}

    async parseContentPage() {}
}