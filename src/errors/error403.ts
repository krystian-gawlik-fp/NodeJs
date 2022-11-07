import ErrorBase from './errorBase'

export default class Error403 extends ErrorBase {
  constructor(message: string) {
    super(message, 403)
  }
}
