import { Profile } from './types'
import { SwipeRecord } from '@/hooks/useSession'

export interface MirrorInsight {
    text: string
    weight: number // usado para ordenar — insights mais fortes primeiro
    category: 'income' | 'appearance' | 'education' | 'pattern' | 'comparison' | 'closing'
}

const LOW_INCOME_THRESHOLD = 1500
const HIGH_APPEARANCE_THRESHOLD = 7
const HIGH_EDUCATION_THRESHOLD = 4

// ─── Dados reais de investigação — usados para contextualizar ────
// Fontes: Tyson et al. IEEE 2016, Bruch & Newman Science 2018, FTC 2024
const RESEARCH_BENCHMARKS = {
    incomeMessageGap: 58,      // % menos mensagens para mulheres com rendimento alto
    luxuryCarBoost: 3,         // × mais matches com carro de luxo visível
    topMenAttention: 58,       // % das mulheres contactam apenas os 10% homens "mais atraentes"
    ghostingRate: 61,          // % de utilizadores ghostados em 2025
}

function pluralize(count: number, singular: string, plural: string): string {
    return count === 1 ? singular : plural
}

function firstNames(profiles: Profile[]): string {
    const names = profiles.map((p) => p.name.split(' ')[0])
    if (names.length === 1) return names[0]
    if (names.length === 2) return `${names[0]} e ${names[1]}`
    return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}

/**
 * Detecta o perfil mais "contraditório" da sessão —
 * aquele com maior distância entre qualidades humanas (aparência + educação)
 * e rendimento, que ainda assim foi descartado.
 * Generaliza o que antes era hardcoded para o Miguel.
 */
function findMostContradictoryProfile(skipped: Profile[]): Profile | null {
    if (skipped.length === 0) return null

    const scored = skipped.map((p) => {
        const humanQualities = (p.appearanceScore / 10) * 0.4 + (p.educationLevel / 5) * 0.6
        const incomeNormalized = Math.min(p.monthlyIncome / 6000, 1)
        const contradiction = humanQualities - incomeNormalized
        return { profile: p, contradiction }
    })

    scored.sort((a, b) => b.contradiction - a.contradiction)
    const top = scored[0]

    // Só conta como "contraditório" se a distância for significativa
    return top.contradiction > 0.3 ? top.profile : null
}

