import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';


@ValidatorConstraint({ name: 'isLatitude' })
class IsLatitudeConstraint implements ValidatorConstraintInterface {

	validate(value: any, args: ValidationArguments) {
		return /^\(?[+-]?(90(\.0+)?|[1-8]?\d(\.\d+)?)$/.test(value);
	}

	defaultMessage(args: ValidationArguments) {
		return 'Invalid latitude';
	}

}

export function IsLatitude(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsLatitudeConstraint
		});
	};
}
