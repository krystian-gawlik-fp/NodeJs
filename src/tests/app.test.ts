import { describe, test, expect } from '@jest/globals'
import axios, { AxiosResponse } from 'axios'

describe('Dummy describe', () => {
  test('Dummy test', async () => {
    const response = await axios.get('http://localhost:3000/version')
    console.log(response)
    expect(true).toBe(true)
  })
})
