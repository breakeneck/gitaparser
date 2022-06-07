const Engine = require("../engine");
const sanscreet = require("../sanscreet")

module.exports = class Gitabase extends Engine {
    async parseBookTitle(url) {
        let $ = await this.getCheerio(url);
        return $('h4').text();
    }

    async parseCantos(url) {
        return await this.parseTexts(url)
    }

    async parseChapters(url) {
        return await this.parseTexts(url)
    }

    async parseTexts(url) {
        return this.sanscreetFilter(await this.generalParseChapters(url, '.col-md-12 a'))
    }

    async parseContentPage(chapter) {
        let $ = await this.getCheerio(this.urlMan.getByPath(chapter.path));
        let sanskrit = $('blockquote').text().trim();
        return this.sanscreetFilter({
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
        });
    }

    sanscreetFilter(content) {
        for (const key in content) {
            content[key] = this.replaceSanscreetChars(content[key]);
        }
        return content;
    }

    replaceSanscreetChars(input) {
        if (typeof input  !== 'string') {
            return input;
        }
        let from = Object.keys(sanscreet.mapping).join('');
        return input.replace(new RegExp('([' + from + '])', 'g'), to => sanscreet.mapping[to]);
    }
}

