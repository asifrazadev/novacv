/**
 * Deep merge utility for combining nested objects.
 * Used for merging resume data with defaults and merging user-provided data.
 */
export function deepMerge<T>(target: T, source: unknown): T {
  if (!source || typeof source !== 'object') {
    return target
  }

  const sourceObj = source as Record<string, unknown>
  const result = { ...target } as T

  Object.keys(sourceObj).forEach(key => {
    const targetVal = (target as Record<string, unknown>)[key]
    const sourceVal = sourceObj[key]

    if (
      sourceVal &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal) &&
      targetVal !== null
    ) {
      (result as Record<string, unknown>)[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal
      )
    } else if (Array.isArray(sourceVal)) {
      if (sourceVal.length === 0 && targetVal && typeof targetVal === 'object' && !Array.isArray(targetVal)) {
        (result as Record<string, unknown>)[key] = targetVal
      } else {
        (result as Record<string, unknown>)[key] = sourceVal
      }
    } else if (sourceVal !== undefined) {
      (result as Record<string, unknown>)[key] = sourceVal
    }
  })

  return result
}
