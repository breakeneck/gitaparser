const axios = require('axios');
const cheerio = require('cheerio')
const Book = require('./book');

let book = new Book();

module.exports.resetBook = () => book.reset();

module.exports.newBook = async (url, abbr, lang, levels) => {
    let $ = await getCheerio(url);
    await book.create({
        title: $('h4').text(),
        url, abbr, lang, levels
    });
}
module.exports.loadBook = (id) => {
    book.load(id);
}

module.exports.bookStructure = async () => {
    let cantosUrls = await parseChapters(book.getUrl());

    for (let cantoUrl of cantosUrls) {
        let chaptersUrls = await parseChapters(cantoUrl, /\d*(.*)/);

        if (book.hasThirdLevel()) {
            for (let chapterUrl of chaptersUrls) {
                await parseChapters(chapterUrl);
            }
        }
    }
}

module.exports.bookContent = async () => {
    let i = 0;
    let chapters = book.getContentLevelChapters();

    for (let chapter of chapters) {
        try {
            console.log(`Inserting ${chapter.path} ${Math.round(++i/chapters.length * 100)}%`);

            await book.addContent(await parseContentPage(chapter.path));
        } catch (error) {
            console.error(error);
        }
    }
}

async function parseChapters(url = '', regexp = /(.*)/) {
    let $ = await getCheerio(url);

    let urls = [];
    for (let el of $('.col-md-12 a')) {
        let $el = $(el);

        await book.addChapter({
            path: book.getPath(url),
            title: $el.text().match(regexp)[1]
        });

        urls.push($el.attr('href'));
    }
    return urls;
}

async function parseContentPage(path) {
    let $ = await getCheerio(book.getUrlByPath(path));
    let sanskrit = $('blockquote').text().trim();
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

async function getCheerio(uri = '') {
    let url = book.getUrl(uri)
    console.log(`Loading page ${url} from ${uri}`);

    let page = await axios.get(url);
    return cheerio.load(page.data);
}