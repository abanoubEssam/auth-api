import {
	registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator';

type constraintType = { propertyName: string, whenValueIn: Array<string> };

@ValidatorConstraint({ name: 'dependOn' })
class DependOnConstraint implements ValidatorConstraintInterface {

	validate(value: any, args: ValidationArguments) {
		let constraint: constraintType;
		for (constraint of args.constraints) {
			if (constraint.whenValueIn.includes(value) && !args.object[constraint.propertyName]) {
				return false;
			}

			if (!constraint.whenValueIn.includes(value) && args.object[constraint.propertyName]) {
				return false;
			}
		}

		return true;
	}

	defaultMessage(args: ValidationArguments) {
		let errorMessage = '';
		args.constraints.forEach((constraint: constraintType, index) => {
			errorMessage += index > 0 ? "\n" : "";
			errorMessage += `property $property depends on property ${constraint.propertyName} when value is in [${constraint.whenValueIn}]`;
		});
		return errorMessage;
	}

}

export function DependOn(constraints: Array<constraintType>, validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: constraints,
			validator: DependOnConstraint
		});
	};
}
