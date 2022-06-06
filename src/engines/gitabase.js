const {Engine} = require("../engine");

module.exports = class Gitabase extends Engine {
    async parseBookTitle(url) {
        let $ = await this.engine.getCheerio(url);
        return $('h4').text();
    }

    async parseCantos(url) {
        return await this.parseTexts(url)
    }

    async parseChapters(url) {
        return await this.parseTexts(url)
    }

    async parseTexts(url) {
        return await this.generalParseChapters(url, '.col-md-12 a')
    }

    async parseContentPage(chapter) {
        let $ = await this.getCheerio(this.urlMan.getByPath(chapter.path));
        let sanskrit = $('blockquote').text().trim();
        return {
            path: chapter.path,
            chapter_id: chapter.id,
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

