import { HttpException, HttpStatus } from '@nestjs/common';

class BadRequestException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

class UnauthorizedException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

class ForbiddenException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.FORBIDDEN);
  }
}

class NotFoundException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.NOT_FOUND);
  }
}

class ConflictException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.CONFLICT);
  }
}

export {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
};
