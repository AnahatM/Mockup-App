import { Link } from 'react-router-dom'
import { cx } from '@/lib/cx'
import { DEVICES } from '@/features/devices/state'
import { ScreenshotSlot } from '@/ui'
import aboutShot from '@/assets/shots/about-procedural.png'
import { LINKS, ROUTES } from '../routes'
import styles from './Prose.module.css'

/** The body of the About page, one component per section. */
export function WhyItExists() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Why it exists</h2>
      <p className={styles.body}>
        Presenting an app well is not a luxury. A flat screenshot in a README, on a
        store listing or in a pitch deck undersells the work behind it — but the tools
        that fix that are almost all paid, cloud-hosted, and want you to upload the
        product you have not shipped yet.
      </p>
      <p className={styles.body}>
        Mockup Studio is the same capability with none of those conditions. It runs
        entirely in your browser, has no account and no server, and puts no mark on your
        exports. The unreleased screenshot you drop into it never leaves your machine.
      </p>
    </section>
  )
}

export function HowItIsBuilt() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>How it is built</h2>
      <p className={styles.body}>
        Every device is <span className={styles.strong}>generated in code</span> from a
        data file describing its real millimetre dimensions, its corner radius, where
        its buttons sit and what it is made of. There are no 3D model files in this
        repository.
      </p>
      <p className={styles.body}>
        That choice does most of the work. It keeps the download small, avoids the
        licensing tangle of redistributing models of branded hardware, and — most
        usefully — means a device&rsquo;s colour and finish are live parameters rather
        than pixels baked into a texture. Recolouring a phone to match your brand is a
        property change, not an impossibility.
      </p>
      <ScreenshotSlot
        caption="A procedural phone in the studio — every dimension is data"
        src={aboutShot}
      />
      <p className={styles.body}>
        The same idea runs through the rest: lighting rigs are arrays of parametric area
        lights rather than photographs, control panels are generated from typed schemas
        rather than hand-written forms, and an entire scene serialises to one JSON file
        you can share.
      </p>
    </section>
  )
}

export function WhatIsInIt() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>What is in it</h2>
      <div className={styles.list}>
        <p className={styles.item}>
          <span className={styles.strong}>{DEVICES.length} devices</span> across phones,
          folding phones, tablets, laptops, desktops and watches.
        </p>
        <p className={styles.item}>
          <span className={styles.strong}>A full 3D studio</span> — parametric lighting,
          HDRI support, backdrops, camera and motion presets, ambient occlusion.
        </p>
        <p className={styles.item}>
          <span className={styles.strong}>Image and video export</span> at any
          resolution, with real transparency.
        </p>
        <p className={styles.item}>
          <span className={styles.strong}>2D window mockups</span> that work standalone
          or on a device&rsquo;s screen.
        </p>
      </div>
      <p className={styles.body}>
        The{' '}
        <Link className={cx(styles.link)} to={ROUTES.docs}>
          documentation
        </Link>{' '}
        covers all of it, and the{' '}
        <Link className={cx(styles.link)} to={ROUTES.studio}>
          studio
        </Link>{' '}
        is the fastest way to see whether it suits you.
      </p>
    </section>
  )
}

export function Contributing() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Contributing</h2>
      <p className={styles.body}>
        Adding a device is deliberately the easiest contribution to make: it is usually
        a single data file listing dimensions taken from published measurements. The
        repository documents the format, and three rules — no hardcoded colours, no long
        files, strict TypeScript — are enforced by the build rather than by review.
      </p>
      <p className={styles.body}>
        Issues and pull requests are welcome on{' '}
        <a
          className={styles.link}
          href={LINKS.repo}
          target="_blank"
          rel="noreferrer noopener"
        >
          GitHub
        </a>
        .
      </p>
    </section>
  )
}

export function WhoMadeIt() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Who made it</h2>
      <p className={styles.body}>
        Built by{' '}
        <a
          className={styles.link}
          href={LINKS.author}
          target="_blank"
          rel="noreferrer noopener"
        >
          Anahat Mudgal
        </a>
        , a developer who writes games, tools and web apps — several of them open
        source. Mockup Studio came out of needing decent presentation images for other
        projects and being unwilling to rent them.
      </p>
      <p className={styles.body}>
        It is MIT licensed: use it commercially, fork it, ship it inside something else.
        No device manufacturer is affiliated with or endorses this project; all models
        are original approximations and brand names describe form factors only.
      </p>
    </section>
  )
}
