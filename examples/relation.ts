import { parse } from 'aqs';
import { getConnection } from './utils';
import { aqsToTypeorm, ConfigType } from '../index';
import { Photo } from './models/Photo';

const qs = 'id{gt}4&userId=2&userName=joe';

const params = parse(
	qs,
	{
		fixedParams: [ { name: 'select', value: [ 'user.id', 'photo.views', 'user.name', 'photo.user' ], op: 'equal', not: false } ],
		paramsConfigs: { userId: { alias: 'user.id' }, userName: { alias: 'user.name' } }
	}
);

getConnection()
	.then(connection => {
		let builder = connection.getRepository(Photo).createQueryBuilder('photo');

		const config: ConfigType = {
			joinAliases: { 'photo.user': 'user' }
		};
		aqsToTypeorm(params, builder, config);
		console.log(builder.getSql(), builder.getParameters());
	});

/*
query: SELECT "photo"."views" AS "photo_views", "user"."id" AS "user_id", "user"."name" AS "user_name" FROM "public"."photo" "photo" LEFT JOIN "public"."user" "user" ON "user"."id"="photo"."userId" WHERE "photo"."id" > $1 AND "photo"."userId" = $2 AND "user"."name" = $3
parameters: { orm_param_0: '4', orm_param_1: '2', orm_param_2: 'joe' }
*/
