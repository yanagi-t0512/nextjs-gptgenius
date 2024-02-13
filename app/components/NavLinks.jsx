import Link from "next/link"

const links = [
  {href: '/chat', label: 'チャット'},
  {href: '/tours', label: 'ツアーズ'},
  {href: '/tours/new-tour', label: '新規ツアー'},
  {href: '/profile', label: 'プロフィール'},
]

const NavLinks = () => {
  return (
    <ul className="menu text-base-content">
      {links.map((link) => {
        return (
          <li key={link.href}>
            <Link href={link.href} className="capitalize">
              {link.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default NavLinks