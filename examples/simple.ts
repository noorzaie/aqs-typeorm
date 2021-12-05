import { parse } from 'aqs';
import { getConnection } from './utils';
import { aqsToTypeorm } from '../index';
import { User } from './models/User';

const qs = 'id{gt}4&name=joe';

const params = parse(qs);

getConnection()
	.then(connection => {
		let builder = connection.getRepository(User).createQueryBuilder('user');
		aqsToTypeorm(params, builder);
		console.log(builder.getSql(), builder.getParameters());
	});

/*
query: SELECT "user"."id" AS "user_id", "user"."name" AS "user_name" FROM "public"."user" "user" WHERE "user"."id" > $1 AND "user"."name" = $2
parameters: { orm_param_0: '4', orm_param_1: 'joe' }
*/
