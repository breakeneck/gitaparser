const axios = require('axios');
const cheerio = require('cheerio')

const c = require('./constants');
const storage = require("./storage");
const sql = require('./sql');

let baseUri = '';

let parseBookStructure = async () => {
    baseUri = `/${LANG}/${BOOK}/`;

    // let cantos = await parseLinks('', /«(.*)»/); SB rus version only
    let cantos = await parseChapters('', /(.*)/);

    for (let cantoUrl of cantos) {
        let chapters = await parseChapters(cantoUrl, /\d*(.*)/);

        for (let chapterUrl of chapters) {
            let texts = await parseChapters(chapterUrl, /(.*)/);
        }
    }

    storage.db.exec(sql.UPDATE_CATEGORIES_LEVEL);
}

async function parseChapters(url = '', regexp = /(.*)/, limit = 0) {
    let $ = await getPage(url);

    console.log('Parsing ', url);

    let urls = [];
    for (let linkTag of $('.col-md-12 a')) {
        $linkTag = $(linkTag);
        await db.prepare(sql.INSERT_CATEGORY).run({
            path: url.substr(url.indexOf(baseUri) + baseUri.length),
            title: $linkTag.text().match(regexp)[1],
            book: BOOK,
            lang: LANG
        });
        urls.push($linkTag.attr('href'));
        if (limit && urls.length >= limit) {
            break;
        }
    }

    return urls;
}


let parseBookContent = async () => {
    let i = 0;
    let categories = storage.db.prepare(sql.SELECT_ALL_TEXTS).all({book: BOOK,lang: LANG});
    // console.log(categories);

    for (let category of categories) {
        console.log(category.path);
        try {
            console.log(`Inserting ${category.path} ${Math.round(i/categories.length * 100)}%`);

            let content = await parsePage(category.path);
            await storage.db.prepare(sql.INSERT_CONTENT).run(content);
            i++;
        } catch (error) {
            console.error(error);
        }
    }
}

async function parsePage(path) {
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

async function getPage(uri = '') {
    let url = uri ? (uri.indexOf('https://') > -1 ? uri : `${c.URL}${uri}`) : `${c.URL}/${LANG}/${BOOK}`;

    console.log(`Loading page ${url}`);

    let page = await axios.get(url);
    return cheerio.load(page.data);
}

const STAGES = {'1': 'init database', '2': 'parsing categories', '3': 'parsing content'};
const [STAGE, BOOK, LANG] = process.argv.slice(2);

console.log('Parser require 1 or 3 arguments: stage (1, 2, 3) book (SB, BG, CC), lang (rus, ukr, eng). Stages are: ', STAGES);

(async () => {
    switch (parseInt(STAGE)) {
        case 1:
            console.log(`Started db init`);
            // await storage.removeDb();
            await storage.db.exec(sql.CREATE_CATEGORIES + sql.CREATE_CONTENT);
            break;
        case 2:
            console.log(`Started parsing categories for ${BOOK} [${LANG}]`);
            await parseBookStructure();
            break;
        case 3:
            console.log(`Started parsing content for ${BOOK} [${LANG}]`);
            await parseBookContent();
            break;
        default:
            console.log('No arguments provided!');
    }
}) ();