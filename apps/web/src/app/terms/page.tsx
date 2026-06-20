import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"

export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans overflow-x-hidden">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Agreement to Terms</h2>
            <p className="text-foreground/80 leading-relaxed">
              By accessing or using NovaCV, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you disagree with any part of the terms, then you do not have permission to access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Intellectual Property</h2>
            <p className="text-foreground/80 leading-relaxed">
              The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of NovaCV and its licensors. The Service is protected by copyright, trademark, and other laws of both the Country and foreign countries.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. User Content</h2>
            <p className="text-foreground/80 leading-relaxed">
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
            </p>
            <p className="text-foreground/80 leading-relaxed mt-2">
              By posting Content on or through the Service, You represent and warrant that: (i) the Content is yours (you own it) and/or you have the right to use it and the right to grant us the rights and licenses as provided in these Terms, and (ii) that the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person or entity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. API Keys and Third-Party Services</h2>
            <p className="text-foreground/80 leading-relaxed">
              NovaCV allows you to use your own API keys for third-party AI services. You are solely responsible for the usage and billing of these API keys. NovaCV is not responsible for any charges incurred on your third-party accounts due to the usage of our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Disclaimer</h2>
            <p className="text-foreground/80 leading-relaxed">
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
