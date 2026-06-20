import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans overflow-x-hidden">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: 20 June 2026</p>

        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-foreground/80 leading-relaxed">
              Welcome to NovaCV. We respect your privacy and are committed to protecting your personal data. This Privacy Policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Data We Collect</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 text-foreground/80">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes email address.</li>
              <li><strong>Resume Data:</strong> includes employment history, education, skills, and any other information you provide in your resumes.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Data</h2>
            <p className="text-foreground/80 leading-relaxed">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 text-foreground/80">
              <li>To provide and maintain our Service, including to monitor the usage of our Service.</li>
              <li>To manage Your Account: to manage Your registration as a user of the Service.</li>
              <li>For the performance of a contract: the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.</li>
              <li>To provide AI features: Your data may be temporarily sent to selected AI providers (e.g. OpenAI) to generate resume content if you use the AI features. We do not use your data to train our own models.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
            <p className="text-foreground/80 leading-relaxed">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. API keys are strictly saved in your browser's local storage and are never transmitted to our database.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Contact Us</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have any questions about this Privacy Policy, You can contact us by visiting our repository on GitHub or by contacting the maintainer.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
