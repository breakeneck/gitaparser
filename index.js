const Parser = require("./src/parser");
const { getDatabase } = require("./src/database");
const argv = require('minimist')(process.argv.slice(2));

var player = require('play-sound')(opts = {});
const parser = new Parser();

(async () => {
    try {
        switch (argv.action) {
            case 'init': 
                await parser.initDbTables(); 
                break;
            case 'chapters': 
                await parseChapters(); 
                break;
            case 'content': 
                await parseContent();
                break;
            case 'retry': 
                await retrySkipped();
                break;
            default: 
                console.log('Supported actions are: init, chapters, content, retry');
                console.log('Your action is:', argv.action);
                console.log('\nUsage examples:');
                console.log('  node index.js --action init');
                console.log('  node index.js --action chapters --engine gitabase --url https://gitabase.com/ukr/BG --abbr bg --lang ukr --levels 2');
                console.log('  node index.js --action content --book_id 1');
                console.log('  node index.js --action content --book_id 1 --last_chapter_id 100');
                console.log('  node index.js --action retry --book_id 1');
        }
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        // Close database connection
        const db = await getDatabase();
        await db.close();
        
        // Play sound notification
        player.play('end.mp3', (err) => {
            if (err) console.log('Could not play sound');
        });
    }
})();

async function parseChapters() {
    const { engine, url, abbr, lang, levels } = argv;
    
    if (!engine || !url || !abbr || !lang || !levels) {
        console.error('Missing required parameters for chapters action');
        console.log('Required: --engine, --url, --abbr, --lang, --levels');
        return;
    }
    
    await parser.newBook(engine, url, abbr, lang, parseInt(levels));
    await parser.bookStructure();
    console.log('Book Chapters:', parser.book.model.id, parser.book.model.title);
}

async function parseContent() {
    const { book_id, last_chapter_id, skip_existing } = argv;
    
    if (!book_id) {
        console.error('Missing required parameter: --book_id');
        return;
    }
    
    await parser.loadBook(parseInt(book_id));
    await parser.bookContent(last_chapter_id ? parseInt(last_chapter_id) : 0, skip_existing !== 'false');
}

async function retrySkipped() {
    const { book_id } = argv;
    
    if (!book_id) {
        console.error('Missing required parameter: --book_id');
        return;
    }
    
    await parser.loadBook(parseInt(book_id));
    await parser.retrySkippedPages();
}
