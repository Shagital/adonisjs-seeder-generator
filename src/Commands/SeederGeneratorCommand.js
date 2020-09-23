'use strict';

const fs = require('fs');
const {Command} = require('@adonisjs/ace');
const Database = use('Database');
const Env = use('Env');
const Config = use('Config');
const MySql = require(`${__dirname}/../Databases/MySql`);
const SQLite = require(`${__dirname}/../Databases/SQLite`);
const PostgreSql = require(`${__dirname}/../Databases/PostgreSql`);
const Helpers = use('Helpers');

class SeederGeneratorCommand extends Command {
  constructor() {
    super();
    this.dbType = null;
    this.supportedTypes = ['mysql', 'sqlite3', 'pg'];
    this.migrationTables = ['adonis_schema', 'migrations'];
  }

  static get signature() {
    return `seed:generate
            { --include=@value : comma-separated name of the table(s) to generate seeder }
            { --exclude=@value : comma-separated name of the table(s) to  exclude from seeder generation }
            { --connection=@value : DB connection to use }
            { --truncate : Whether to truncate table before insert }
            { --force : Overwrite existing migration folder}
            { --path=@value : Directory to save migration files}
            `
  }

  static get description() {
    return 'Generate Seeder files for DB table data'
  }

  getConnection(connection) {
    this.info('Fetching DB connection...');

    this.dbType = Config.get(`database.${connection}`).client;
    if (!this.supportedTypes.includes(this.dbType.toLowerCase())) {
      return false
    }

    this.info(`Using DB Connection: ${connection}`);
    return Database.connection(connection);

  }

  async handle(args, flags) {
    this.info('Starting...');
    flags.include = flags.include ? flags.include.split(',') : [];
    flags.exclude = (flags.exclude ? flags.exclude.split(',') : []).concat(this.migrationTables);
    flags.path = flags.path || Helpers.databasePath('seeds');
    flags.connection = flags.connection || Env.get('DB_CONNECTION');
    flags.disableFkc = flags.disableFkc === null ? true : !!flags.path;


    // if force is enabled, delete directory
    if (flags.force) {
      await this.removeDir(flags.path);
    }

    // if directory not exist, create
    if (!fs.existsSync(flags.path)) {
      fs.mkdirSync(flags.path);
    }

    this.info(`Seeder files will be saved in ${flags.path}`);
    flags.truncate && console.error(`Tables will be truncated!`);

    flags.database = this.getConnection(flags.connection);
    if (!flags.database) {
      this.error(`Unsupported DB type [${this.dbType}]`);
      return;
    }

    let dbClass;
    flags.dbType = this.dbType;
    switch (this.dbType) {
      case 'mysql':
        dbClass = new MySql(flags);
        break;
      case 'sqlite3':
        dbClass = new SQLite(flags);
        break;
      case 'pg':
        dbClass = new PostgreSql(flags);
    }


    await dbClass.connectDb();
    await dbClass.getTables();
    await dbClass.tableColumns();

    await dbClass.generateSeederFiles();

  }
}

module.exports = SeederGeneratorCommand;
