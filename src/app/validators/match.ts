import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const pwd1 = control.get('pwd1');
  const pwd2 = control.get('pwd2');

  if (!pwd1 || !pwd2) return null;

  return pwd1.value === pwd2.value ? null : { passwordMismatch: true };
};
