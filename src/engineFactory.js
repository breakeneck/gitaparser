const Gitabase = require("./engines/gitabase");
const Vedabase = require("./engines/vedabase");
const {Engine} = require("./engine")

GITABASE = 'gitabase';
VEDABASE = 'vedabase';

module.exports.getEngine = function (engineName) {
    switch (engineName) {
        case GITABASE:
            return new Gitabase(engineName);
        case VEDABASE:
            return new Vedabase(engineName);
    }
}