import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

const mockJson = jest.fn();
const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

const mockHost = {
  switchToHttp: () => ({
    getResponse: () => ({ status: mockStatus }),
  }),
} as unknown as ArgumentsHost;

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    jest.clearAllMocks();
  });

  it('HttpException을 해당 상태코드로 처리한다', () => {
    filter.catch(new HttpException('Not Found', HttpStatus.NOT_FOUND), mockHost);
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ statusCode: 404, error: 'Not Found' });
  });

  it('ValidationPipe 에러(객체 message)를 처리한다', () => {
    const response = {
      message: ['field must not be empty'],
      error: 'Bad Request',
      statusCode: 400,
    };
    filter.catch(new HttpException(response, HttpStatus.BAD_REQUEST), mockHost);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ statusCode: 400, error: ['field must not be empty'] });
  });

  it('Error는 INTERNAL_SERVER_ERROR로 처리한다', () => {
    filter.catch(new Error('Upstream failed'), mockHost);
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({ statusCode: 500, error: 'Upstream failed' });
  });

  it('알 수 없는 예외는 500으로 처리한다', () => {
    filter.catch('unknown', mockHost);
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({ statusCode: 500, error: 'Internal server error' });
  });
});
