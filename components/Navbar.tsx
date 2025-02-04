import Image from 'next/image'
import Link from 'next/link'

const Navbar = () => {
  return (
    <header className="w-full flex items-center justify-start">
      <nav className="nav ">
        <Link href="/" className="flex items-center gap-1">
          <p className="nav-logo">
            Austen<span className='text-blue-600'> Anop</span>
          </p>
        </Link>
      </nav>
    </header>
  )
}

export default Navbar