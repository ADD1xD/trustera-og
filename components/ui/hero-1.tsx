'use client'

import { useState } from 'react'

interface NavigationItem {
  name: string
  href: string
}

interface AnnouncementBanner {
  text: string
  linkText: string
  linkHref: string
}

interface CallToAction {
  text: string
  href: string
  variant: 'primary' | 'secondary'
}

interface HeroLandingProps {
  logo?: { src: string; alt: string; companyName: string }
  navigation?: NavigationItem[]
  loginText?: string
  loginHref?: string
  title: string
  description: string
  announcementBanner?: AnnouncementBanner
  callToActions?: CallToAction[]
  titleSize?: 'small' | 'medium' | 'large'
  gradientColors?: { from: string; to: string }
  className?: string
  // Custom slot: replace the default login link with any element (e.g. the auth button)
  loginSlot?: React.ReactNode
}

const defaultProps: Partial<HeroLandingProps> = {
  titleSize: 'large',
  gradientColors: {
    from: 'oklch(0.646 0.222 41.116)',
    to: 'oklch(0.488 0.243 264.376)',
  },
}

export function HeroLanding(props: HeroLandingProps) {
  const {
    logo,
    navigation,
    loginText,
    loginHref,
    loginSlot,
    title,
    description,
    announcementBanner,
    callToActions,
    titleSize,
    gradientColors,
    className,
  } = { ...defaultProps, ...props }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getTitleSizeClasses = () => {
    switch (titleSize) {
      case 'small':  return 'text-2xl sm:text-3xl md:text-5xl'
      case 'medium': return 'text-2xl sm:text-4xl md:text-6xl'
      case 'large':
      default:       return 'text-3xl sm:text-5xl md:text-7xl'
    }
  }

  const renderCTA = (cta: CallToAction, index: number) => {
    if (cta.variant === 'primary') {
      return (
        <a
          key={index}
          href={cta.href}
          className="rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {cta.text}
        </a>
      )
    }
    return (
      <a key={index} href={cta.href} className="text-sm font-semibold text-foreground hover:text-muted-foreground transition-colors">
        {cta.text} <span aria-hidden="true">→</span>
      </a>
    )
  }

  return (
    <div className={`min-h-screen w-full overflow-x-hidden relative ${className || ''}`}>
      {/* Top gradient blob */}
      <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          style={{
            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            background: `linear-gradient(to top right, ${gradientColors?.from}, ${gradientColors?.to})`,
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>

      {/* Bottom gradient blob */}
      <div aria-hidden="true" className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div
          style={{
            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            background: `linear-gradient(to top right, ${gradientColors?.from}, ${gradientColors?.to})`,
          }}
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
        />
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-card px-6 py-6 ring-1 ring-border">
            <div className="flex items-center justify-between mb-6">
              {logo && (
                <a href="#" className="-m-1.5 p-1.5">
                  <span className="sr-only">{logo.companyName}</span>
                  <span className="text-lg font-bold text-foreground">{logo.companyName}</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close menu"
              >
                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {navigation && navigation.length > 0 && (
              <div className="space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-base font-semibold text-card-foreground hover:bg-accent/10 transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navbar — intentionally minimal; the real nav is NavbarWrapper */}
      {(logo || (navigation && navigation.length > 0)) && (
        <header className="absolute inset-x-0 top-0 z-10">
          <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
            <div className="flex lg:flex-1">
              {logo && (
                <a href="#" className="-m-1.5 p-1.5 flex items-center gap-2">
                  <span className="sr-only">{logo.companyName}</span>
                  <span className="text-lg font-bold text-foreground">{logo.companyName}</span>
                </a>
              )}
            </div>
            {navigation && navigation.length > 0 && (
              <>
                <div className="flex lg:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-muted-foreground"
                    aria-label="Open menu"
                  >
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </button>
                </div>
                <div className="hidden lg:flex lg:gap-x-12">
                  {navigation.map((item) => (
                    <a key={item.name} href={item.href} className="text-sm font-semibold text-foreground hover:text-muted-foreground transition-colors">
                      {item.name}
                    </a>
                  ))}
                </div>
              </>
            )}
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              {loginSlot ?? (loginText && loginHref && (
                <a href={loginHref} className="text-sm font-semibold text-foreground hover:text-muted-foreground transition-colors">
                  {loginText} <span aria-hidden="true">&rarr;</span>
                </a>
              ))}
            </div>
          </nav>
        </header>
      )}

      {/* Hero content */}
      <div className="relative isolate px-6 pt-14 min-h-screen flex flex-col justify-center">
        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-40">
          {announcementBanner && (
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm text-muted-foreground ring-1 ring-border hover:ring-ring transition-all">
                {announcementBanner.text}{' '}
                <a href={announcementBanner.linkHref} className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  <span aria-hidden="true" className="absolute inset-0" />
                  {announcementBanner.linkText} <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          )}

          <div className="text-center">
            <h1 className={`${getTitleSizeClasses()} font-semibold tracking-tight text-balance text-foreground`}>
              {title}
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
              {description}
            </p>
            {callToActions && callToActions.length > 0 && (
              <div className="mt-10 flex items-center justify-center gap-x-6">
                {callToActions.map((cta, i) => renderCTA(cta, i))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export type { HeroLandingProps, NavigationItem, AnnouncementBanner, CallToAction }
