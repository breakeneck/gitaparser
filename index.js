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
    let url = uri ? `${URL}${uri}` : `${URL}/${LANG}/${BOOK}`;
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


(async () => {
    let cantos = await getLinks('', /«(.*)»/);

    for (let canto of cantos) {
        canto.chapters = await getLinks(canto.url, /\d*(.*)/);
        for (let chapter of canto.chapters) {
            chapter.shlokas = await getLinks(chapter.url);
        }
    }

    console.log(JSON.stringify(cantos, null, 2));
}) ();