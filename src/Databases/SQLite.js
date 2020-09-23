const SeederGenerator = require(`${__dirname}/../SeederGenerator`);
const Config = use('Config');

class SQLite extends SeederGenerator {
  constructor(props) {
    super(props);
    this.dbType = props.dbType;
    this.exclude.push('sqlite_sequence');
  }

  async getTables() {
    if (this.include.length) {
      for (let t of this.include) {
        this.tables[t.trim()] = {};
      }
      console.info(`Using passed tables: `, this.include);
      return this;
    }
    console.info(`Fetching all tables in DB`);
    let queryResults = await this.database.raw("SELECT name FROM sqlite_master WHERE type='table'");

    console.info(`Excluding tables`, this.exclude);

    Object.values(queryResults).forEach(table => {
      let tableName = table['name'];
      if (!this.exclude.includes(tableName)) {
        this.tables[tableName] = {};
      }
    });

    return this;
  }

  async tableColumns() {
    let tables = this.tables;
    for (let tableName in tables) {
      let tableColumns = await this.database.raw(`PRAGMA table_info('${tableName}');`);

      Object.keys(tableColumns).forEach(key => {
        let tableColumn = tableColumns[key];
        this.tables[tableName][tableColumn['name']] = {type:tableColumn['type'].split('(')[0].toLowerCase()};
      });

    }
    return this;

  }

  async connectDb() {
    this.dbName =  Config.get(`database.${this.connection}`).connection.filename;
    console.log(`DB Name: ${this.dbName}`);
    return this;
  }

}

module.exports = SQLite;
