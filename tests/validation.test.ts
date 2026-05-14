import { describe, it, expect } from 'vitest';
import { validateEmail, validateItem, hasErrors } from '../lib/validation';

describe('validateEmail', () => {
  it('accepts valid email addresses', () => {
    expect(validateEmail('student@campus.edu')).toBe(true);
    expect(validateEmail('user.name+tag@example.co.in')).toBe(true);
    expect(validateEmail('x@y.z')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('@nodomain')).toBe(false);
    expect(validateEmail('noatsign.com')).toBe(false);
    expect(validateEmail('spaces in@email.com')).toBe(false);
  });
});

describe('validateItem', () => {
  const validData = {
    type:          'lost' as const,
    title:         'Black Wallet',
    category:      'Wallet',
    description:   'Lost near library',
    location:      'Central Library',
    date:          '2026-05-10',
    image_url:     null,
    contact_name:  'Rahul Sharma',
    contact_email: 'rahul@campus.edu',
  };

  it('returns no errors for valid data', () => {
    const errors = validateItem(validData);
    expect(hasErrors(errors)).toBe(false);
  });

  it('requires title', () => {
    const errors = validateItem({ ...validData, title: '' });
    expect(errors.title).toBeDefined();
  });

  it('requires description', () => {
    const errors = validateItem({ ...validData, description: '' });
    expect(errors.description).toBeDefined();
  });

  it('requires location', () => {
    const errors = validateItem({ ...validData, location: '' });
    expect(errors.location).toBeDefined();
  });

  it('requires date', () => {
    const errors = validateItem({ ...validData, date: '' });
    expect(errors.date).toBeDefined();
  });

  it('requires category', () => {
    const errors = validateItem({ ...validData, category: '' });
    expect(errors.category).toBeDefined();
  });

  it('requires contact name', () => {
    const errors = validateItem({ ...validData, contact_name: '' });
    expect(errors.contact_name).toBeDefined();
  });

  it('requires valid contact email', () => {
    const missingEmail = validateItem({ ...validData, contact_email: '' });
    expect(missingEmail.contact_email).toBeDefined();

    const badEmail = validateItem({ ...validData, contact_email: 'notvalid' });
    expect(badEmail.contact_email).toBeDefined();
  });

  it('accepts optional fields as empty strings without errors', () => {
    const errors = validateItem({ ...validData, color: '', brand: '', identifying_details: '' });
    expect(hasErrors(errors)).toBe(false);
  });
});
