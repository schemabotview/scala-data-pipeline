import type { Course, Section } from '../types'

const scala: Section = {
  id: 'scala',
  title: 'What Scala is, and where it is used',
  scene: 'intro-scala',
  narration:
    "Scala is a programming language that runs on the Java virtual machine, the same engine that runs Java. That gives it two things from the start: every Java library ever written, and a runtime trusted by banks, phone companies and streaming services for decades. But Scala brings its own ideas, and the six lines on the left show most of them at once. Line two describes a play, a track and how many milliseconds it was played, as a case class: a typed value in one line. Line five makes a list of three plays. And line six is the whole idea of this course. It groups the plays by track, keeps each play's milliseconds, and adds them up, in a single expression. Underneath, the compiler checks every type, so a track can never be added to a duration by mistake. The terminal shows the answer: track t zero one was played for two hundred seventy five thousand milliseconds, track t zero two for one hundred ninety eight thousand. Typed values, transformations over collections, and a compiler that checks them. That combination is why Scala became the language of data engineering. On the right are the places it runs today: batch and streaming data pipelines, event streams, the backends of web services, trading and risk systems in finance, and compilers and hardware languages, including Scala's own compiler. In this course, you will learn Scala the way it is used in that first box. We will build a data pipeline from scratch, using nothing but Scala's standard library and the JDK, and every idea that the big data frameworks are made of, we will build by hand.",
}

const whatWeBuild: Section = {
  id: 'what-we-build',
  title: "What we'll build: Play-Stream's pipeline",
  scene: 'intro-what-we-build',
  narration:
    "Here is the plan for the whole course, in one picture. Play-Stream is a fictional music service, and our application, playstream, is its data pipeline. On the left is what comes in. The web player exports a CSV file of plays every day. Listeners' phones upload their plays as JSON, sometimes days late, after a phone has been offline. And a catalog lists every track and its artist. On the right is how it ends, and it is real output, not a mock-up: the finished playstream, packaged as a single program, answering a request for the first of October's chart over HTTP, as JSON. Slow Tide, Night Bus and Northern Lights. And a request for Christmas Day, which has no chart, answered with a clear error. In the middle is playstream itself, and each box is labelled with the course that builds it. We start small. For the first few courses, everything lives in one file, Main dot scala. Course five gives the data real types, and course six transforms it into charts, sessions and clean, deduplicated plays. Course seven reads the phones' JSON with a parser we write ourselves, and writes the reports. Course eight finds the one idea behind every aggregation, and course nine makes the whole thing trustworthy with tests. Then the data grows. Course ten processes ten million plays, in constant memory, on every core of the machine. Course eleven follows uploads live, as they arrive, and handles plays that turn up late. Course twelve packages playstream as a single command and serves its charts. Every part of playstream is muted here, because none of it exists yet. Each time a course finishes, its part lights up. Every line of code you will see is real, and every output was really produced by running it. Let's begin.",
}

export const intro: Course = {
  id: 'intro',
  title: 'Scala, and what we will build',
  sections: [scala, whatWeBuild],
}
