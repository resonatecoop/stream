/**
 * Return next multiple of given integer
 */

export const nextMultiple = (n = 0, m = 10) => {
  if (n % m === 0 || n === 0) return n + m
  return Math.ceil(n / m) * m
}

export const formatCredit = (tokens) => {
  return (tokens / 1000).toFixed(4)
}

export const range = (start, end, step = 1) => {
  const allNumbers = [start, end, step].every(Number.isFinite)

  if (!allNumbers) {
    throw new TypeError('range() expects only finite numbers as arguments.')
  }

  if (step <= 0) {
    throw new Error('step must be a number greater than 0.')
  }

  if (start > end) {
    step = -step
  }

  const length = Math.floor(Math.abs((end - start) / step)) + 1

  return Array.from(Array(length), (x, index) => start + index * step)
}
