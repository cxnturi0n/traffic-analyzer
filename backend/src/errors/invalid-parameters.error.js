class InvalidParameters extends Error {
    constructor(message) {
      super(message);
      this.code = 401; 
    }
  }
  
  export {InvalidParameters}