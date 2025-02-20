<script setup lang="ts">
import archiveSeedBank from '@/assets/images/brands/Archive-Seed-Bank.png'
import dnaGenetics from '@/assets/images/brands/DNA-Genetics.png'
import exoticGenetix from '@/assets/images/brands/Exotic-Genetix.png'
import oldSchoolSeeds from '@/assets/images/brands/Old-School-Seeds.png'
import seedJunkyGenetics from '@/assets/images/brands/Seed-Junky-Genetics.png'
import thSeeds from '@/assets/images/brands/TH-Seeds.png'

interface Brand {
  name: string
  logo: string
  alt: string
}

const brands: Brand[] = [
  {
    name: "Archive Seed Bank",
    logo: archiveSeedBank,
    alt: "Archive Seed Bank logo"
  },
  {
    name: "DNA Genetics",
    logo: dnaGenetics,
    alt: "DNA Genetics logo"
  },
  {
    name: "Exotic Genetix",
    logo: exoticGenetix,
    alt: "Exotic Genetix logo"
  },
  {
    name: "Old School Seeds",
    logo: oldSchoolSeeds,
    alt: "Old School Seeds logo"
  },
  {
    name: "Seed Junky Genetics",
    logo: seedJunkyGenetics,
    alt: "Seed Junky Genetics logo"
  },
  {
    name: "TH Seeds",
    logo: thSeeds,
    alt: "TH Seeds logo"
  }
]
</script>

<template>
  <div class="bg-white py-10 md:py-24 border-y border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-5xl font-bold text-green-800 mb-4">Powering the World's Leading Cannabis Brands</h2>
        <p class="text-md md:text-xl text-gray-600 max-w-3xl mx-auto">
          Join the top cannabis brands who've already discovered the VueLeaf advantage
        </p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
        <div 
          v-for="brand in brands" 
          :key="brand.name" 
          class="bg-white rounded-lg shadow-md p-6 flex items-center justify-center transition-all duration-300 hover:shadow-lg"
        >
          <img
            :src="brand.logo"
            :alt="brand.alt"
            class="w-full h-12 object-contain"
            style="max-width: 160px"
          />
        </div>
      </div>
    </div>
  </div>
</template>
