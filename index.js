const parse = require("./parse")

const STAGES = {
    0: {title: 'init database (0)', argsCount: 0},
    1: {title: 'parse book structure (1 url abbr lang)', argsCount: 4},
    2: {title: 'parse texts (2 book_id)', argsCount: 2}
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
        case '0':
            parse.resetBook();
            break;
        case '1':
            await parse.newBook(...args);
            await parse.bookStructure();
            break;

        case '2':
            await parse.loadBook(...args);
            await parse.bookContent();
            break;
    }
})();