export type YearLegendItem = {
  label: string
  color: string
}

type HeatmapFeature = {
  properties?: Record<string, unknown>
}

type HeatmapCollection = {
  features?: HeatmapFeature[]
}

function toGrayHex(shade: number): string {
  const channel = Math.max(0, Math.min(255, Math.round(shade))).toString(16).padStart(2, '0')
  return `#${channel}${channel}${channel}`
}

function toRomanNumeral(value: number): string {
  const numerals: Array<[number, string]> = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]

  let remainder = Math.max(1, Math.floor(value))
  let result = ''

  for (const [arabic, roman] of numerals) {
    while (remainder >= arabic) {
      result += roman
      remainder -= arabic
    }
  }

  return result
}

function toCenturyLabel(year: number): string {
  const century = Math.max(1, Math.ceil(year / 100))
  return `sec. ${toRomanNumeral(century)}`
}

export function applyYearHeatmap(buildings: HeatmapCollection): YearLegendItem[] {
  if (!Array.isArray(buildings.features)) return []

  const years = buildings.features
    .map((feature) => feature.properties?.yearBuild)
    .filter((year): year is number => typeof year === 'number' && Number.isFinite(year))

  if (!years.length) return []

  const oldestYear = Math.min(...years)
  const newestYear = Math.max(...years)
  const lightestShade = 102
  const legendRatios = [0, 0.34, 0.67, 1]
  const legendRange = newestYear - oldestYear

  for (const feature of buildings.features) {
    if (!feature.properties) continue

    const yearBuild = feature.properties.yearBuild
    if (typeof yearBuild !== 'number' || !Number.isFinite(yearBuild)) {
      feature.properties.fillColor = toGrayHex(80)
      continue
    }

    const ratio = newestYear === oldestYear ? 0 : (yearBuild - oldestYear) / (newestYear - oldestYear)
    feature.properties.fillColor = toGrayHex(ratio * lightestShade)
  }

  return legendRatios.map((ratio) => {
    const year = legendRange === 0 ? oldestYear : Math.round(oldestYear + ratio * legendRange)
    return {
      label: toCenturyLabel(year),
      color: toGrayHex(ratio * lightestShade),
    }
  })
}