import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'businessHours', async: false })
export class BusinessHoursValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value || typeof value !== 'object') {
      return true; // Optional field, so if it's not provided, it's valid
    }

    // Check if all values are valid BusinessHoursDto objects
    for (const [dayKey, dayValue] of Object.entries(value)) {
      if (typeof dayValue !== 'object' || dayValue === null) {
        return false;
      }

      // Validate BusinessHoursDto structure
      const { open, close, isOpen } = dayValue as any;

      // Check if isOpen is boolean when provided
      if (isOpen !== undefined && typeof isOpen !== 'boolean') {
        return false;
      }

      // Check time format HH:mm when provided
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

      if (open !== undefined) {
        if (typeof open !== 'string' || !timeRegex.test(open)) {
          return false;
        }
      }

      if (close !== undefined) {
        if (typeof close !== 'string' || !timeRegex.test(close)) {
          return false;
        }
      }

      // If not isOpen, both open and close should be provided
      if (isOpen === false && (!open || !close)) {
        return false;
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Business hours must be an object with day keys and valid time values (HH:mm format) and isOpen boolean';
  }
}

export function IsBusinessHours(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: BusinessHoursValidator,
    });
  };
}
