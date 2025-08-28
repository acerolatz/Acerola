

export class FileNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileNotFoundError';
  }
}

export class DirectoryAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DirectoryAlreadyExistsError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}