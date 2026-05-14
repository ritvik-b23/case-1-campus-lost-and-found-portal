import type { ItemFormData } from './types';

export interface ValidationErrors {
  [field: string]: string;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateItem(data: Partial<ItemFormData>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.title?.trim())         errors.title         = 'Title is required.';
  if (!data.description?.trim())   errors.description   = 'Description is required.';
  if (!data.location?.trim())      errors.location      = 'Location is required.';
  if (!data.date?.trim())          errors.date          = 'Date is required.';
  if (!data.category?.trim())      errors.category      = 'Category is required.';
  if (!data.contact_name?.trim())  errors.contact_name  = 'Contact name is required.';

  if (!data.contact_email?.trim()) {
    errors.contact_email = 'Contact email is required.';
  } else if (!validateEmail(data.contact_email)) {
    errors.contact_email = 'Please enter a valid email address.';
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
