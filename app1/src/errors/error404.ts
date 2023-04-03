import ErrorBase from './errorBase'

export default class Error404 extends ErrorBase {
  constructor(message: string) {
    super(message, 404)
  }
}
