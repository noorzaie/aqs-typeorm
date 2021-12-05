import { parse } from 'aqs';
import { getConnection } from './utils';
import { User } from './models/User';
import { aqsToTypeorm } from '../index';

const qs = 'id=4&select=["id","name"]';

const params = parse(qs);

getConnection()
	.then(connection => {
		let builder = connection.getRepository(User).createQueryBuilder('user');
		aqsToTypeorm(params, builder);
		console.log(builder.getSql(), builder.getParameters());
	});

/*
query: SELECT id, name FROM "public"."user" "user" WHERE "user"."id" = $1
parameters: { orm_param_0: '4' }
*/
