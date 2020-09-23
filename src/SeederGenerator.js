const fs = require('fs');
const moment = require('moment');

class SeederGenerator {
  constructor({database, include, exclude, path, connection, disableFkc}) {
    this.database = database;
    this.include = include;
    this.exclude = exclude;
    this.path = path;
    this.connection = connection;
    this.truncate = disableFkc;
    this.tables = {};
    this.dbName = null;
    this.stubContent = '';

    return this;
  }

  async generateSeederFiles() {
    var vm = this;

    // read stub content
    fs.readFile(`${__dirname}/stubs/seeder.js.stub`, 'utf8', function (err, data) {
      if (err) {
        return console.error('Read Error:', err);
      }
      vm.stubContent = data;

      Object.keys(vm.tables).forEach(async (tableName) => {
        let data = await vm.database.table(tableName).select('*');
        let contents = vm.generateContent(tableName, data);
        let migrationPath = `${vm.path}/${vm.snakeToPascal(tableName)}Seeder.js`;

        fs.writeFile(migrationPath, contents, function (err) {
          if (err) {
            return console.error('Write Error:', err);
          }
          console.info(`Seeder file saved to: ${migrationPath}`);
        });
      });
    });
  }


  getStringBetween(str, start, end) {
    return str.match(new RegExp(start+"(.*)"+end))[0];
  }

  snakeToPascal(str) {
    str += '';
    str = str.split('_');

    function upper(str) {
      return str.slice(0, 1).toUpperCase() + str.slice(1, str.length);
    }


    for (let i = 0; i < str.length; i++) {
      var str2 = str[i].split('/');
      for (let j = 0; j < str2.length; j++) {
        str2[j] = upper(str2[j]);
      }
      str[i] = str2.join('');
    }
    return str.join('');
  }

  random(length = 10, numeric = false) {
    let result = '';
    let characters = numeric ? "1234567890" : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  generateContent(tableName, data) {
    let vm = this;
    data.forEach((item, i) => {
      Object.keys(item).forEach( columnName => {
        if(data[i][columnName]) {
          let columnType = vm.tables[tableName][columnName]['type'];
          let momentDate;
          switch (columnType) {
            case 'timestamp':
            case 'datetime':
              data[i][columnName] = moment(item[columnName]).format('YYYY-MM-DD HH:mm:ss');
              break;
            case 'date':
              data[i][columnName] = moment(item[columnName]).format('YYYY-MM-DD');
              break;
          }
        }
      });
    })

    console.info(`Generating seeder file for table: ${tableName}`);

    let pascalTableName = this.snakeToPascal(tableName);

    return this.stubContent
      .replace(new RegExp(`{{truncate}}`, 'g'), this.truncate
        ? `await Database{{connection}}.table('${tableName}').truncate();`
        : ``
      )
      .replace(new RegExp(`{{tableName}}`, 'g'), `${tableName}`)
      .replace(new RegExp(`{{pascalTableName}}`, 'g'), `${pascalTableName}`)
      .replace('{{data}}', JSON.stringify(data, null, 4))
      .replace(new RegExp(`{{connection}}`, 'g'), `.connection('${this.connection}')`);
  }
}

module.exports = SeederGenerator;
