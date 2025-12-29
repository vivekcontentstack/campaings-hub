import Link from "next/link"

interface FooterLink {
  title: string
  href: string
}

interface FooterProps {
  links?: FooterLink[]
}

export default function Footer({ links = [] }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-muted py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo/Brand */}
          <div className="text-lg font-bold tracking-tight text-foreground">CAMPAIGN HUB</div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {currentYear} CAMPAIGN HUB. All rights reserved.
          </div>

          {/* Links */}
          {links.length > 0 && (
            <nav className="flex items-center gap-6">
              {links.map((link, index) => (
                <Link 
                  key={index} 
                  href={link.href || '#'} 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  )
}
