import { parse } from 'aqs';
import { getConnection } from './utils';
import { aqsToTypeorm } from '../index';
import { Photo } from './models/Photo';

const qs = 'id{gt}4&name=photo1&views{lt}1000&isPublished=true&select=["id","name","views"]&logic=(and(isPublished,(or,views,name)))';

const params = parse(
	qs,
	{
		paramsConfigs: {
			isPublished: { parser: 'boolean' },
			views: { parser: 'number' }, id: { parser: 'number' }
		}
	}
);

getConnection()
	.then(connection => {
		let builder = connection.getRepository(Photo).createQueryBuilder('photo');
		aqsToTypeorm(params, builder);
		console.log(builder.getSql(), builder.getParameters());
	});

/*
query: SELECT id, name, views FROM "public"."photo" "photo" WHERE ("photo"."isPublished" = $1 OR ("photo"."views" < $2 OR "photo"."name" = $3))
parameters: { orm_param_0: true, orm_param_1: 1000, orm_param_2: 'photo1' }
*/
