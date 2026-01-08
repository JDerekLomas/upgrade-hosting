'use client';

import {
  Beaker,
  Shield,
  Users,
  BarChart3,
  Zap,
  Lock,
  ArrowRight,
  Check,
  GraduationCap,
  School,
  BookOpen,
  Brain,
  ChevronRight,
  Play,
  Github,
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <Demo />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Beaker className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">UpGrade Hosting</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
          <a href="#demo" className="text-sm text-gray-600 hover:text-gray-900">Demo</a>
          <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
          <a href="https://github.com/JDerekLomas/upgrade-hosting" className="text-sm text-gray-600 hover:text-gray-900">Docs</a>
        </div>

        <div className="flex items-center gap-3">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Log in</a>
          <a
            href="#pricing"
            className="px-4 py-2 text-sm font-medium text-white rounded-lg gradient-bg hover:opacity-90 transition-opacity"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-6">
            <Beaker className="w-4 h-4" />
            Built on Carnegie Learning's UpGrade
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            A/B Testing That{' '}
            <span className="gradient-text">Actually Measures Learning</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Generic A/B tools measure clicks. UpGrade measures whether students actually learned.
            The only experimentation platform built specifically for education.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#pricing"
              className="px-8 py-4 text-lg font-medium text-white rounded-xl gradient-bg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="https://upgrade-demo.vercel.app"
              target="_blank"
              className="px-8 py-4 text-lg font-medium text-gray-700 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </a>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            No credit card required. Free tier includes 10,000 API calls/month.
          </p>
        </div>

        {/* Hero Visual */}
        <div className="mt-16 relative">
          <div className="bg-gradient-to-b from-brand-50 to-white rounded-2xl p-8 border border-brand-100">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-4 text-xs text-gray-500">experiment-results.tsx</span>
              </div>
              <div className="p-6 grid md:grid-cols-3 gap-6">
                <ResultCard
                  label="Problem Completion"
                  value="+26%"
                  change="variant vs control"
                  positive
                />
                <ResultCard
                  label="Assessment Score"
                  value="-2%"
                  change="within guardrail"
                  neutral
                />
                <ResultCard
                  label="Statistical Significance"
                  value="99.2%"
                  change="ready to ship"
                  positive
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ label, value, change, positive, neutral }: {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
  neutral?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${
        positive ? 'text-green-600' : neutral ? 'text-amber-600' : 'text-gray-900'
      }`}>
        {value}
      </div>
      <div className="text-xs text-gray-400 mt-1">{change}</div>
    </div>
  );
}

function Problem() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Generic A/B Testing Fails in Education
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Optimizely and LaunchDarkly work great for e-commerce. But education is different.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProblemCard
            icon={<Users className="w-6 h-6" />}
            title="Classroom Contamination"
            description="Can't show half a class one version. Students talk. Teachers get confused."
          />
          <ProblemCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Wrong Metrics"
            description="Success isn't clicks or conversions. It's assessment scores measured weeks later."
          />
          <ProblemCard
            icon={<Shield className="w-6 h-6" />}
            title="Ethical Stakes"
            description="You can't harm learning. Need guardrails that auto-halt bad experiments."
          />
          <ProblemCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Research Rigor"
            description="Grants and publications require statistical standards generic tools don't provide."
          />
        </div>
      </div>
    </section>
  );
}

function ProblemCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function Solution() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              UpGrade: Built for How Learning Actually Works
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Carnegie Learning built UpGrade after years of running education research.
              We host it so you don't have to manage infrastructure.
            </p>

            <div className="space-y-4">
              <SolutionPoint
                title="Classroom-Level Assignment"
                description="Entire classes get the same condition. No contamination."
              />
              <SolutionPoint
                title="Learning Outcome Tracking"
                description="Connect experiment conditions to assessment scores, not just clicks."
              />
              <SolutionPoint
                title="Built-in Guardrails"
                description="Set thresholds. If learning drops, experiment pauses automatically."
              />
              <SolutionPoint
                title="Research-Grade Statistics"
                description="Significance tests, effect sizes, confidence intervals—ready for publication."
              />
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 text-sm font-mono">
            <div className="text-gray-500 mb-4">// Your EdTech app</div>
            <pre className="text-gray-300 overflow-x-auto">
{`const client = new UpgradeClient(
  studentId,
  'https://api.upgrade-hosting.com/v1'
);

// Classroom-aware initialization
await client.init({
  schoolId: 'lincoln-elementary',
  classId: 'math-301',
  teacherId: 'ms-rodriguez'
});

// Get assignment (whole class gets same)
const { condition } = await client
  .getDecisionPointAssignment(
    'math-practice',
    'hint-system'
  );

// Log learning outcome
client.log('assessment_score', 85);`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionPoint({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Check className="w-4 h-4" />
      </div>
      <div>
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Run Learning Experiments
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From SDK integration to results analysis, we've got you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="5-Minute Integration"
            description="Install the SDK, add your API key, and start experimenting. No infrastructure to manage."
          />
          <FeatureCard
            icon={<School className="w-6 h-6" />}
            title="Multi-Tenant Isolation"
            description="Each district gets isolated data. FERPA-compliant by design."
          />
          <FeatureCard
            icon={<Brain className="w-6 h-6" />}
            title="Smart Assignment"
            description="Assign at individual, classroom, or school level. Students stay consistent."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Automatic Guardrails"
            description="Set learning thresholds. Bad experiments stop before they hurt students."
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Real-Time Analytics"
            description="Watch results come in. Statistical significance calculated automatically."
          />
          <FeatureCard
            icon={<Lock className="w-6 h-6" />}
            title="API Key Auth"
            description="Simple authentication. Rate limiting included. Usage tracking built-in."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-brand-200 hover:shadow-lg transition-all">
      <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function Demo() {
  return (
    <section id="demo" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-brand-600 to-blue-700 rounded-3xl p-8 md:p-12 text-white">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                See It In Action
              </h2>
              <p className="text-lg text-brand-100 mb-6">
                Walk through a real experiment: progressive hints for math problems.
                See how Kiddom would use UpGrade to measure learning impact.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-brand-100">
                  <Check className="w-5 h-5 text-green-400" />
                  District-level tenant isolation
                </li>
                <li className="flex items-center gap-2 text-brand-100">
                  <Check className="w-5 h-5 text-green-400" />
                  Interactive math problem with hints
                </li>
                <li className="flex items-center gap-2 text-brand-100">
                  <Check className="w-5 h-5 text-green-400" />
                  Learning outcome metrics
                </li>
                <li className="flex items-center gap-2 text-brand-100">
                  <Check className="w-5 h-5 text-green-400" />
                  Guardrail verification
                </li>
              </ul>
              <a
                href="https://upgrade-demo.vercel.app"
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-600 font-medium rounded-xl hover:bg-brand-50 transition-colors"
              >
                <Play className="w-5 h-5" />
                Launch Interactive Demo
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <a
                  href="https://upgrade-demo.vercel.app"
                  target="_blank"
                  className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </a>
              </div>
              <div className="mt-4 text-center text-brand-200 text-sm">
                Interactive demo • No signup required
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start free. Scale as you grow. No surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PricingCard
            name="Free"
            price="$0"
            description="For trying things out"
            features={[
              '10,000 API calls/month',
              '3 experiments',
              '1 team member',
              'Community support',
            ]}
            cta="Get Started"
            ctaLink="#"
          />
          <PricingCard
            name="Starter"
            price="$29"
            description="For small teams"
            features={[
              '100,000 API calls/month',
              '10 experiments',
              '5 team members',
              'Email support',
            ]}
            cta="Start Trial"
            ctaLink="#"
          />
          <PricingCard
            name="Growth"
            price="$99"
            description="For growing products"
            features={[
              '1,000,000 API calls/month',
              '50 experiments',
              'Unlimited team members',
              'Priority support',
            ]}
            cta="Start Trial"
            ctaLink="#"
            highlighted
          />
          <PricingCard
            name="Enterprise"
            price="Custom"
            description="For large organizations"
            features={[
              'Unlimited API calls',
              'Unlimited experiments',
              'SSO/SAML',
              'Dedicated support',
              'Custom SLA',
            ]}
            cta="Contact Sales"
            ctaLink="#"
          />
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  ctaLink,
  highlighted,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-6 ${
      highlighted
        ? 'bg-brand-600 text-white ring-4 ring-brand-200'
        : 'bg-white border border-gray-200'
    }`}>
      <div className="mb-4">
        <div className={`text-sm font-medium ${highlighted ? 'text-brand-200' : 'text-gray-500'}`}>
          {name}
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-gray-900'}`}>
            {price}
          </span>
          {price !== 'Custom' && (
            <span className={highlighted ? 'text-brand-200' : 'text-gray-500'}>/month</span>
          )}
        </div>
        <div className={`text-sm mt-1 ${highlighted ? 'text-brand-200' : 'text-gray-500'}`}>
          {description}
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
              highlighted ? 'text-brand-200' : 'text-green-500'
            }`} />
            <span className={highlighted ? 'text-white' : 'text-gray-600'}>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={ctaLink}
        className={`block w-full py-2.5 text-center text-sm font-medium rounded-lg transition-colors ${
          highlighted
            ? 'bg-white text-brand-600 hover:bg-brand-50'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {cta}
      </a>
    </div>
  );
}

function CTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Ready to Run Real Learning Experiments?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Join EdTech companies using UpGrade to make data-driven decisions about student learning.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#pricing"
            className="px-8 py-4 text-lg font-medium text-white rounded-xl gradient-bg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/JDerekLomas/upgrade-hosting"
            target="_blank"
            className="px-8 py-4 text-lg font-medium text-gray-700 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Github className="w-5 h-5" />
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-4 bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Beaker className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">UpGrade Hosting</span>
            </div>
            <p className="text-sm">
              Hosted A/B testing platform for EdTech, built on Carnegie Learning's UpGrade.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><a href="https://upgrade-demo.vercel.app" className="hover:text-white">Demo</a></li>
              <li><a href="#" className="hover:text-white">Documentation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://github.com/JDerekLomas/upgrade-hosting" className="hover:text-white">GitHub</a></li>
              <li><a href="https://github.com/CarnegieLearningWeb/UpGrade" className="hover:text-white">UpGrade Core</a></li>
              <li><a href="https://upgrade-platform.gitbook.io/docs/" className="hover:text-white">UpGrade Docs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Privacy</a></li>
              <li><a href="#" className="hover:text-white">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} UpGrade Hosting. Built on Carnegie Learning's UpGrade.</p>
        </div>
      </div>
    </footer>
  );
}
