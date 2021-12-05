import { parse } from 'aqs';
import { getConnection } from './utils';
import { User } from './models/User';
import { aqsToTypeorm } from '../index';
import { Photo } from './models/Photo';

const qs = 'views{gt}1000&limit=10&orderBy=views&order=desc&page=5&select=["id","name","views"]';

const params = parse(
	qs,
	{
		paramsConfigs: { limit: { parser: 'number' }, page: { parser: 'number' } },
		// fixedParams: [ { name: 'limit', value: 3, op: 'equal', not: false } ] // We can overwrite limit if we want
	}
);

getConnection()
	.then(connection => {
		let builder = connection.getRepository(Photo).createQueryBuilder('photo');
		aqsToTypeorm(params, builder);
		console.log(builder.getSql(), builder.getParameters());
	});

/*
query: SELECT id, name, views FROM "public"."photo" "photo" WHERE "photo"."views" > $1 ORDER BY views DESC LIMIT 10 OFFSET 40
parameters: { orm_param_0: '1000' }
*/
