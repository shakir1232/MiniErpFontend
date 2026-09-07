let counter = 0

/** Stable-enough ids for prototype records created at runtime. */
export function uid(prefix = 'id') {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter}`
}
