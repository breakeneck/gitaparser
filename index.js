const Parser = require("./src/parser")
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

var player = require('play-sound')(opts = {});
const parser = new Parser();

( async() => {
    switch (argv.action) {
        case 'init': await initDb(); break;
        case 'chapters': await parseChapters(); break;
        case 'content': await parseContent(); break
        default: console.log('Supported actions are init, chapters, content');
    }
    player.play('end.mp3')
})();

async function parseChapters(){
    const {engine, url, abbr, lang, levels} = argv;
    await parser.newBook(engine, url, abbr, lang, levels);
    await parser.bookStructure();
}

async function parseContent(){
    const {book_id, last_chapter_id} = argv;
    await parser.loadBook(book_id);
    await parser.bookContent(last_chapter_id ? last_chapter_id : 0);
}