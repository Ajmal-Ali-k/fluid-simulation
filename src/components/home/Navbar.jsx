import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from '../../assets/images/log.png'

function Navbar() {
//   const location = useLocation();
//   const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrollingUp, setIsScrollingUp] = useState(true);

  const nav_items = [
    { item: "Home", path: "/" },
    { item: "About", path: "/about" },
    { item: "Service", path: "/service" },
    { item: "Projects", path: "/projects" },
    { item: "Our Team", path: "/teams" },
    { item: "Blogs", path: "/blogs" },
    { item: "Careers", path: "/careers" },
    { item: "Contact", path: "/contact" },
  ];



  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.style.overflow = "hidden"; // Disable body scroll
  //   } else {
  //     document.body.style.overflow = "auto"; // Enable body scroll
  //   }

  //   // Cleanup function to reset overflow when component unmounts
  //   return () => {
  //     document.body.style.overflow = "auto";
  //   };
  // }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // Scrolling down
        setIsScrollingUp(false);
      } else {
        // Scrolling up
        setIsScrollingUp(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

    
      
  return (
    <>
      <header className="z-50 w-full font-roboto ">
      
             <AnimatePresence>
            {isScrollingUp && (
              <img
                key="logo"
                src={logo}
                alt="logo"
                className="w-auto h-auto cursor-pointer mix-blend-difference z-[999] fixed top-[2%] md:left-[4%] -left-[2%] transition-opacity duration-300"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                //   navigate("/");
                }}
              />
            )}
            </AnimatePresence>
        
            {isScrollingUp && (
        <div 
        className="fixed top-[4%] z-[999] right-[5%]">
          <div className="relative md:-top-0 -top-2 md:right-0 gap-2 justify-end flex items-center mx-auto">
            <div className="group">
              <div
                className="bg-[#CDEA68] relative md:backdrop-blur-sm  overflow-hidden transition-transform md:duration-700 duration-400 ease-in-out rounded-xl flex items-center justify-center md:focus:outline-none "
                onClick={() => setIsOpen(!isOpen)}
              >
                {/* <div className="md:block hidden absolute top-0 left-0 w-0 h-full bg-[#ae855d] transition-all duration-400 ease-in-out group-hover:w-full"></div> */}

                {isOpen ? (
                  <button  className=" bg-[#0E0E0E] text-[#CDEA68]  font-helvetica py-3 px-7 ">
                    close
                 </button>
                ) : (
                    <button  className=" bg-[#CDEA68] text-[#0E0E0E] font-helvetica py-3 px-7  ">
                    menu
                 </button>
                )}
              </div>
            </div>
          </div>
        </div>
            )}
      </header>

      {/* Expanded Navigation Menu */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ x: "110%" }}
            animate={{ x: isOpen ? "0%" : "-110%" }}
            exit={{ x: "110%" }}
            transition={{ type: "tween", duration: 0.3, exit: { delay: 2 } }}
            className="fixed right-0 mt-2 bg-lime-300 shadow-lg p-4 m-3 rounded-xl md:h-[45vh] h-[92vh] z-40 overflow-y-hidden pt-6 md:pt-10 max-w-4xl lg:pl-2 backdrop-blur-sm"
          >
            <div className="container mx-auto px-2 py-10">
              {/* Menu content in three columns */}
              <motion.div className="">
                {/* Quick Links Column */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                  className="grid grid-cols-3 gap-4 backdrop-blur-sm p-4 md:pl-10 md:pt-8 rounded-lg overflow-y-hidden transition-transform duration-500"
                >
                
                    {nav_items.map((x, index) => (
                      <button key={index}   className={`py-2 px-3  text-left text-black text-xl border border-[#6b6b6b] rounded-xl
                        ${x === 'Home' ? 'bg-white text-black' : 'hover:bg-white/50'}
                      `}>                         
                            {x.item}                        
                      </button>
                    ))}
                </motion.div>

              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}

export default Navbar;