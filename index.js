const Parser = require("./src/parser")

const STAGES = {
    init: {title: 'init database (init engine)', argsCount: 2},
    chapters: {title: 'parse book structure (engine chapters url abbr lang)', argsCount: 5},
    content: {title: 'parse texts (content engine book_id)', argsCount: 3},
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
    let parser = new Parser(args.shift());

    switch (STAGE) {
        case 'init':
            parser.resetBook();
            break;
        case 'chapters':
            let [url, abbr, lang, levels] = args
            let book_id = await parser.newBook(url, abbr, lang, levels);
            await parser.bookStructure();
            console.log(`Created book ${book_id}`);
            break;

        case 'content':
            let [book_ids, last_chapter_id] = args;
            for (let [i, book_id] of book_ids.split(',').entries()) {
                await parser.loadBook(book_id);
                await parser.bookContent(i === 0 ? last_chapter_id : 0);
            }
            break;

        case 'delete':
            await parser.deleteBook(...args);
            break;
    }
})();