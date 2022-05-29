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
const storage = require("./storage");
const sql = require('./sql');



async function getPage(uri = '') {
    let url = uri ? (uri.indexOf('http://') > -1 ? uri : `${c.URL}${uri}`) : `${c.URL}/${LANG}/${BOOK}`;

    console.log(`Loading page ${url}`);

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

async function parseText(path) {
    let uri = `${c.URL}/${LANG}/${BOOK}/${path}`;
    let $ = await getPage(uri);
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
             : $('.pager').next().find('.dia_text').text().trim(),
        book: BOOK,
        lang: LANG
    };
}

let parseCategories = async () => {
    storage.setBaseUri(`/${LANG}/${BOOK}/`);

    let cantos = await parseLinks('', /«(.*)»/);
    await storage.insertCategories(cantos);

    for (let canto of cantos) {
        let chapters = await parseLinks(canto.url, /\d*(.*)/);
        await storage.insertCategories(chapters);

        for (let chapter of chapters) {
            let texts = await parseLinks(chapter.url, /(.*)/);
            await storage.insertCategories(texts);
        }
    }

    storage.db.exec(sql.UPDATE_CATEGORIES_LEVEL);
}


let parseTexts = async () => {
    let i = 0;
    let categories = storage.db.prepare(sql.SELECT_ALL_TEXTS).all();

    for (let category of categories) {
        let content = await parseText(category.path);
        console.log(`Inserting ${category.path} ${Math.round(i/categories.length * 100)}%`);
        await storage.db.prepare(sql.INSERT_CONTENT).run(content);
        i++;
    }
}

const STAGES = {'0': 'init database', '1': 'parsing categories', '2': 'parsing content'};
const [STAGE, LANG, BOOK] = process.argv.slice(2);

console.log('Parser require 1 or 3 arguments: stage (0, 1, 2) book (SB, BG, CC), lang (rus, ukr, eng). Stages are: ', STAGES);
console.log(`Started ${STAGES[STAGE]}` + (parseInt(STAGE) ? ` ${BOOK} for language ${LANG}` : ``));

(async () => {
    switch (parseInt(STAGE)) {
        case 0: await storage.db.exec(sql.CREATE_CATEGORIES + sql.CREATE_CONTENT); break;
        case 1: await parseCategories(); break;
        case 2: await parseTexts(); break;
    }
}) ();