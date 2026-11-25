// Microsoft's privacy links, in this order and with this exact text, in the footer of the website and
// of every deck slide. The opt-out icon is the unmodified one from microsoft.com's footer.
export const PRIVACY_STATEMENT_URL = 'https://go.microsoft.com/fwlink/?LinkId=521839'

const LINKS = [
  { label: 'Your Privacy Choices', href: 'https://go.microsoft.com/fwlink/?linkid=2214802', optOutIcon: true },
  { label: 'Consumer Health Privacy', href: 'https://go.microsoft.com/fwlink/?linkid=2259814' },
  { label: 'Privacy', href: PRIVACY_STATEMENT_URL },
]

const OPT_OUT_ICON = `${import.meta.env.BASE_URL}privacy-choices.svg`

// A span of links, so it is valid inside the deck engine's BottomBar text.
export default function LegalLinks({ className = '' }) {
  return (
    <span className={`legal-links ${className}`.trim()}>
      {LINKS.map(({ label, href, optOutIcon }) => (
        <a key={href} className="legal-link" href={href}>
          {optOutIcon && (
            <img src={OPT_OUT_ICON} alt="California Consumer Privacy Act (CCPA) Opt-Out Icon" width="43" height="16" />
          )}
          {label}
        </a>
      ))}
    </span>
  )
}
