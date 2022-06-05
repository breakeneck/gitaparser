const Gitabase = require("./engines/gitabase");
const Vedabase = require("./engines/vedabase");
const Engine = require("./engine")

module.exports.getEngine = function (engineName) {
    switch (engineName) {
        case Engine.GITABASE:
            return new Gitabase();
        case Engine.VEDABASE:
            return new Vedabase();
    }
}