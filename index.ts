import {
	Between,
	Brackets,
	Equal,
	FindOperator,
	ILike,
	In,
	LessThan,
	LessThanOrEqual,
	Like,
	MoreThan,
	MoreThanOrEqual,
	Not,
	SelectQueryBuilder,
	WhereExpressionBuilder
} from 'typeorm';
import { ConditionalQueryType, LogicalValueType, ParseReturnType } from 'aqs';

const LOGICAL_OP_MAPPING: { and: 'andWhere', or: 'orWhere' } = { and: 'andWhere', or: 'orWhere' };
const OP_MAPPING: { [key: string]: (value: any) => FindOperator<unknown> } = {
	'=': value => Equal(value),
	'e': value => Equal(value),
	'i': value => In(value),
	'sw': value => Like(`${value}%`),
	'ew': value => Like(`%${value}`),
	'gt': value => MoreThan(value),
	'lt': value => LessThan(value),
	'ge': value => MoreThanOrEqual(value),
	'le': value => LessThanOrEqual(value),
	'b': value => Between(value[0], value[1]),
	'c': value => Like(`%${value}%`),
	// 'ic': 'includes',
	'l': value => Like(value),
	'il': value => ILike(value),
	// 'r': 'regex',
	'equal': value => Equal(value),
	'in': value => In(value),
	'startsWith': value => Like(`${value}%`),
	'endsWith': value => Like(`%${value}`),
	'greaterThan': value => MoreThan(value),
	'lessThan': value => LessThan(value),
	'greaterOrEqual': value => MoreThanOrEqual(value),
	'lessOrEqual': value => LessThanOrEqual(value),
	'between': value => Between(value[0], value[1]),
	'contains': value => Like(`%${value}%`),
	// 'includes': 'includes',
	'like': value => Like(value),
	'ilike': value => ILike(value),
	// 'regex': 'regex'
};

const addConditionsToQueryBuilder = (params: ConditionalQueryType, builder: SelectQueryBuilder<unknown> | WhereExpressionBuilder, rootOp: 'or' | 'and') => {
	for (const param of params) {
		if ('operands' in param) {  // Nested condition
			builder = builder[LOGICAL_OP_MAPPING[(param as LogicalValueType).op]](
				new Brackets(qb => {
					addConditionsToQueryBuilder(param.operands, qb, param.op);
				})
			);
		} else {
			if (param.op in OP_MAPPING) {
				// If parameter has dot in its name, then we consider it as a relation field and a nested object should be created for condition
				let nameParts = param.name.split('.');
				const fieldName = nameParts.pop();
				let whereObject: { [key: string]: any } = {};
				let nestedField = whereObject;
				for (const np of nameParts) {
					nestedField[np] = {};
					nestedField = nestedField[np];
				}

				nestedField[fieldName as string] = param.not ? Not(OP_MAPPING[param.op](param.value)) : OP_MAPPING[param.op](param.value);

				builder = builder[LOGICAL_OP_MAPPING[rootOp]](whereObject);
			} else {
				console.warn(`aqs-typeorm: Operator '${param.op}' not supported!`);
			}
		}
	}
};

const DEFAULT_CONFIG: ConfigType = {
	orderField: 'order',
	orderByField: 'orderBy',
	limitField: 'limit',
	pageField: 'page',
	selectJoin: true,
	selectField: 'select'
};

export const aqsToTypeorm = (params: ParseReturnType, builder: SelectQueryBuilder<unknown>, config?: ConfigType): SelectQueryBuilder<unknown> => {
	config = {
		...DEFAULT_CONFIG,
		...(config || {})
	};

	// If logic is empty, create simple x=y conditions
	if (params.conditions.length === 0) {
		params.conditions = Object.entries(params.params)
			// Separate non-condition params
			.filter(([name]) => ![config?.orderField, config?.orderByField, config?.selectField, config?.limitField, config?.pageField].includes(name))
			.map(([_, param]) => param);
	}

	if (config.orderByField && config.orderByField in params.params) {
		builder = builder.orderBy(params.params[config.orderByField].value, config.orderField ? params.params[config.orderField]?.value.toUpperCase() : undefined);
	}

	if (config.selectField && params.params[config.selectField]?.value) {
		let joinSelection: string[] = [];
		// Separate relation fields and direct fields
		if (config.joinAliases) {
			joinSelection = params.params[config.selectField].value.filter((p: string) => config?.joinAliases ? p in config.joinAliases : false);
		}
		const selection: string[] = params.params[config.selectField].value.filter((p: string) => !joinSelection.includes(p));

		// Join related table
		for (const select of joinSelection) {
			if (config.selectJoin === false) {
				builder = builder.leftJoin(select, config.joinAliases?.[select] as string);
			} else {
				builder = builder.leftJoinAndSelect(select, config.joinAliases?.[select] as string);
			}
		}

		builder = builder.select(selection.map(select => config?.selectAliases?.[select] || select));
	}

	addConditionsToQueryBuilder(params.conditions, builder, 'and');

	if (config.limitField && params.params[config.limitField]) {
		builder = builder.limit(config.perPage ? config.perPage : params.params[config.limitField].value);
	}

	// Determine perPage value from config or value passed in query string (limitField)
	if (config.pageField && (config.perPage || (config.limitField && params.params[config.limitField])) && params.params[config.pageField]) {
		builder = builder.offset(
			(config.perPage || params.params[config.limitField!].value) * (params.params[config.pageField].value - 1)
		);
	}

	return builder;
}

export interface ConfigType {
	orderField?: string;
	orderByField?: string;
	selectField?: string;
	limitField?: string;
	pageField?: string;
	perPage?: number;
	selectJoin?: boolean;
	joinAliases?: { [key: string]: string };
	selectAliases?: { [key: string]: string };
}
