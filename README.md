`aqs-typeorm` is a tool that builds [typeorm](https://typeorm.io) queries using [aqs](https://github.com/noorzaie/aqs) output.
`aqs` is a query parser library that can parse advanced operators and also query logic, so when you use it together wit aqs-typeorm, you can create typeorm queries from query string.

## Installation
```npm
npm install aqs-typeorm
```

## Usage
First you need to parse query string using `aqs`:
```javascript
import { parse } from 'aqs';
import { createConnection } from 'typeorm';
import { aqsToTypeorm } from 'aqs-typeorm';
import { User } from 'models/User';

const queryString = 'id{gt}4&name=joe';
const params = parse(queryString);
```

Then you can pass `params` to `aqs-typeorm` to build query using typeorm query builder:
```javascript
createConnection({
    type: "postgres",
    host: "localhost",
    username: "***",
    password: "***",
    database: "***",
    schema: "public",
    entities: [ "User.ts" ]
})
    .then(connection => {
        let builder = connection.getRepository(User).createQueryBuilder('user');
        aqsToTypeorm(params, builder);
        console.log(builder.getSql());
        // output: SELECT * "public"."user" "user" WHERE "user"."id" > 4 AND "user"."name" = "joe"
    });
```

There are some more examples that you can find in [exmaples](https://github.com/noorzaie/aqs-typeorm/tree/master/examples) folder.

## Configurations
You can configure name of different field that could be passed in query string:

| Option  | Description | Default value |
| ------------- | ------------- | ------------- |
| orderField  | Name of field to be used as order parameter  | order  |
| orderByField  | Name of field to be used as order_by field  | orderBy  |
| selectField  | Name of field to be used to select output fields  | select  |
| limitField  | Name of field to be used as limit field  | limit  |
| pageField  | Name of field to be used for pagination  | page  |
| perPage  | Number of results to be returned  |   |
| selectJoin  | Return joined relation in result or not  | true  |
| joinAliases  | Alias of join operators (see typeorm docs)  |   |
| selectAliases  | Alias of selected fields (see typeorm docs)  |   |

## Note
This package currently supports `postgres` and `mysql` dialects of typeorm.

