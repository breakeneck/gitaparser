const util = require('util')
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


const URL = 'http://gitabase.com';
const LANG = 'rus';
const BOOK = 'SB';

let $ = null;

async function getPage(uri = '') {
    let url = uri ? (uri.indexOf('http://') > -1 ? uri : `${URL}${uri}`) : `${URL}/${LANG}/${BOOK}`;
    let page = await axios.get(url);
    return cheerio.load(page.data);
}

async function getLinks(url = '', regexp = /(.*)/) {
    let $ = await getPage(url);

    let items = [];
    for (let linkTag of $('.col-md-12 a')) {
        items.push({
            url: linkTag.attribs.href,
            title: linkTag.children[0].data.match(regexp)[1]
        });
        break;
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
    let cantos = await getLinks('', /«(.*)»/);

    for (let canto of cantos) {
        canto.chapters = await getLinks(canto.url, /\d*(.*)/);
        for (let chapter of canto.chapters) {
            let links = await getLinks(chapter.url);
            chapter.shlokas = await getShlokas(links);
        }
    }

    console.log(JSON.stringify(cantos, null, 2));
}) ();