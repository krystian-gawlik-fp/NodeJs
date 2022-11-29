import ErrorBase from './errorBase'

export default class Error409 extends ErrorBase {
  constructor(message: string) {
    super(message, 409)
  }
}
