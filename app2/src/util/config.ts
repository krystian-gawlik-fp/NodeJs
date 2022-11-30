export default (key: string) => {
  const value = process.env[key]

  if (value) {
    return value
  }

  throw new Error(`Missing configuration (${key})`)
}
