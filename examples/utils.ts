import { createConnection } from 'typeorm';

export const getConnection = async () => {
	return createConnection({
		type: "postgres",
		host: "localhost",
		username: "postgres",
		password: "postgres",
		database: "test_db",
		schema: "public",
		entities: [ "examples/models/Photo.ts", "examples/models/User.ts" ],
		synchronize: true
	});
};
