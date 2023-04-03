import ErrorBase from './errorBase'

export default class Error401 extends ErrorBase {
  constructor(message: string) {
    super(message, 401)
  }
}
