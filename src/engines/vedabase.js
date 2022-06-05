const {Engine} = require("../engine");

module.exports = class Vedabase extends Engine {
    getDbName() {
        return 'vedabase.db';
    }

    async parseBookTitle(url) {
        let $ = await this.getCheerio(url);
        return $('.r-book h1').text();
    }

    async parseCantos(url) {
        return await this.generalParseChapters(url, '.book-title')
    }


    async parseChapters(url) {
        return await this.generalParseChapters(url, '.r-chapter a')
    }

    async parseTexts(url) {
        return await this.generalParseChapters(url, '.r-verse a')
    }

    async parseContentPage(path) {
        let $ = await this.getCheerio(this.urlMan.getByPath(path));
        let sanskrit = $('.r-verse-text').text();
        return {
            path,
            sanskrit,
            wordly: sanskrit
                ? $('blockquote').closest('.row').next().find('.dia_text p').text().trim()
                : '',
            txt: $('.col-md-12 h4').text().trim(),
            comment: sanskrit
                ? $('.dia_text .dia_text').text().trim()
                : $('.pager').next().find('.dia_text').text().trim()
        };
    }
}

