"use client";

import ClientNavbar from "@/components/client-navbar";
import ClientFooter from "@/components/client-footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Twitter,
} from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

// Team members data
const TEAM_MEMBERS = [
  {
    id: 1,
    name: "Dr. Alexandra Chen",
    role: "Founder & CEO",
    bio: "Ph.D. in Educational Technology with over 15 years of experience in EdTech innovation and AI-driven learning solutions.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
    links: {
      twitter: "#",
      linkedin: "#",
      github: "#",
    },
  },
  {
    id: 2,
    name: "Marcus Johnson",
    role: "CTO",
    bio: "Former senior AI engineer at Google with expertise in machine learning for educational applications and natural language processing.",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
    links: {
      twitter: "#",
      linkedin: "#",
      github: "#",
    },
  },
  {
    id: 3,
    name: "Sophia Patel",
    role: "Head of Learning Design",
    bio: "Educational psychologist specializing in curriculum development and cognitive learning methodologies for digital platforms.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop",
    links: {
      twitter: "#",
      linkedin: "#",
      github: "#",
    },
  },
  {
    id: 4,
    name: "David Kim",
    role: "Lead Developer",
    bio: "Full-stack developer with a passion for creating intuitive, accessible educational technologies and interactive learning experiences.",
    image:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=400&auto=format&fit=crop",
    links: {
      twitter: "#",
      linkedin: "#",
      github: "#",
    },
  },
  {
    id: 5,
    name: "Emma Rodriguez",
    role: "Learning Science Researcher",
    bio: "Conducts research on the effectiveness of AI tutoring systems and develops new methodologies for personalized learning.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
    links: {
      twitter: "#",
      linkedin: "#",
      github: "#",
    },
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Head of Partnerships",
    bio: "Builds strategic relationships with educational institutions and EdTech companies to expand our platform's reach and impact.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    links: {
      twitter: "#",
      linkedin: "#",
      github: "#",
    },
  },
];

// Company values
const VALUES = [
  {
    title: "Accessible Learning",
    description:
      "We believe quality education should be accessible to everyone, regardless of location, background, or circumstance.",
    icon: "✨",
  },
  {
    title: "AI-Driven Personalization",
    description:
      "We harness the power of artificial intelligence to create truly personalized learning experiences that adapt to each learner.",
    icon: "🤖",
  },
  {
    title: "Evidence-Based Approach",
    description:
      "Our methodologies are grounded in cognitive science and educational research to ensure effective learning outcomes.",
    icon: "📊",
  },
  {
    title: "Human-Centered Design",
    description:
      "We prioritize intuitive, engaging experiences that put human needs at the center of our technology.",
    icon: "🧠",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <ClientNavbar />

      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 dark:bg-grid-small-white bg-grid-small-black -z-10 opacity-[0.2]" />

        {/* Animated shapes in background */}
        <div className="absolute inset-0 overflow-hidden -z-5">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-primary/5 dark:bg-primary/10 rounded-full"
              style={{
                width: `${100 + i * 50}px`,
                height: `${100 + i * 50}px`,
                top: `${20 + i * 15}%`,
                left: `${10 + i * 18}%`,
              }}
              animate={{
                x: [0, 10, -10, 0],
                y: [0, 15, -5, 0],
                scale: [1, 1.05, 0.95, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 12 + i * 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-block py-1 px-3 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mb-4">
                Our Story
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
            >
              We're on a mission to
              <span className="block text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                transform education
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            >
              We combine cutting-edge artificial intelligence with
              evidence-based learning science to create personalized educational
              experiences that adapt to each learner's unique needs and goals.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button size="lg" className="rounded-full" asChild>
                <Link href="/blog">
                  Read our story
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                asChild
              >
                <Link href="/contact">Get in touch</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block py-1 px-3 rounded-full text-sm font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 mb-4">
                Our Values
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                The principles that guide our work
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our core values shape everything we do, from product development
                to customer support. They're our guiding stars in creating the
                best educational experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {VALUES.map((value, index) => (
                <motion.div
                  key={index}
                  className="bg-background rounded-xl p-6 shadow-sm border"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{value.icon}</div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block py-1 px-3 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mb-4">
                  Our Journey
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  From a simple idea to an education revolution
                </h2>
                <div className="space-y-6">
                  <p className="text-muted-foreground">
                    Our story began in 2018 when Dr. Alexandra Chen, then a
                    professor of Educational Technology, recognized a gap in how
                    AI was being applied to education. Most systems weren't
                    truly adaptive to individual learning needs and styles.
                  </p>
                  <p className="text-muted-foreground">
                    What started as a research project at Stanford University
                    quickly grew into something more as early prototypes showed
                    remarkable improvements in student outcomes. By 2020, we had
                    assembled a world-class team of AI specialists, learning
                    scientists, and educators.
                  </p>
                  <p className="text-muted-foreground">
                    Today, our platform serves over 500,000 learners worldwide,
                    from K-12 students to working professionals looking to
                    upskill. We've partnered with educational institutions
                    across 30 countries and continue to expand our reach.
                  </p>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                      500K+
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Active Learners
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                      30+
                    </p>
                    <p className="text-sm text-muted-foreground">Countries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                      48%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Avg. Grade Improvement
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden relative">
                  <Image
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop"
                    alt="Team working together"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent mix-blend-overlay" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-background p-4 rounded-lg shadow-lg border">
                  <p className="text-sm font-medium">
                    "Education is not just about filling a bucket, but lighting
                    a fire."
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    — Dr. Alexandra Chen, Founder
                  </p>
                </div>
                <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground p-3 rounded-lg shadow-lg">
                  <p className="text-sm font-medium">Founded in 2018</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 mb-4">
              Our Team
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Meet the people behind the magic
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our diverse team combines expertise in AI, education, design, and
              development to create transformative learning experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM_MEMBERS.map((member, index) => (
              <motion.div
                key={member.id}
                className="bg-background rounded-xl overflow-hidden border shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground mb-4">{member.bio}</p>
                  <div className="flex space-x-3">
                    <a
                      href={member.links.twitter}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a
                      href={member.links.linkedin}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a
                      href={member.links.github}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Team */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block py-1 px-3 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 mb-4">
                  Careers
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Join our team and make an impact
                </h2>
                <p className="text-muted-foreground mb-6">
                  We're always looking for passionate, talented people to join
                  our mission of transforming education through AI. Check out
                  our open positions or drop us a line if you think you'd be a
                  great fit.
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    "Innovative work environment",
                    "Meaningful impact on education",
                    "Competitive compensation",
                    "Remote-first culture",
                    "Continuous learning opportunities",
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button size="lg" className="rounded-full" asChild>
                  <Link href="/careers">
                    View open positions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="relative">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop"
                  alt="Team collaboration"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-lg"
                />
                <div className="absolute -top-6 -right-6 bg-primary/10 backdrop-blur-sm border border-primary/20 p-5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                    <p className="font-medium">We're hiring!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600/20 to-violet-600/20 dark:from-blue-800/30 dark:to-violet-800/30 p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to transform your learning experience?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of learners already benefiting from our
              personalized AI teaching platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="rounded-full" asChild>
                <Link href="/signup">Get started for free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                asChild
              >
                <Link href="/contact">
                  Contact sales
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ClientFooter />
    </div>
  );
}
