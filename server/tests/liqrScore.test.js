// Testes do Liqr Score 


import { calculateLiqrScore, applyFilters } from '../src/services/liqrScore.js'

describe('calculateLiqrScore', () => {

  test('médica com salário alto → score alto', () => {
    const result = calculateLiqrScore({
      monthlyIncome:   6200,
      appearanceScore: 7,
      lifestyle:       'luxo',
      hasOwnHome:      true,
      hasChildren:     false,
      educationLevel:  5,
    })
    expect(result.total).toBeGreaterThan(80)
    expect(result.interpretation).toBe('Alta compatibilidade')
  })

  test('professor com salário baixo → score baixo apesar de educação máxima', () => {
    const result = calculateLiqrScore({
      monthlyIncome:   1200,
      appearanceScore: 6,
      lifestyle:       'modesto',
      hasOwnHome:      false,
      hasChildren:     false,
      educationLevel:  5, // educação máxima — mas só vale 5%
    })
    expect(result.total).toBeLessThan(55)
    expect(result.interpretation).toBe('Fora do filtro')
    // Este teste documenta a crítica do projecto:
    // educação máxima não chega para sair do filtro
    expect(result.breakdown.education).toBe(100)
  })

  test('score está sempre entre 0 e 100', () => {
    const alto = calculateLiqrScore({
      monthlyIncome:   50000,
      appearanceScore: 10,
      lifestyle:       'luxo',
      hasOwnHome:      true,
      hasChildren:     false,
      educationLevel:  5,
    })
    const baixo = calculateLiqrScore({
      monthlyIncome:   100,
      appearanceScore: 1,
      lifestyle:       'modesto',
      hasOwnHome:      false,
      hasChildren:     true,
      educationLevel:  1,
    })
    expect(alto.total).toBeLessThanOrEqual(100)
    expect(baixo.total).toBeGreaterThanOrEqual(0)
  })

  test('income tem o maior impacto no score', () => {
    const salarioBaixo = calculateLiqrScore({
      monthlyIncome:   800,
      appearanceScore: 1,
      lifestyle:       'modesto',
      hasOwnHome:      false,
      hasChildren:     true,
      educationLevel:  1,
    })
    const salarioAlto = calculateLiqrScore({
      monthlyIncome:   12000,
      appearanceScore: 1,
      lifestyle:       'modesto',
      hasOwnHome:      false,
      hasChildren:     true,
      educationLevel:  1,
    })
    // Só o salário muda — o score alto deve ser maior
    expect(salarioAlto.total).toBeGreaterThan(salarioBaixo.total)
  })

  test('ter filhos penaliza o score', () => {
    const semFilhos = calculateLiqrScore({
      monthlyIncome:   3000,
      appearanceScore: 7,
      lifestyle:       'premium',
      hasOwnHome:      false,
      hasChildren:     false,
    educationLevel:  3,
    })
    const comFilhos = calculateLiqrScore({
      monthlyIncome:   3000,
      appearanceScore: 7,
      lifestyle:       'premium',
      hasOwnHome:      false,
      hasChildren:     true,
      educationLevel:  3,
    })
    expect(semFilhos.total).toBeGreaterThan(comFilhos.total)
  })

  test('escala logarítmica — €1.200 vale mais do que 3 pontos', () => {
    const result = calculateLiqrScore({
      monthlyIncome:   1200,
      appearanceScore: 1,
      lifestyle:       'modesto',
      hasOwnHome:      false,
      hasChildren:     true,
      educationLevel:  1,
    })
    // Na escala logarítmica, €1.200 normaliza para ~25
    // Na escala linear normalizaria para ~3
    expect(result.breakdown.income).toBeGreaterThan(15)
  })

})

describe('applyFilters', () => {

  const profiles = [
    { id: 'ana',    monthlyIncome: 4800, appearanceScore: 8 },
    { id: 'rui',    monthlyIncome: 950,  appearanceScore: 9 },
    { id: 'marta',  monthlyIncome: 6200, appearanceScore: 7 },
    { id: 'miguel', monthlyIncome: 1200, appearanceScore: 6 },
  ]

  test('filtra perfis abaixo do salário mínimo', () => {
    const { visible, hidden } = applyFilters(profiles, 3000, 1)
    expect(visible).toHaveLength(2)
    expect(hidden).toHaveLength(2)
  })

  test('o Rui tem aparência 9/10 mas é oculto pelo salário', () => {
    // Este teste documenta a crítica:
    // aparência alta não chega se o salário estiver abaixo do filtro
    const { visible } = applyFilters(profiles, 3000, 1)
    const ruiVisivel = visible.find(p => p.id === 'rui')
    expect(ruiVisivel).toBeUndefined()
  })

  test('sem filtros todos os perfis são visíveis', () => {
    const { visible } = applyFilters(profiles, 0, 0)
    expect(visible).toHaveLength(profiles.length)
  })

  test('filtro de aparência funciona independentemente do salário', () => {
    const { hidden } = applyFilters(profiles, 0, 8)
    // Marta (7/10) e Miguel (6/10) ficam ocultos
    expect(hidden.find(p => p.id === 'marta')).toBeDefined()
    expect(hidden.find(p => p.id === 'miguel')).toBeDefined()
  })

})