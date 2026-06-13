// liqrScore.js

// Pesos do algoritmo — income vale 45%, education vale 5%
// Os pesos são a crítica do projecto
const WEIGHTS = {
    income:     0.45,
    appearance: 0.25,
    lifestyle:  0.15,
    assets:     0.10,
    education:  0.05,
  }
  
// Converte rendimento para 0-100
// Escala logarítmica — penaliza mais os salários baixos
function normalizeIncome(income) {
    const MIN = 920
    const MAX = 15000
    const clamped = Math.min(Math.max(income, MIN), MAX)
    return Math.round(
      Math.log(clamped - MIN + 1) / Math.log(MAX - MIN + 1) * 100
    )
  }
  
  // Converte lifestyle para 0-100
  function normalizeLifestyle(lifestyle) {
    if (lifestyle === 'modesto') return 10
    if (lifestyle === 'básico')  return 35
    if (lifestyle === 'premium') return 70
    if (lifestyle === 'luxo')    return 100
    return 0
  }
  
  // Calcula pontos de activos
  function normalizeAssets(hasOwnHome, hasChildren) {
    let score = 0
    if (hasOwnHome)   score += 70
    if (!hasChildren) score += 30
    return score
  }
  
  // Função principal — calcula o Liqr Score
  export function calculateLiqrScore(profile) {
    const income     = normalizeIncome(profile.monthlyIncome)
    const appearance = profile.appearanceScore * 10
    const lifestyle  = normalizeLifestyle(profile.lifestyle)
    const assets     = normalizeAssets(profile.hasOwnHome, profile.hasChildren)
    const education  = profile.educationLevel * 20
  
    const total = Math.round(
      income     * WEIGHTS.income     +
      appearance * WEIGHTS.appearance +
      lifestyle  * WEIGHTS.lifestyle  +
      assets     * WEIGHTS.assets     +
      education  * WEIGHTS.education
    )
  
    let interpretation = 'Fora do filtro'
    if (total >= 80) interpretation = 'Alta compatibilidade'
    else if (total >= 65) interpretation = 'No filtro'
    else if (total >= 55) interpretation = 'Compatibilidade reduzida'
  
    return {
      total,
      interpretation,
      breakdown: { income, appearance, lifestyle, assets, education }
    }
  }
  
  // Filtra perfis com base nos critérios do utilizador
  export function applyFilters(profiles, minIncome, minAppearance) {
    const visible = []
    const hidden  = []
  
    for (const profile of profiles) {
      if (profile.monthlyIncome < minIncome || profile.appearanceScore < minAppearance) {
        hidden.push(profile)
      } else {
        visible.push(profile)
      }
    }
  
    return { visible, hidden }
  }