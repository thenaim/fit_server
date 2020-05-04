const Database = require('better-sqlite3');

const options = {
    fileMustExist: true
};

exports.stingray = new Database('./assets/DB/stingray.db', options);
exports.man = new Database('./assets/DB/man.db', options);
exports.woman = new Database('./assets/DB/woman.db', options);

console.log('Successfully connected to the SQLite database.');