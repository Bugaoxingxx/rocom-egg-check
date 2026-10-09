import sourceData from '../../data/pets.json'

const initialForms = sourceData.pets.filter((pet) => pet.stage === 1)
const eggGroups = [...new Set(initialForms.flatMap((pet) => pet.egg_groups ?? []))]

function matchesAny(values, selected) {
  return selected.length === 0 || values.some((value) => selected.includes(value))
}

function isNumber(value) {
  return /^\d+$/.test(value)
}

export const DevEggData = {
  async getEggGroups() {
    return eggGroups
  },

  async query(filter) {
    let keyword = filter.keyword.trim()
    const numericKeyword = isNumber(keyword)
    if (numericKeyword && keyword.length < 3) keyword = keyword.padStart(3, '0')
    const minTier = Math.max(1, filter.minTier || 1)
    const maxTier = Math.min(10, filter.maxTier || 10)

    return initialForms.filter((pet) => {
      const tier = pet.egg_weight.tier
      if (tier < minTier || tier > maxTier) return false
      if (keyword) {
        if (numericKeyword ? pet.number !== keyword : !pet.name.toLocaleLowerCase().includes(keyword.toLocaleLowerCase())) return false
      }
      if (!matchesAny(pet.egg_groups ?? [], filter.eggGroups ?? [])) return false
      if (!matchesAny(pet.attributes ?? [], filter.attributes ?? [])) return false
      return true
    })
  },
}
