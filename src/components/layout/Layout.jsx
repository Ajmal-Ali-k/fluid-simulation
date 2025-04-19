import FooterSection from "../home/Footer"
import Navbar from "../home/Navbar"

function Layout({children}) {
  return (
    <main className=' '>
        <Navbar />
        <div>{children}</div>
        <FooterSection  />
        
    </main>
  )
}

export default Layout
