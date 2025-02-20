<script setup lang="ts">
// Following vueleaf-standards.md component structure
import Navigation from '../components/home/Navigation.vue'
import Footer from '../components/home/Footer.vue'
</script>

<template>
  <Navigation />
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-bold text-green-800 mb-2">
              Terms of Service
            </h1>
            <p class="text-gray-600 text-lg">
              Last updated: February 10, 2025
            </p>
          </div>
        </div>
      </div>

      <!-- Terms of Service Content -->
      <div class="space-y-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">1. Agreement to Terms</h2>
          <p class="text-gray-600">
            By accessing and using VueLeaf's cannabis brand reputation management platform ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">2. Description of Service</h2>
          <p class="text-gray-600">
            VueLeaf provides a platform for monitoring and managing cannabis brand reputation across various online forums and communities. Our services include brand mention tracking, sentiment analysis, analytics, and reporting tools.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">3. Account Registration</h2>
          <p class="text-gray-600 mb-4">To use VueLeaf, you must:</p>
          <ul class="list-disc list-inside text-gray-600">
            <li>Be at least 18 years old</li>
            <li>Register for an account with valid and accurate information</li>
            <li>Be legally permitted to operate in the cannabis industry</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">4. User Responsibilities</h2>
          <p class="text-gray-600 mb-4">You agree to:</p>
          <ul class="list-disc list-inside text-gray-600">
            <li>Use the Service in compliance with all applicable laws and regulations</li>
            <li>Not attempt to circumvent any access restrictions or security measures</li>
            <li>Not use the Service for any illegal or unauthorized purpose</li>
            <li>Not interfere with or disrupt the Service or servers</li>
            <li>Not collect or harvest any information from the Service without authorization</li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">5. Content and Data</h2>
          
          <h3 class="text-lg font-semibold text-green-700 mb-2">5.1 Your Content</h3>
          <p class="text-gray-600 mb-4">
            You retain ownership of any content you provide to the Service. By using VueLeaf, you grant us a license to use, store, and analyze this content to provide and improve our services.
          </p>

          <h3 class="text-lg font-semibold text-green-700 mb-2">5.2 Platform Content</h3>
          <p class="text-gray-600">
            The Service and its original content (excluding user-provided content) remain the property of VueLeaf. You may not duplicate, copy, or reuse any portion of our code, visual design elements, or concepts without express written permission.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">6. Service Availability and Updates</h2>
          <p class="text-gray-600 mb-4">We strive to provide uninterrupted service but may occasionally:</p>
          <ul class="list-disc list-inside text-gray-600">
            <li>Perform maintenance or updates</li>
            <li>Modify or discontinue features</li>
            <li>Experience temporary service interruptions</li>
          </ul>
          <p class="text-gray-600 mt-4">
            We will make reasonable efforts to notify you of any significant changes or interruptions.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">7. Payment Terms</h2>
          
          <h3 class="text-lg font-semibold text-green-700 mb-2">7.1 Subscription Fees</h3>
          <ul class="list-disc list-inside text-gray-600 mb-4">
            <li>Fees are based on your selected subscription plan</li>
            <li>All fees are exclusive of taxes</li>
            <li>Payments are non-refundable unless required by law</li>
            <li>Subscription fees are charged in advance</li>
          </ul>

          <h3 class="text-lg font-semibold text-green-700 mb-2">7.2 Changes to Fees</h3>
          <p class="text-gray-600">
            We reserve the right to modify our fees upon notice. Continued use of the Service after a fee change constitutes acceptance of the new fees.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">8. Termination</h2>
          
          <h3 class="text-lg font-semibold text-green-700 mb-2">8.1 Account Termination</h3>
          <p class="text-gray-600 mb-4">We may suspend or terminate your account if you:</p>
          <ul class="list-disc list-inside text-gray-600 mb-4">
            <li>Violate these Terms</li>
            <li>Engage in fraudulent or illegal activities</li>
            <li>Fail to pay applicable fees</li>
            <li>Misuse the Service</li>
          </ul>

          <h3 class="text-lg font-semibold text-green-700 mb-2">8.2 Effect of Termination</h3>
          <p class="text-gray-600 mb-4">Upon termination:</p>
          <ul class="list-disc list-inside text-gray-600">
            <li>Access to the Service will cease</li>
            <li>You remain responsible for any outstanding fees</li>
            <li>We will retain your data as required by law</li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">9. Disclaimer of Warranties</h2>
          <p class="text-gray-600">
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">10. Limitation of Liability</h2>
          <p class="text-gray-600">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, VUELEAF SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">11. Indemnification</h2>
          <p class="text-gray-600">You agree to indemnify and hold harmless VueLeaf and its employees, directors, and agents from any claims arising from:</p>
          <ul class="list-disc list-inside text-gray-600">
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">12. Third-Party Services</h2>
          <p class="text-gray-600">
            The Service may integrate with or link to third-party services. We are not responsible for any third-party content, services, or practices.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">13. Cannabis Industry Compliance</h2>
          
          <h3 class="text-lg font-semibold text-green-700 mb-2">13.1 Legal Compliance</h3>
          <p class="text-gray-600 mb-4">
            You are solely responsible for ensuring your use of VueLeaf complies with all applicable cannabis industry laws and regulations in your jurisdiction.
          </p>

          <h3 class="text-lg font-semibold text-green-700 mb-2">13.2 No Legal Advice</h3>
          <p class="text-gray-600">
            VueLeaf does not provide legal advice. Consult qualified legal counsel regarding your compliance obligations.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">14. Changes to Terms</h2>
          <p class="text-gray-600 mb-4">We reserve the right to modify these Terms at any time. We will notify you of any material changes through:</p>
          <ul class="list-disc list-inside text-gray-600">
            <li>Email notification</li>
            <li>Platform announcement</li>
            <li>Updated "Last updated" date</li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">15. Governing Law</h2>
          <p class="text-gray-600">
            These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">16. Dispute Resolution</h2>
          <p class="text-gray-600 mb-4">Any disputes arising from these Terms or the Service shall be resolved through:</p>
          <ol class="list-decimal list-inside text-gray-600">
            <li>Informal negotiation</li>
            <li>Mediation (if negotiation fails)</li>
            <li>Binding arbitration (if mediation fails)</li>
          </ol>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">17. Severability</h2>
          <p class="text-gray-600">
            If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in effect.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">18. Contact Information</h2>
          <p class="text-gray-600">For questions about these Terms, please contact us at:</p>
          <p class="text-gray-600 mt-4">
            Email: legal@vueleaf.com<br>
            Address: [Your Business Address]
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">19. Entire Agreement</h2>
          <p class="text-gray-600">
            These Terms constitute the entire agreement between you and VueLeaf regarding the Service, superseding any prior agreements.
          </p>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>