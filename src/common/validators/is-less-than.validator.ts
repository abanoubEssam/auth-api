import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

export function isEqualOrLessThan(property: string, validationOptions?: ValidationOptions) {
	return function(object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [ property ],
			validator: isEqualOrLessThanConstraint
		});
	};
}

@ValidatorConstraint({ name: 'isEqualOrLessThan' })
export class isEqualOrLessThanConstraint implements ValidatorConstraintInterface {
	validate(value: number, args: ValidationArguments) {
		const [ relatedPropertyName ] = args.constraints;
		const relatedValue = (args.object as any)[relatedPropertyName];
		return typeof value === 'number' && typeof relatedValue === 'number' && value <= relatedValue;
	}
}