export function generateMirror(history: SwipeRecord[]) {
    const liked = history.filter((h) => h.action === 'like').map((h) => h.profile)
    const skipped = history.filter((h) => h.action === 'skip').map((h) => h.profile)
    const total = history.length

    const insights: MirrorInsight[] = []

    if (total === 0) {
        return { liked, skipped, insights }
    }

    // ─── 1. Padrão de rendimento no descarte ──────────────────────
    const skippedLowIncome = skipped.filter((p) => p.monthlyIncome < LOW_INCOME_THRESHOLD)
    const skippedLowIncomePercent = skipped.length
        ? Math.round((skippedLowIncome.length / skipped.length) * 100)
        : 0

    if (skipped.length > 0 && skippedLowIncomePercent >= 50) {
        insights.push({
            category: 'income',
            weight: 90,
            text: `Descartaste ${skipped.length} ${pluralize(skipped.length, 'pessoa', 'pessoas')}. ${skippedLowIncomePercent}% ${pluralize(skippedLowIncome.length, 'tinha', 'tinham')} rendimento abaixo de €${LOW_INCOME_THRESHOLD} — mais do que a maioria dos teus filtros admitiria.`,
        })
    } else if (skipped.length > 0 && skippedLowIncomePercent > 0) {
        insights.push({
            category: 'income',
            weight: 60,
            text: `Descartaste ${skipped.length} ${pluralize(skipped.length, 'pessoa', 'pessoas')}. ${skippedLowIncomePercent}% ${pluralize(skippedLowIncome.length, 'tinha', 'tinham')} rendimento abaixo de €${LOW_INCOME_THRESHOLD}.`,
        })
    }

    // ─── 2. Comparação de médias ───────────────────────────────────
    const avgIncomeLiked = liked.length
        ? Math.round(liked.reduce((sum, p) => sum + p.monthlyIncome, 0) / liked.length)
        : 0
    const avgIncomeSkipped = skipped.length
        ? Math.round(skipped.reduce((sum, p) => sum + p.monthlyIncome, 0) / skipped.length)
        : 0

    if (avgIncomeLiked > 0 && avgIncomeSkipped > 0) {
        const ratio = avgIncomeLiked / avgIncomeSkipped
        if (ratio >= 1.5) {
            insights.push({
                category: 'comparison',
                weight: 85,
                text: `O rendimento médio de quem investiste foi €${avgIncomeLiked.toLocaleString('pt-PT')}. De quem descartaste, €${avgIncomeSkipped.toLocaleString('pt-PT')} — ${ratio.toFixed(1)}× menos. Não escolheste pessoas. Escolheste uma faixa.`,
            })
        } else {
            insights.push({
                category: 'comparison',
                weight: 50,
                text: `O rendimento médio de quem investiste foi €${avgIncomeLiked.toLocaleString('pt-PT')}, contra €${avgIncomeSkipped.toLocaleString('pt-PT')} de quem descartaste.`,
            })
        }
    }

    // ─── 3. Educação alta descartada por rendimento ────────────────
    const highEducationLowIncome = skipped.filter(
        (p) => p.educationLevel >= HIGH_EDUCATION_THRESHOLD && p.monthlyIncome < LOW_INCOME_THRESHOLD
    )

    if (highEducationLowIncome.length > 0) {
        const names = firstNames(highEducationLowIncome)
        const plural = highEducationLowIncome.length > 1
        insights.push({
            category: 'education',
            weight: 75,
            text: `${names} ${plural ? 'tinham' : 'tinha'} formação de nível superior. Isso pesa 5% no cálculo. O rendimento pesa 45%. ${plural ? 'Foram' : 'Foi'} descartad${plural ? 'os' : 'o'} mesmo assim.`,
        })
    }

    // ─── 4. Aparência alta descartada por rendimento ───────────────
    const highAppearanceLowIncome = skipped.filter(
        (p) => p.appearanceScore >= HIGH_APPEARANCE_THRESHOLD && p.monthlyIncome < LOW_INCOME_THRESHOLD
    )

    if (highAppearanceLowIncome.length > 0) {
        const names = firstNames(highAppearanceLowIncome)
        const plural = highAppearanceLowIncome.length > 1
        insights.push({
            category: 'appearance',
            weight: 70,
            text: `Achaste ${names} suficientemente atraente${plural ? 's' : ''} para reparares ne${plural ? 'les' : 'le'}. O rendimento decidiu por ti de qualquer forma.`,
        })
    }

    // ─── 5. Perfil mais contraditório (generaliza o caso "Miguel") ─
    const contradictory = findMostContradictoryProfile(skipped)
    if (contradictory) {
        const firstName = contradictory.name.split(' ')[0]
        const isFeminine = ['a', 'ã'].includes(firstName.toLowerCase().slice(-1))
        const pronoun = isFeminine ? 'a' : 'o'
        insights.push({
            category: 'pattern',
            weight: 95,
            text: `${firstName} — ${contradictory.role.toLowerCase()} — ganha €${contradictory.monthlyIncome.toLocaleString('pt-PT')} por mês. ${contradictory.bio} Descartaste-${pronoun} em menos de um segundo.`,
        })
    }

    // ─── 6. Contexto com dados reais de investigação ───────────────
    if (skipped.length >= 3) {
        insights.push({
            category: 'pattern',
            weight: 40,
            text: `Não estás sozinho. Estudos sobre apps de dating mostram que mulheres com rendimentos altos recebem ${RESEARCH_BENCHMARKS.incomeMessageGap}% menos mensagens do que homens equivalentes, e que um carro de luxo visível no perfil triplica os matches. O Liqr só tornou esse padrão visível na tua sessão.`,
        })
    }

    // ─── 7. Encerramento reflexivo ──────────────────────────────────
    insights.push({
        category: 'closing',
        weight: 10, // sempre o último
        text: `O Liqr Score não inventou nada. Pesou o que já pesávamos — só que sem o admitir. A pergunta não é se concordas com os pesos. É se reconheces o resultado.`,
    })

    // Ordena por peso decrescente, mas mantém o "closing" sempre no fim
    const closing = insights.filter((i) => i.category === 'closing')
    const rest = insights
        .filter((i) => i.category !== 'closing')
        .sort((a, b) => b.weight - a.weight)

    return {
        liked,
        skipped,
        avgIncomeLiked,
        avgIncomeSkipped,
        skippedLowIncomePercent,
        insights: [...rest, ...closing],
    }
}