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
              Privacy Policy
            </h1>
            <p class="text-gray-600 text-lg">
              Last updated: February 10, 2025
            </p>
          </div>
        </div>
      </div>

      <!-- Privacy Policy Content -->
      <div class="space-y-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">Introduction</h2>
          <p class="text-gray-600 mb-6">
            VueLeaf ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our cannabis brand reputation management platform.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">Information We Collect</h2>
          
          <h3 class="text-lg font-semibold text-green-700 mb-2">Information You Provide</h3>
          <ul class="list-disc list-inside text-gray-600 mb-4">
            <li>Account information (name, email address)</li>
            <li>Business information (brand details)</li>
            <li>User-generated content (feedback, comments, settings preferences)</li>
            <li>Files and attachments you upload to our platform</li>
          </ul>

          <h3 class="text-lg font-semibold text-green-700 mb-2">Information We Automatically Collect</h3>
          <ul class="list-disc list-inside text-gray-600">
            <li>Log data (IP address, browser type, pages visited)</li>
            <li>Usage data (feature interaction, time spent on platform)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">How We Use Your Information</h2>
          <ul class="list-disc list-inside text-gray-600">
            <li>Provide and maintain our services</li>
            <li>Monitor and analyze brand mentions across various platforms</li>
            <li>Generate sentiment analysis and brand reputation reports</li>
            <li>Send notifications and updates about your brand</li>
            <li>Improve our platform and user experience</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">Data Storage and Security</h2>
          <p class="text-gray-600 mb-4">We implement appropriate technical and organizational security measures to protect your information, including:</p>
          <ul class="list-disc list-inside text-gray-600">
            <li>Encryption of sensitive data</li>
            <li>Secure database backups</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication requirements</li>
            <li>Monitoring for unauthorized access attempts</li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">Information Sharing</h2>
          <p class="text-gray-600 mb-4">We do not sell your personal information. We may share your information with:</p>
          <ul class="list-disc list-inside text-gray-600">
            <li>Service providers who assist in operating our platform</li>
            <li>Third-party analytics providers</li>
            <li>Law enforcement when required by law</li>
            <li>Other parties with your explicit consent</li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">Your Rights</h2>
          <p class="text-gray-600 mb-4">You have the right to:</p>
          <ul class="list-disc list-inside text-gray-600">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of certain data collection</li>
            <li>Export your data</li>
            <li>Withdraw consent for data processing</li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">Data Retention</h2>
          <p class="text-gray-600">We retain your information for as long as:</p>
          <ul class="list-disc list-inside text-gray-600">
            <li>Your account is active</li>
            <li>Needed to provide our services</li>
            <li>Required by law</li>
            <li>Necessary for legitimate business purposes</li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">Third-Party Services</h2>
          <p class="text-gray-600 mb-4">Our platform integrates with various third-party services. Their use of your information is governed by their respective privacy policies. We recommend reviewing these policies for services such as:</p>
          <ul class="list-disc list-inside text-gray-600">
            <li>Forum platforms we monitor</li>
            <li>Analytics services</li>
            <li>Payment processors (if applicable)</li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">Contact Us</h2>
          <p class="text-gray-600">If you have questions about this Privacy Policy or our privacy practices, please contact us at:</p>
          <p class="text-gray-600 mt-4">
            Email: privacy@vueleaf.com<br>
            Address: [Your Business Address]
          </p>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>