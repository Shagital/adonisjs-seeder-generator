# AdonisJS Seeder Generator
![npm](https://img.shields.io/npm/dt/@shagital/adonisjs-seeder-generator?style=plastic)
![npm (scoped)](https://img.shields.io/npm/v/@shagital/adonisjs-seeder-generator)
![NPM](https://img.shields.io/npm/l/@shagital/adonisjs-seeder-generator)

This package allows you easily generate seeder files for your [AdonisJS](https://adonisjs.com/) app from existing Database table data!

## Currently Supported
- MySQL
- SQLite
- PostgreSQL

## Installation

You can install the package via composer:
``` bash
npm install @shagital/adonisjs-seeder-generator
```
Or with yarn
``` bash
yarn add @shagital/adonisjs-seeder-generator
```

### Usage
Open `start/app.js` and add `@shagital/adonisjs-seeder-generator/src/Commands/SeederGeneratorCommand` to the commands array

- Note that you can replace the `adonis` with `node ace` if adonis is not installed globally on your system.

#### Basic usage
Will generate migration files for all tables in the DB set as default, and save files in `database/seeds` directory
```bash
adonis seed:generate
```

#### Specify tables to generate seeders for
```bash
adonis seed:generate  --include=table1,table2
```

### Exclude specific tables
```bash
adonis seed:generate  --exclude=table1,table2
```

### Specify DB connection to use
>NOTE: Connection type must have been specified in `config/databases`
```bash
adonis seed:generate  --connection=mysql2
```

### Save seeders files in specified path
>NOTE: The package will attempt to create the specified directory if it doesn't exist
```bash
adonis seed:generate  --path=/var/www/html/backups
```

### Truncate table before inserting.
This option is suitable for an application that hasn't gotten to production
>![#f03c15](https://via.placeholder.com/15/f03c15/000000?text=+) NOTE: 
The table content will be wiped! ENSURE THE TABLE IS BACKED UP JUST IN CASE!!!
```bash
adonis seed:generate --force
```

## Example Seeder file
```js
'use strict';

/*
|--------------------------------------------------------------------------
| CitiesSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Database = use('Database');

class CitiesSeeder {
    async run () {
       await Database.connection('mysql').table('cities').truncate();
        let data = [
 
    {
        "id": 219,
        "name": "Kuçovë",
        "country_id": 3,
        "state_id": 629,
        "country_code": "AL",
        "state_code": "BR",
        "latitude": 40.80028,
        "longitude": 19.91667
    },
    {
        "id": 280,
        "name": "Çorovodë",
        "country_id": 3,
        "state_id": 629,
        "country_code": "AL",
        "state_code": "BR",
        "latitude": 40.50417,
        "longitude": 20.22722
    }
...
];
        var i, j, temparray, chunk = 1000;
        for (i = 0,j = data.length; i < j; i += chunk) {
            temparray = data.slice(i, i+chunk);
            await Database.connection('mysql').table('cities').insert(temparray);
        }

    }
}

module.exports = CitiesSeeder;

```
## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

If you have a feature you'd like to add, kindly send a Pull Request (PR)

## Security

If you discover any security related issues, please email [zacchaeus@shagital.com](mailto:zacchaeus@shagital.com) instead of using the issue tracker.

## Credits
- [Zacchaeus Bolaji](https://github.com/djunehor)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
