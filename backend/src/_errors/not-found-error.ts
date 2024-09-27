export class NotFound extends Error {
    constructor(message?: string) {
      super(message ?? 'Not found.')
    }
  }