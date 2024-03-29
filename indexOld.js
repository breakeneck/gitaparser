const Parser = require("./src/parser")
const fs = require('fs');

const STAGES = {
    init: {title: 'init database (init engine)', argsCount: 2},
    chapters: {title: 'parse book structure (engine chapters url abbr lang)', argsCount: 5},
    content: {title: 'parse texts (engine content book_id)', argsCount: 3},
    file: {title: 'parse json file (file filename)', argsCount: 2},
    delete: {title: 'delete book (delete engine book_id)', argsCount: 3}
};
const [STAGE] = process.argv.slice(2, 3);

function loadArgs() {
    if (! STAGE) {
        console.log('Possible arguments are:');
        return console.log(STAGES);
    }
    let current = STAGES[STAGE];
    console.log('Started', current.title);
    return process.argv.slice(3, current.argsCount + 3);
}

(async () => {
    let args = loadArgs();
    let parser = new Parser();

    switch (STAGE) {
        case 'init':
            parser.resetBook();
            break;
        case 'chapters':
            let [engine, url, abbr, lang, levels] = args
            let book_id = await parser.newBook(url, abbr, lang, levels);
            await parser.bookStructure();
            console.log(`Created book ${book_id}`);
            break;

        case 'content':
            let [book_ids, last_chapter_id] = args;
            for (let [i, book_id] of book_ids.split(',').entries()) {
                // console.log('content', book_id);
                await parser.loadBook(book_id);
                await parser.bookContent(i === 0 ? last_chapter_id : 0);
            }
            break;

        case 'file':
            let entries = JSON.parse(fs.readFileSync(args.shift(), 'utf8'))
            for (let params of entries) {
                let book_id = await parser.newBook(params.url, params.abbr, params.lang, params.levels);
                await parser.bookStructure();
                console.log(`Created book #${book_id}. Parsing content...`);
                await parser.bookContent();
            }
            break;

        case 'delete':
            await parser.deleteBook(...args);
            break;
    }
})();