import {
	registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator';


@ValidatorConstraint({ name: 'isLongitude' })
class IsLongitudeConstraint implements ValidatorConstraintInterface {

	validate(value: any, args: ValidationArguments) {
		return /^\s?[+-]?(180(\.0+)?|1[0-7]\d(\.\d+)?|\d{1,2}(\.\d+)?)\)?$/.test(value);
	}

	defaultMessage(args: ValidationArguments) {
		return 'Invalid longitude';
	}

}

export function IsLongitude(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsLongitudeConstraint
		});
	};
}
