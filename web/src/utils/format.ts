const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

/** "Set 2025" — formato usado nos cards do protótipo. */
export function mesAno(data: Date): string {
  return `${meses[data.getMonth()]} ${data.getFullYear()}`
}
