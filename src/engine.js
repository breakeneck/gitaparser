const axios = require('axios');
const cheerio = require('cheerio');
const { retry } = require('./retry');

module.exports = class Engine {
    constructor(engineName) {
        this.engineName = engineName;
    }

    setUrlMan(urlMan) {
        this.urlMan = urlMan;
    }

    getDbName() {
        return 'general.db';
    }

    async getCheerio(url = '') {
        console.log(`Loading page ${url}`);
        
        const $ = await retry(
            async () => {
                const page = await axios.get(url, {
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                return cheerio.load(page.data);
            },
            {
                maxRetries: 5,
                baseDelay: 2000,
                onRetry: (attempt, error, delay) => {
                    console.log(`Retry ${attempt}/5 for ${url} after ${Math.round(delay)}ms - Error: ${error.message}`);
                }
            }
        );
        
        return $;
    }

    async generalParseChapters(url, selector) {
        let $ = await this.getCheerio(url);

        let chapters = [];
        for (let el of $(selector)) {
            let $el = $(el);
            chapters.push({
                url: this.urlMan.getUrl($el.attr('href')),
                title: $el.text()
            });
        }
        return chapters;
    }

    async parseBookTitle(url) {}

    async parseChapters() {}

    async parseContentPage() {}
};
