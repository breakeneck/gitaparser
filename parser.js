const axios = require('axios');
const cheerio = require('cheerio')
cheerio.prototype[Symbol.iterator] = function* () {
    for (let i = 0; i < this.length; i += 1) {
        yield this[i];
    }
};

cheerio.prototype.entries = function* () {
    for (let i = 0; i < this.length; i += 1) {
        yield [i, this[i]];
    }
};

const c = require('./constants');
const db = require("./db");
const sql = require('./sql');



async function getPage(uri = '') {
    let url = uri ? (uri.indexOf('http://') > -1 ? uri : `${c.URL}${uri}`) : `${c.URL}/${c.LANG}/${c.BOOK}`;
    let page = await axios.get(url);
    return cheerio.load(page.data);
}

async function parseLinks(url = '', regexp = /(.*)/, limit = 0) {
    let $ = await getPage(url);

    let items = [];
    for (let linkTag of $('.col-md-12 a')) {
        items.push({
            url: linkTag.attribs.href,
            title: linkTag.children[0].data.match(regexp)[1]
        });
        if (limit && items.length >= limit) {
            break;
        }
    }

    return items;
}

async function parseShloka(uri) {
    let $ = await getPage(uri);
    let sanskrit = $('blockquote').text().trim();
    return {
        uri: uri,
        sanskrit: sanskrit,
        wordly: sanskrit
            ? $('blockquote').closest('.row').next().find('.dia_text p').text().trim()
            : '',
        text: $('.col-md-12 h4').text().trim(),
        comment: sanskrit
             ? $('.dia_text .dia_text').text().trim()
             : $('.pager').next().find('.dia_text').text().trim()
    };
}

async function getShlokas(links) {
    let result = [];
    for (let link of links) {
        let shloka = await parseShloka(link.url);
        result.push(shloka);
    }
    return result;
    // return await links.map(async (link) => await parseShloka(link.url))
}


(async () => {
    db.setBaseUri(`/${c.LANG}/${c.BOOK}/`);

    let cantos = await parseLinks('', /«(.*)»/);
    await db.insertCategories(cantos);

    for (let canto of cantos) {
        let chapters = await parseLinks(canto.url, /\d*(.*)/);
        await db.insertCategories(chapters);

        for (let chapter of chapters) {
            let texts = await parseLinks(chapter.url, /(.*)/);
            await db.insertCategories(texts);
        }
    }

    db.updateCategoriesLevel();
}) ();