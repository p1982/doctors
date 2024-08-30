import {
  AppError,
  ValidationError,
  HttpCode,
} from '../src/server/utils/customErrors.ts';

describe('AppError', () => {
  it('should create an AppError with default values', () => {
    const error = new AppError({ message: 'Something went wrong' });
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe('Error');
    expect(error.httpCode).toBe(HttpCode.INTERNAL_SERVER_ERROR);
    expect(error.message).toBe('Something went wrong');
    expect(error.stack).toBeDefined();
  });

  it('should create an AppError with custom values', () => {
    const error = new AppError({
      name: 'CustomError',
      httpCode: HttpCode.BAD_REQUEST,
      message: 'Custom error message',
    });
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe('CustomError');
    expect(error.httpCode).toBe(HttpCode.BAD_REQUEST);
    expect(error.message).toBe('Custom error message');
    expect(error.stack).toBeDefined();
  });
});

describe('ValidationError', () => {
  it('should create a ValidationError with default BAD_REQUEST http code', () => {
    const error = new ValidationError({ message: 'Invalid input' });
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.name).toBe('Error');
    expect(error.httpCode).toBe(HttpCode.BAD_REQUEST);
    expect(error.message).toBe('Invalid input');
    expect(error.stack).toBeDefined();
  });

  it('should create a ValidationError with custom values', () => {
    const error = new ValidationError({
      name: 'ValidationError',
      httpCode: HttpCode.UNAUTHORIZED,
      message: 'Unauthorized access',
    });
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.name).toBe('ValidationError');
    expect(error.httpCode).toBe(HttpCode.UNAUTHORIZED);
    expect(error.message).toBe('Unauthorized access');
    expect(error.stack).toBeDefined();
  });
});
