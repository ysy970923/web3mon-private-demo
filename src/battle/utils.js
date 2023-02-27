const P2 = 43
const P3 = 8353
const P4 = 7643
const P5 = 9973

export function random_success_reflection(r, prob) {
  return (r % P2) % 100 < prob
}

export function random_success_nullify_attack(r, prob) {
  return (r % P3) % 100 < prob
}

export function random_success_nullify_defence(r, prob) {
  return (r % P4) % 100 < prob
}

export function random_success_defence(r, prob) {
  return (r % P5) % 100 < prob
}
