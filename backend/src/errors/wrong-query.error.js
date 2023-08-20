class WrongQueryError extends Error {
  constructor(message) {
    super(message);
    this.code = 401; 
  }
}

export {WrongQueryError}
