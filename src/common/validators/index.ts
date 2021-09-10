import * as Ajv from 'ajv';

export * from './is-lat.validator';
export * from './is-lng.validator';
export * from './depend-on.validator';

export const ajv = new Ajv({
    coerceTypes: true, allErrors: true, removeAdditional: true,
});
