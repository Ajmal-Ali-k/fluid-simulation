import { useEffect, useState } from "react"
import Footer from '../../assets/images/Footer.png'



export default function FooterSection() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <footer className="relative w-full py-16 overflow-hidden text-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={Footer}  fill className="object-cover w-full" priority />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">

      <div className="space-y-2 text-sm font-light pb-10">
              <p className="hover:opacity-70 cursor-pointer ">FACEBOOK</p>
              <p className="hover:opacity-70 cursor-pointer ">INSTAGRAM</p>
              <p className="hover:opacity-70 cursor-pointer ">LINKEDIN</p>
              <p className="hover:opacity-70 cursor-pointer ">X</p>
      </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Social Media & Locations */}
          <div className="space-y-8">
            {/* Social Media Links */}
           

            {/* Kochi Office */}
            <div className="space-y-1">
              <h3 className=" font-medium mb-2">kochi</h3>
              <p className="text-sm font-light">Technoloft, Infopark Campus</p>
              <p className="text-sm font-light">JV Infopark Rd, Sonia Nagar</p>
              <p className="text-sm font-light">Pallarimanglam, Kochi, Ernakulam</p>
              <p className="text-sm font-light">Kerala - 682025</p>
              <p className="text-sm font-light">Ph: +0484 785 5200</p>
              <p className="text-sm font-light">Mob: +91 9087 633 933</p>
            </div>

            {/* Calicut Office */}
            <div className="space-y-1">
              <h3 className=" font-medium mb-2">CALICUT</h3>
              <p className="text-sm font-light">Technoloft, Fortune Business Park</p>
              <p className="text-sm font-light">2nd Floor, Chevayur Nagar</p>
              <p className="text-sm font-light">Kozhikode</p>
              <p className="text-sm font-light">Ph: +0495 400 5449</p>
              <p className="text-sm font-light">Mob: +91 9087 633 933</p>
            </div>
          </div>

          {/* Business & Navigation */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-16">
              {/* Business Info */}
              <div className="space-y-2">
                <h3 className=" font-medium mb-4">BUSINESS</h3>
                <p className="text-sm font-light">INFO@TAPCLONE.IN</p>
                <p className="text-sm font-light">+91962504049</p>
              </div>

              {/* Navigation */}
              <div className="space-y-2">
                <a href="/" className="block text-sm  hover:opacity-70">
                  HOME
                </a>
                <a href="/about" className="block text-sm  hover:opacity-70">
                  ABOUT
                </a>
                <a href="/services" className="block text-sm  hover:opacity-70">
                  SERVICES
                </a>
                <a href="/projects" className="block text-sm  hover:opacity-70">
                  PROJECTS
                </a>
                <a href="/team" className="block text-sm  hover:opacity-70">
                  OUR TEAM
                </a>
                <a href="/career" className="block text-sm  hover:opacity-70">
                  CAREER
                </a>
                <a href="/blog" className="block text-sm  hover:opacity-70">
                  BLOG
                </a>
                <a href="/contact" className="block text-sm  hover:opacity-70">
                  CONTACT
                </a>
              </div>
            </div>

            {/* Logo */}
            <div className="mt-16 flex justify-end">
              <h2 className="text-4xl md:text-7xl font-bold tracking-widest">TAPCLONE</h2>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

