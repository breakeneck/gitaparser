const parse = require("./parse")

const STAGES = {
    init: {title: 'init database (init)', argsCount: 1},
    chapters: {title: 'parse book structure (chapters url abbr lang)', argsCount: 4},
    content: {title: 'parse texts (content book_id)', argsCount: 2},
    delete: {title: 'delete book (delete book_id)', argsCount: 2}
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

    switch (STAGE) {
        case 'init':
            parse.resetBook();
            break;
        case 'chapters':
            await parse.newBook(...args);
            await parse.bookStructure();
            break;

        case 'content':
            await parse.loadBook(...args);
            await parse.bookContent(...args);
            break;

        case 'delete':
            await parse.deleteBook(...args);
            break;
    }
})();