import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidAge', async: false })
export class IsValidAgeConstraint implements ValidatorConstraintInterface {
  validate(age: number, args: ValidationArguments) {
    return age >= 18 && age <= 120;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Age must be between 18 and 120';
  }
}

export function IsValidAge(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidAgeConstraint,
    });
  };
}
