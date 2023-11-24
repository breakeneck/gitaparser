const Engine = require("../engine");

module.exports = class Vedabase extends Engine {
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

    async parseContentPage(chapter) {
        let $ = await this.getCheerio(this.urlMan.getByPath(chapter.path));
        return {
            path: chapter.path,
            chapter_id: chapter.id,
            sanskrit: $('.r-verse-text em em').html(),
            search_sanskrit: $('.r-verse-text em').text(),
            wordly: $('.r-synonyms p').html(),
            txt: $('.r-translation').text(),
            comment: $('.r-paragraph').html()
        };
    }
}

