'use client';

import { useState } from 'react';
import {
  Beaker,
  GraduationCap,
  Users,
  Building2,
  Lightbulb,
  ArrowRight,
  Check,
  ChevronDown,
  Play,
  Github,
  ExternalLink,
  Sparkles,
  Target,
  BarChart3,
  Shield,
  Zap,
  School,
  BookOpen,
  FlaskConical,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ValueProp />
      <Quiz />
      <HowItWorks />
      <Benefits />
      <Features />
      <Demo />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

function Navbar() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[#0047CC] flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">UpGrade</span>
          </a>

          <div className="hidden md:flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setAboutOpen(!aboutOpen)}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium"
              >
                About UpGrade
                <ChevronDown className={`w-4 h-4 transition-transform ${aboutOpen ? 'rotate-180' : ''}`} />
              </button>
              {aboutOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                  <a href="#how-it-works" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0047CC]">
                    How It Works
                  </a>
                  <a href="#features" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0047CC]">
                    Features
                  </a>
                  <a href="#pricing" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0047CC]">
                    Pricing
                  </a>
                </div>
              )}
            </div>
            <a href="#demo" className="text-gray-600 hover:text-gray-900 font-medium">Demo</a>
            <a href="https://github.com/JDerekLomas/upgrade-hosting" className="text-gray-600 hover:text-gray-900 font-medium">
              Resources
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Log in</a>
          <a
            href="#pricing"
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg bg-[#0047CC] hover:bg-[#003399] transition-colors"
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
    <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 opacity-10">
        <svg viewBox="0 0 100 100" className="text-[#0047CC]">
          <path d="M10 10 L90 10 M10 30 L90 30 M10 50 L90 50" stroke="currentColor" strokeWidth="8" />
        </svg>
      </div>
      <div className="absolute bottom-20 right-10 w-32 h-32 opacity-10">
        <svg viewBox="0 0 100 100" className="text-[#0047CC]">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="20 10" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-200 text-[#0047CC] text-sm font-medium mb-8 shadow-sm">
          <Sparkles className="w-4 h-4" />
          Open Source • Evidence-Based • Built for Education
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
          KNOW WHAT WORKS
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          UpGrade is the only open-source evidence-based testing platform that uncovers
          the most effective learning experiences.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href="#pricing"
            className="px-8 py-4 text-lg font-semibold text-white rounded-xl bg-[#0047CC] hover:bg-[#003399] transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            Start Free
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="#quiz"
            className="px-8 py-4 text-lg font-semibold text-[#0047CC] rounded-xl border-2 border-[#0047CC] hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            Take the Quiz
          </a>
        </div>

        <p className="text-sm text-gray-500">
          Funded by the Bill & Melinda Gates Foundation and Schmidt Futures
        </p>
      </div>

      {/* Hero image mockup */}
      <div className="max-w-4xl mx-auto mt-16 relative">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-4 text-sm text-gray-500">UpGrade Experiment Dashboard</span>
          </div>
          <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
            <div className="grid md:grid-cols-3 gap-6">
              <MetricCard
                label="Students Enrolled"
                value="12,847"
                change="+2,341 this week"
              />
              <MetricCard
                label="Learning Gain (Effect Size)"
                value="d = 0.34"
                change="Statistically significant"
                positive
              />
              <MetricCard
                label="Experiment Status"
                value="Ready to Ship"
                change="99.2% confidence"
                positive
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, change, positive }: {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${positive ? 'text-green-600' : 'text-gray-900'}`}>
        {value}
      </div>
      <div className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-gray-400'}`}>{change}</div>
    </div>
  );
}

