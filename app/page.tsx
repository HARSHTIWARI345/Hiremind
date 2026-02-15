"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ArrowRight, Mic, Sparkles, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Manrope, Space_Grotesk } from "next/font/google";

import { Button } from "@/components/ui/button";

const headingFont = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"] });
const bodyFont = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function LandingPage() {
  return (
    <div className={`${bodyFont.className} relative min-h-screen overflow-hidden bg-[#070B14] text-slate-100`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-[-6rem] h-[28rem] w-[28rem] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute right-[-7rem] top-8 h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/20 blur-[120px]" />
        <div className="absolute bottom-[-8rem] left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-indigo-500/25 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.11)_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070B14]/40 to-[#070B14]" />
      </div>

      <nav className="container relative z-10 mx-auto flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-white/20 bg-white/10 p-2 shadow-lg shadow-cyan-500/20 backdrop-blur-md">
            <Sparkles className="h-6 w-6 text-cyan-300" />
          </div>
          <span
            className={`${headingFont.className} bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent`}
          >
            HireMind AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button variant="ghost" className="text-slate-100 hover:bg-white/10 hover:text-white">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:to-blue-400">
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400">
                Dashboard
              </Button>
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      <section className="container relative z-10 mx-auto px-4 pb-16 pt-14 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-5xl text-center"
        >
          <p className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-5 py-2 text-sm font-semibold text-cyan-200">
            <Sparkles className="h-4 w-4" />
            AI recruiter simulation for software roles
          </p>
          <h1 className={`${headingFont.className} mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-7xl`}>
            <span className="block bg-gradient-to-r from-white via-cyan-100 to-slate-100 bg-clip-text text-transparent">
              An AI Recruiter That Interviews You
            </span>
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-fuchsia-300 bg-clip-text text-transparent">
              Before The Real Recruiter Does
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-base text-slate-300 sm:text-lg">
            Master interviews with realistic AI mock sessions, targeted feedback, and role-specific skill gap insights
            that make your preparation measurable.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-8 text-base font-semibold text-slate-950 shadow-[0_10px_40px_-15px_rgba(34,211,238,0.8)] hover:from-cyan-300 hover:to-blue-400"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-8 text-base font-semibold text-slate-950 shadow-[0_10px_40px_-15px_rgba(34,211,238,0.8)] hover:from-cyan-300 hover:to-blue-400"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </SignedIn>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/25 bg-white/5 px-8 text-base text-slate-200 backdrop-blur-sm hover:bg-white/10 hover:text-white"
            >
              Watch Demo
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-14 max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl md:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-cyan-200/20 bg-gradient-to-b from-cyan-400/10 to-transparent p-5 text-left">
              <div className="mb-1 text-3xl font-bold text-cyan-200">10K+</div>
              <p className="text-sm text-slate-300">Mock interviews completed</p>
            </div>
            <div className="rounded-2xl border border-blue-200/20 bg-gradient-to-b from-blue-400/10 to-transparent p-5 text-left">
              <div className="mb-1 text-3xl font-bold text-blue-200">95%</div>
              <p className="text-sm text-slate-300">Users improved confidence</p>
            </div>
            <div className="rounded-2xl border border-fuchsia-200/20 bg-gradient-to-b from-fuchsia-400/10 to-transparent p-5 text-left">
              <div className="mb-1 text-3xl font-bold text-fuchsia-200">500+</div>
              <p className="text-sm text-slate-300">Hiring teams represented</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="container relative z-10 mx-auto px-4 pb-20 pt-6 md:pb-24">
        <h2 className={`${headingFont.className} mb-10 text-center text-3xl font-bold tracking-tight text-white md:text-4xl`}>
          Why Developers Choose HireMind AI
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/30 backdrop-blur-lg"
          >
            <div className="mb-4 inline-flex rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-3">
              <Mic className="h-7 w-7 text-cyan-200" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">AI Avatar Interviews</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              Practice with a realistic avatar interviewer that adapts follow-up questions based on your responses.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/30 backdrop-blur-lg"
          >
            <div className="mb-4 inline-flex rounded-xl border border-blue-300/30 bg-blue-300/10 p-3">
              <TrendingUp className="h-7 w-7 text-blue-200" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Skill Gap Analysis</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              Receive score-based feedback across communication, technical depth, and problem-solving patterns.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/30 backdrop-blur-lg"
          >
            <div className="mb-4 inline-flex rounded-xl border border-fuchsia-300/30 bg-fuchsia-300/10 p-3">
              <Users className="h-7 w-7 text-fuchsia-200" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Smart Job Matching</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              Align your profile with openings that fit your current strengths and next-step growth areas.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container relative z-10 mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl rounded-3xl border border-cyan-200/20 bg-gradient-to-br from-cyan-400/15 via-blue-500/15 to-fuchsia-500/10 p-8 text-center shadow-[0_20px_80px_-35px_rgba(56,189,248,0.8)] backdrop-blur-xl md:p-12"
        >
          <h2 className={`${headingFont.className} mb-4 text-3xl font-bold text-white md:text-4xl`}>
            Ready to Ace Your Next Interview?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-slate-200 md:text-lg">
            Join learners who are landing stronger opportunities with AI-powered practice and personalized improvement
            loops.
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-8 text-base font-semibold text-slate-950 hover:from-cyan-300 hover:to-blue-400"
              >
                Get Started Free
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-8 text-base font-semibold text-slate-950 hover:from-cyan-300 hover:to-blue-400"
              >
                Go to Dashboard
              </Button>
            </Link>
          </SignedIn>
        </motion.div>
      </section>
    </div>
  );
}
