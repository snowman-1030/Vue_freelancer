<script setup lang="ts">
// UI Components
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navigation from '@/components/home/Navigation.vue'
import Footer from '@/components/home/Footer.vue'
import { Lightbulb, Shield, Sprout, Users } from 'lucide-vue-next'

// Team Images
import alexImage from '../assets/images/illustrations/alex.jpg'
import davidImage from '../assets/images/illustrations/david.jpg'
import marcusImage from '../assets/images/illustrations/marcus.jpg'
import emilyImage from '../assets/images/illustrations/emily.jpg'

const team = [
  {
    name: "Alex Thompson",
    role: "Founder & CEO",
    image: alexImage,
    bio: "Alex leads VueLeaf's vision and strategy, bringing over a decade of experience in software development and digital marketing. His passion for innovation in the cannabis industry drove him to create VueLeaf.",
    expertise: ["Business Strategy", "Product Vision", "Tech Leadership"],
    badgeColor: "!bg-green-100 !text-green-800",
  },
  {
    name: "David Chen",
    role: "Chief Technology Officer",
    image: davidImage,
    bio: "David oversees VueLeaf's technical architecture and development. With a background in distributed systems and AI, he ensures our platform stays at the cutting edge of technology.",
    expertise: ["Software Architecture", "AI/ML", "Cloud Infrastructure"],
    badgeColor: "bg-yellow-100 text-yellow-800",
  },
  {
    name: "Marcus Williams",
    role: "Head of Product",
    image: marcusImage,
    bio: "Marcus brings his expertise in user experience and product development to shape VueLeaf's features and functionality. His focus on user-centered design helps make our platform intuitive and effective.",
    expertise: ["Product Strategy", "UX Design", "Market Research"],
    badgeColor: "!bg-blue-100 !text-blue-800",
  },
  {
    name: "Emily Zhang",
    role: "Head of Data Science",
    image: emilyImage,
    bio: "Emily leads our data science initiatives, developing the advanced analytics and sentiment analysis capabilities that power VueLeaf's insights. Her work in NLP helps brands understand their market position.",
    expertise: ["Machine Learning", "NLP", "Data Analytics"],
    badgeColor: "bg-rose-100 text-rose-800",
  },
]

const values = [
  {
    title: "Innovation",
    description:
      "We pioneer advanced data analytics and AI solutions to unlock deeper insights for cannabis brands, pushing the boundaries of what's possible in brand reputation management.",
    icon: Lightbulb,
  },
  {
    title: "Integrity",
    description:
      "We uphold the highest standards of transparency, data security, and ethical practices. Your trust is our foundation, and we protect it with unwavering commitment.",
    icon: Shield,
  },
  {
    title: "Empowerment",
    description:
      "We equip cannabis brands with real-time intelligence and actionable insights, transforming data into strategic advantages that drive growth and success.",
    icon: Sprout,
  },
  {
    title: "Community",
    description:
      "We champion collaboration and inclusivity in the cannabis industry, building bridges between brands and their communities while fostering meaningful conversations that shape the future of cannabis.",
    icon: Users,
  },
]
</script>

<template>
  <div>
    <Navigation />
    <div class="min-h-screen bg-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <!-- CEO Welcome Message -->
        <Card class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-8 mb-12 border border-gray-100">
          <div class="flex items-center mb-6">
            <img
              :src="team[0].image"
              :alt="team[0].name"
              class="w-16 h-16 rounded-full mr-4 object-cover"
            />
            <div>
              <h2 class="text-2xl font-semibold text-green-800">A Word from Our CEO</h2>
              <p class="text-gray-600">Alex Thompson, Founder & CEO</p>
            </div>
          </div>
          <div class="space-y-4 text-gray-600 text-lg">
            <p>
              Welcome to VueLeaf! We're on a mission to revolutionize how cannabis brands thrive in the digital age. Our
              journey began with a simple idea: harness the power of data to elevate the cannabis industry. At VueLeaf,
              we're not just another analytics company. We're your growth partners, dedicated to turning complex data
              into your competitive edge.
            </p>
            <p>
              Our cutting-edge tools provide real-time insights into your brand's reputation, market trends, and
              customer sentiments. In this dynamic industry, every mention, review, and insight shapes your success.
              That's why we're committed to helping you protect your reputation, amplify your voice, and grow your
              presence. With VueLeaf, you're always a step ahead, ready to seize opportunities and navigate challenges.
            </p>
            <p>
              Join us as we cultivate a data-driven future for cannabis. Together, we're not just adapting to the future
              – we're shaping it. Let's grow your brand's story, one insight at a time. With VueLeaf by your side,
              you'll have the tools and insights needed to make informed decisions, build lasting customer
              relationships, and thrive in this exciting market. We're more than just a service; we're your partners in
              growth, committed to your success every step of the way.
            </p>
          </div>
        </Card>

        <!-- Team Section -->
        <Card class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-8 mb-12 border border-gray-100">
          <h2 class="text-3xl font-semibold text-green-800 text-center mb-6">Meet Our Team</h2>
          <p class="text-gray-600 text-lg mb-8">
            At VueLeaf, we're on a mission to revolutionize the cannabis industry through the power of data. We're not
            just number crunchers – we're your growth partners, providing the insights you need to make smart decisions,
            build lasting customer relationships, and thrive in this exciting market. Together, we're cultivating a
            data-driven future for cannabis.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="member in team"
              :key="member.name"
              class="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              <div class="relative w-full pt-[100%]">
                <img
                  :src="member.image"
                  :alt="member.name"
                  class="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
              <div class="p-5 flex flex-col flex-grow">
                <h3 class="text-lg font-semibold text-green-800 mb-1">{{ member.name }}</h3>
                <p class="text-green-700 font-medium text-sm mb-3">{{ member.role }}</p>
                <p class="text-gray-600 text-base mb-4 flex-grow">{{ member.bio }}</p>
                <div>
                  <div class="flex flex-col space-y-2">
                    <Badge
                      v-for="(skill, index) in member.expertise"
                      :key="index"
                      :variant="null"
                      :class="`inline-flex items-center rounded-md w-full text-center py-1.5 text-sm border-transparent ${member.badgeColor}`"
                    >
                      {{ skill }}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Values Section -->
        <Card class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-8 mb-12 border border-gray-100">
          <h2 class="text-3xl font-semibold text-green-800 mb-6 text-center">Our Values</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="(value, index) in values"
              :key="index"
              class="bg-green-50 rounded-lg p-6 border border-green-100 flex items-start"
            >
              <component :is="value.icon" class="w-8 h-8 text-green-600 mr-4 flex-shrink-0" />
              <div>
                <h3 class="text-xl font-semibold text-green-800 mb-2">{{ value.title }}</h3>
                <p class="text-gray-600">{{ value.description }}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    <Footer />
  </div>
</template>