function ValueProp() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-gray-900 rounded-2xl p-1 shadow-2xl">
              <div className="bg-gray-800 rounded-xl p-6">
                <img
                  src="/api/placeholder/600/400"
                  alt="UpGrade dashboard showing experiment results"
                  className="rounded-lg w-full"
                />
                <div className="mt-4 text-center text-gray-400 text-sm">
                  Real-time experiment monitoring
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              ITERATE ON<br />WHAT WORKS
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Test different learning experiences at scale. See real impact on student outcomes.
              Ship the version that actually helps students learn.
            </p>
            <div className="space-y-4">
              <ValuePoint text="Run A/B tests at individual, classroom, or district level" />
              <ValuePoint text="Measure learning outcomes, not just engagement metrics" />
              <ValuePoint text="Built-in guardrails protect students from harmful experiences" />
              <ValuePoint text="Research-grade statistics ready for publication" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValuePoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Check className="w-4 h-4 text-green-600" />
      </div>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}

function Quiz() {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const correct = 'immediate';

  return (
    <section id="quiz" className="py-20 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0047CC] text-white text-sm font-semibold mb-4">
            <Target className="w-4 h-4" />
            QUIZ TIME
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            What's your hypothesis?
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <p className="text-lg text-gray-700 mb-6 font-medium">
            When students get an answer wrong, which approach improves learning outcomes more?
          </p>

          <div className="space-y-3 mb-8">
            <QuizOption
              label="Immediate feedback"
              description="Show correct answer right away with explanation"
              value="immediate"
              selected={selected}
              correct={revealed ? correct : undefined}
              onSelect={setSelected}
              disabled={revealed}
            />
            <QuizOption
              label="Delayed feedback"
              description="Show all feedback at end of practice session"
              value="delayed"
              selected={selected}
              correct={revealed ? correct : undefined}
              onSelect={setSelected}
              disabled={revealed}
            />
          </div>

          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              disabled={!selected}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-[#0047CC] hover:bg-[#003399] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reveal Answer
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-green-800 mb-2">
                    Research shows: Immediate feedback wins
                  </div>
                  <p className="text-sm text-green-700">
                    A study across 23,000 students using UpGrade found that immediate corrective
                    feedback increased problem completion rates by 26% while maintaining assessment
                    scores. This is the kind of evidence-based decision UpGrade enables.
                  </p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-sm text-[#0047CC] font-medium mt-3 hover:underline"
                  >
                    Read the research
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function QuizOption({
  label,
  description,
  value,
  selected,
  correct,
  onSelect,
  disabled,
}: {
  label: string;
  description: string;
  value: string;
  selected: string | null;
  correct?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}) {
  const isSelected = selected === value;
  const isCorrect = correct === value;
  const showResult = correct !== undefined;

  return (
    <button
      onClick={() => onSelect(value)}
      disabled={disabled}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        showResult
          ? isCorrect
            ? 'border-green-500 bg-green-50'
            : isSelected
            ? 'border-red-300 bg-red-50'
            : 'border-gray-200'
          : isSelected
          ? 'border-[#0047CC] bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          showResult
            ? isCorrect
              ? 'border-green-500 bg-green-500'
              : isSelected
              ? 'border-red-400'
              : 'border-gray-300'
            : isSelected
            ? 'border-[#0047CC] bg-[#0047CC]'
            : 'border-gray-300'
        }`}>
          {(isSelected || (showResult && isCorrect)) && (
            <div className="w-2 h-2 rounded-full bg-white" />
          )}
        </div>
        <div>
          <div className="font-medium text-gray-900">{label}</div>
          <div className="text-sm text-gray-500">{description}</div>
        </div>
      </div>
    </button>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            HOW IT WORKS
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From hypothesis to evidence-based decisions in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          <Step
            number={1}
            icon={<Target className="w-6 h-6" />}
            title="Design Experiment"
            description="Create your hypothesis and define the variations you want to test"
          />
          <Step
            number={2}
            icon={<Users className="w-6 h-6" />}
            title="Assign Students"
            description="Students are assigned at individual, class, or school level"
          />
          <Step
            number={3}
            icon={<BarChart3 className="w-6 h-6" />}
            title="Analyze Results"
            description="Track learning outcomes with research-grade statistics"
          />
          <Step
            number={4}
            icon={<Zap className="w-6 h-6" />}
            title="Ship Winner"
            description="Deploy the most effective experience to all students"
          />
        </div>
      </div>
    </section>
  );
}

function Step({ number, icon, title, description }: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      {number < 4 && (
        <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 -translate-x-1/2" />
      )}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0047CC] text-white flex items-center justify-center mx-auto mb-4 relative">
          {icon}
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-[#0047CC] text-[#0047CC] text-xs font-bold flex items-center justify-center">
            {number}
          </div>
        </div>
        <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function Benefits() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            WHO BENEFITS
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            UpGrade creates value for everyone in the education ecosystem
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BenefitCard
            icon={<GraduationCap className="w-8 h-8" />}
            title="Students & Parents"
            description="Receive learning experiences that are proven to work, not just assumed to be effective"
            color="blue"
          />
          <BenefitCard
            icon={<BookOpen className="w-8 h-8" />}
            title="Educators"
            description="Use teaching methods backed by real evidence from your own students"
            color="green"
          />
          <BenefitCard
            icon={<Building2 className="w-8 h-8" />}
            title="EdTech Teams"
            description="Ship features faster with confidence. Stop guessing, start knowing"
            color="purple"
          />
          <BenefitCard
            icon={<Lightbulb className="w-8 h-8" />}
            title="Learning Scientists"
            description="Advance educational equity with research-grade experiments at scale"
            color="orange"
          />
        </div>
      </div>
    </section>
  );
}

function BenefitCard({ icon, title, description, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className={`w-16 h-16 rounded-xl ${colors[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            FEATURES
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to run rigorous learning experiments
          </p>
        </div>

        <div className="space-y-16">
          <FeatureRow
            title="Visual Experiment Builder"
            description="Design experiments without writing code. Define variants, set allocation percentages, and configure assignment rules through an intuitive interface."
            bullets={[
              'Drag-and-drop experiment design',
              'Multiple decision points per experiment',
              'Stratified randomization options',
            ]}
            imageOnLeft
          />

          <FeatureRow
            title="Classroom-Level Assignment"
            description="Prevent contamination by assigning at the level that makes sense—individual students, entire classrooms, schools, or districts."
            bullets={[
              'Hierarchical assignment units',
              'Students stay in same condition',
              'Teachers see consistent experience',
            ]}
            imageOnLeft={false}
          />

          <FeatureRow
            title="Built-in Guardrails"
            description="Protect students with automatic safeguards. Set thresholds for key metrics and experiments pause automatically if learning outcomes drop."
            bullets={[
              'Define minimum acceptable thresholds',
              'Real-time monitoring',
              'Automatic pause on guardrail breach',
            ]}
            imageOnLeft
          />
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ title, description, bullets, imageOnLeft }: {
  title: string;
  description: string;
  bullets: string[];
  imageOnLeft: boolean;
}) {
  return (
    <div className={`grid lg:grid-cols-2 gap-12 items-center ${imageOnLeft ? '' : 'lg:flex-row-reverse'}`}>
      <div className={imageOnLeft ? 'order-1' : 'order-1 lg:order-2'}>
        <div className="bg-gray-100 rounded-2xl aspect-video flex items-center justify-center">
          <div className="text-gray-400 text-sm">Feature screenshot</div>
        </div>
      </div>
      <div className={imageOnLeft ? 'order-2' : 'order-2 lg:order-1'}>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        <ul className="space-y-3">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#0047CC] flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Demo() {
  return (
    <section id="demo" className="py-20 px-4 bg-[#0047CC]">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
              SEE IT IN ACTION
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Walk through a real experiment: testing progressive hints for math problems.
              See how districts like LAUSD and Chicago Public Schools would use UpGrade.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'District-level tenant isolation',
                'Interactive math problem with hints',
                'Learning outcome metrics',
                'Guardrail verification',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-blue-100">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://upgrade-demo.vercel.app"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0047CC] font-semibold rounded-xl hover:bg-blue-50 transition-colors"
            >
              <Play className="w-5 h-5" />
              Launch Interactive Demo
            </a>
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-2 border border-white/20">
              <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center">
                <a
                  href="https://upgrade-demo.vercel.app"
                  target="_blank"
                  className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center group"
                >
                  <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
            <div className="text-center mt-4 text-blue-200 text-sm">
              No signup required
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            SIMPLE PRICING
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start free. Scale as you grow. No surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
            name="Growth"
            price="$299"
            description="For growing products"
            features={[
              '1,000,000 API calls/month',
              'Unlimited experiments',
              'Unlimited team members',
              'Priority support',
              'SSO authentication',
            ]}
            cta="Start Free Trial"
            ctaLink="#"
            highlighted
          />
          <PricingCard
            name="Enterprise"
            price="Custom"
            description="For large organizations"
            features={[
              'Unlimited everything',
              'Dedicated infrastructure',
              'Custom SLA',
              'On-premise option',
              'Dedicated support',
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
    <div className={`rounded-2xl p-8 ${
      highlighted
        ? 'bg-[#0047CC] text-white ring-4 ring-blue-200 scale-105'
        : 'bg-white border border-gray-200'
    }`}>
      <div className="mb-6">
        <div className={`text-sm font-semibold uppercase tracking-wide ${highlighted ? 'text-blue-200' : 'text-gray-500'}`}>
          {name}
        </div>
        <div className="flex items-baseline gap-1 mt-2">
          <span className={`text-5xl font-extrabold ${highlighted ? 'text-white' : 'text-gray-900'}`}>
            {price}
          </span>
          {price !== 'Custom' && (
            <span className={highlighted ? 'text-blue-200' : 'text-gray-500'}>/month</span>
          )}
        </div>
        <div className={`text-sm mt-2 ${highlighted ? 'text-blue-200' : 'text-gray-500'}`}>
          {description}
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className={`w-5 h-5 flex-shrink-0 ${
              highlighted ? 'text-blue-200' : 'text-green-500'
            }`} />
            <span className={`text-sm ${highlighted ? 'text-white' : 'text-gray-600'}`}>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={ctaLink}
        className={`block w-full py-3 text-center font-semibold rounded-xl transition-colors ${
          highlighted
            ? 'bg-white text-[#0047CC] hover:bg-blue-50'
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
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          READY TO KNOW<br />WHAT WORKS?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Join learning scientists and EdTech companies using UpGrade to make
          evidence-based decisions about student learning.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#pricing"
            className="px-8 py-4 text-lg font-semibold text-white rounded-xl bg-[#0047CC] hover:bg-[#003399] transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/CarnegieLearningWeb/UpGrade"
            target="_blank"
            className="px-8 py-4 text-lg font-semibold text-gray-700 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center gap-2"
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
    <footer className="py-16 px-4 bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#0047CC] flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-white">UpGrade</span>
            </div>
            <p className="text-sm leading-relaxed">
              The open-source evidence-based testing platform that uncovers the most effective learning experiences.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#demo" className="hover:text-white transition-colors">Demo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="https://github.com/JDerekLomas/upgrade-hosting" className="hover:text-white transition-colors">GitHub (Hosted)</a></li>
              <li><a href="https://github.com/CarnegieLearningWeb/UpGrade" className="hover:text-white transition-colors">GitHub (Core)</a></li>
              <li><a href="https://upgrade-platform.gitbook.io/docs/" className="hover:text-white transition-colors">UpGrade Docs</a></li>
              <li><a href="https://www.upgradeplatform.org/" className="hover:text-white transition-colors">UpGrade Platform</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Stay Updated</h4>
            <p className="text-sm mb-4">
              Sign up to stay current with UpGrade news.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#0047CC]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#0047CC] text-white font-medium rounded-lg hover:bg-[#003399] transition-colors text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} UpGrade Hosting. Built on Carnegie Learning's UpGrade.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="https://github.com/JDerekLomas/upgrade-hosting" className="hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
