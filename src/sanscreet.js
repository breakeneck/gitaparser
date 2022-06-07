const GITABASE_MAPPINGS = {
    '\uF100': 'А̄',
    '\uF101': 'а̄',
    '\uF102': 'Д̣',
    '\uF103': 'д̣',
    '\uF104': 'Л̣',
    '\uF105': 'л̣',
    '\uF106': 'Л̣̄',
    '\uF107': 'л̣̄',
    '\uF108': 'М̇',
    '\uF109': 'м̇',
    '\uF10A': 'М̣',
    '\uF10B': 'м̣',
    '\uF10C': 'М̣̄',
    '\uF10D': 'м̣̄',
    '\uF10E': 'Н̇',
    '\uF10F': 'н̇',
    '\uF110': 'Н̣',
    '\uF111': 'н̣',
    '\uF112': 'Н̃',
    '\uF113': 'н̃',
    '\uF114': 'Р̣',
    '\uF115': 'р̣',
    '\uF116': 'Р̣̄',
    '\uF117': 'р̣̄',
    '\uF118': 'Х̣',
    '\uF119': 'х̣',
    '\uF11A': 'Т̣',
    '\uF11B': 'т̣',
    '\uF11C': 'Ш́',
    '\uF11D': 'ш́',
    '\u04E2': 'Ӣ',
    '\u04E3': 'ӣ',
    '\u04EE': 'Ӯ',
    '\u04EF': 'ӯ',
}

const UA_MAPPINGS = {
    'джн̃': 'гь',
    '\'': '',
    'А̄': 'А',
    'а̄': 'а',
    'Д̣': 'Д',
    'д̣': 'д',
    'Л̣': 'Лі',
    'л̣': 'лі',
    'Л̣̄': 'Лі',
    'л̣̄': 'лі',
    'М̇': 'М',
    'м̇': 'м',
    'М̣': 'М',
    'м̣': 'м',
    'М̣̄': 'М',
    'м̣̄': 'м',
    'Н̇': 'Н',
    'н̇': 'н',
    'Н̣': 'Н',
    'н̣': 'н',
    'Н̃': 'Н',
    'н̃': 'н',
    'Р̣': 'Рі',
    'р̣': 'рі',
    'Р̣̄': 'Рі',
    'р̣̄': 'рі',
    'Х̣': 'Х',
    'х̣': 'х',
    'Т̣': 'Т',
    'т̣': 'т',
    'Ш́': 'Ш',
    'ш́': 'ш',
    'Ӣ': 'Й',
    'ӣ': 'й',
    'Ӯ': 'У',
    'ӯ': 'у',
    'ī': 'і',
}

const RU_MAPPINGS = {
    'джн̃': 'гь',
    '\'': '',
    'А̄': 'А',
    'а̄': 'а',
    'Д̣': 'Д',
    'д̣': 'д',
    'Л̣': 'Ли',
    'л̣': 'ли',
    'Л̣̄': 'Ли',
    'л̣̄': 'ли',
    'М̇': 'М',
    'м̇': 'м',
    'М̣': 'М',
    'м̣': 'м',
    'М̣̄': 'М',
    'м̣̄': 'м',
    'Н̇': 'Н',
    'н̇': 'н',
    'Н̣': 'Н',
    'н̣': 'н',
    'Н̃': 'Н',
    'н̃': 'н',
    'Р̣': 'Ри',
    'р̣': 'ри',
    'Р̣̄': 'Ри',
    'р̣̄': 'ри',
    'Х̣': 'Х',
    'х̣': 'х',
    'Т̣': 'Т',
    'т̣': 'т',
    'Ш́': 'Ш',
    'ш́': 'ш',
    'Ӣ': 'Й',
    'ӣ': 'й',
    'Ӯ': 'У',
    'ӯ': 'у',
}


function replaceChars(input, collection) {
    if (typeof input  !== 'string') {
        return input;
    }
    let from = Object.keys(collection).join('');
    let result = input.replace(new RegExp('([' + from + '])', 'g'), to => collection[to]);
    return result;
}

module.exports.replaceFromGitabaseChars = function (input) {
    return replaceChars(input, GITABASE_MAPPINGS);
}

module.exports.replaceToCyrillicChars = function (input, lang) {
    if (typeof input  !== 'string') {
        return input;
    }
    const mappings = (lang === 'ukr') ? UA_MAPPINGS : (lang === 'rus' ? RU_MAPPINGS : {})
    for (const [from, to] of Object.entries(mappings)) {
        input = input.replace(new RegExp('(' + from + ')', 'g'), to);
    }
    return input;
}