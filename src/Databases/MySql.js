const moment = require('moment');
const SeederGenerator = require(`${__dirname}/../SeederGenerator`);

class MySql extends SeederGenerator {
  constructor(props) {
    super(props);
    this.dbType = props.dbType;
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
    let queryResults = await this.database.raw('SHOW TABLES');

    console.info(`Excluding tables`, this.exclude);

    Object.values(queryResults[0]).forEach(table => {
      let t = table[`Tables_in_${this.dbName}`];
      if (!this.exclude.includes(t)) {
        this.tables[table[`Tables_in_${this.dbName}`]] = {};
      }
    });

    return this;
  }

  async tableColumns() {
    let tables = this.tables;
    for (let tableName in tables) {
      let tableColumns = await this.database.raw(`
      select col.*,
      case when kcu.referenced_table_schema is null then null else '>-' end as rel,
      concat(kcu.referenced_table_schema, '.', kcu.referenced_table_name) as primary_table,
      kcu.referenced_column_name as pk_column_name, kcu.constraint_name as fk_constraint_name
      from information_schema.columns col
      join information_schema.tables tab on col.table_schema = tab.table_schema and col.table_name = tab.table_name
      left join information_schema.key_column_usage kcu on col.table_schema = kcu.table_schema
      and col.table_name = kcu.table_name and col.column_name = kcu.column_name
      and kcu.referenced_table_schema is not null where tab.table_type = 'BASE TABLE'
      and col.table_name = '${tableName}' and col.table_schema = '${this.dbName}'
      order by col.table_schema, col.table_name, col.ordinal_position
      `);

      Object.keys(tableColumns[0]).forEach(key => {
        let tableColumn = tableColumns[0][key];
        this.tables[tableName][tableColumn.COLUMN_NAME] = {type:tableColumn['COLUMN_TYPE'].split('(')[0].toLowerCase()};
      });
    }
    return this;

  }

  async connectDb() {
    let query = await this.database.raw('SELECT DATABASE()');
    this.dbName = query[0][0]['DATABASE()'];
    console.log(`DB Name: ${this.dbName}`);
    return this;
  }


}

module.exports = MySql;
