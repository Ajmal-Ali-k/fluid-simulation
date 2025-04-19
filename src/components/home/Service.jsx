import React, { useState } from 'react'
import s1 from '../../assets/images/s1.png';
import { FaArrowRight } from 'react-icons/fa';
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { motion , AnimatePresence} from "framer-motion";


// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

function Service() {
  const [activeServiceIndex, setActiveServiceIndex] = useState(-1);

  const services = [
    {
      id: "seo",
      title: `SEO <br/> Services`,
      number: "01",
      description:
        " seo  In today's hyperconnected world, SEO is the key to unlocking business growth. It enhances ROI, reach, engagement, and interaction across multiple platforms, ensuring your brand stays ahead of competitors.",
      imagePath: s1,
      path: "/seo",
    },
    {
      id: "google-ads",
      title: `Google Ads <br/> Services`,
      number: "02",
      description:
        " google ads In today's hyperconnected world, Google Ads is the key to unlocking business growth. It enhances ROI, reach, engagement, and interaction across multiple platforms, ensuring your brand stays ahead of competitors.",
      imagePath: s1,
      path: "/google-ads",
    },
    {
      id: "social-media-marketing",
      title: `Social Media Marketing <br/> Services`,
      number: "03",
      description:
        " social In today's hyperconnected world, social media marketing is the key to unlocking business growth. It enhances ROI, reach, engagement, and interaction across multiple platforms, ensuring your brand stays ahead of competitors.",
      imagePath: s1,
      path: "/social-media-marketing",
    },
    {
      id: "content-production",
      title: `Content Production <br/> Services`,
      number: "04",
      description:
        " content In today's hyperconnected world, content production is the key to unlocking business growth. It enhances ROI, reach, engagement, and interaction across multiple platforms, ensuring your brand stays ahead of competitors.",
      imagePath: s1,
      path: "/content-production",
    },
    {
      id: "branding",
      title: `Branding <br/> Services`,
      number: "05",
      description:
        " branding In today's hyperconnected world, branding is the key to unlocking business growth. It enhances ROI, reach, engagement, and interaction across multiple platforms, ensuring your brand stays ahead of competitors.",
      imagePath: s1,
      path: "/branding",
    },
    {
      id: "website-development",
      title: `Website & UI/UX <br/> Development Services`,
      number: "06",
      description:
        " website In today's hyperconnected world, website and UI/UX development is the key to unlocking business growth. It enhances ROI, reach, engagement, and interaction across multiple platforms, ensuring your brand stays ahead of competitors.",
      imagePath: s1,
      path: "/website-development",
    },
   
  ]

  const racesRef = useRef(null);
  const racesWrapperRef = useRef(null);

  useEffect(() => {
    const races = racesRef.current;
    const wrapper = racesWrapperRef.current;
  
    if (!races || !wrapper) return;
  
    // Make sure we wrap this in a slight delay to ensure DOM is ready
    let scrollTween;
    
    const setupAnimation = () => {
      // Clear any existing animations
      // ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      
      // Calculate total width needed - each panel is 100vw
      const totalWidth = services.length * window.innerWidth;
      
      // Set the width of the scrollable container
      gsap.set(races, { width: totalWidth });
  
      scrollTween = gsap.to(races, {
        x: () => -(totalWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
           id: "service-pin",
          trigger: wrapper,
          start: "top top",
          end: () => `+=${totalWidth - window.innerWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          overwrite:true,
          // Consider removing markers in production
          // markers: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const newIndex = Math.min(
              services.length - 1,
              Math.floor(progress * services.length)
            );
            if (newIndex !== activeServiceIndex) {
              setActiveServiceIndex(newIndex);
            }
          }
        }
      });
    };
  
    // Small timeout to ensure DOM is ready
    const timer = setTimeout(setupAnimation, 100);
    
    // Add resize handler for responsiveness
    window.addEventListener("resize", setupAnimation);
  
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", setupAnimation);
      if (scrollTween) scrollTween.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [services.length ]);

  return (
    <div className=' bg-black'>
    <div className=" py-20 text-white  px-8 relative bg-black " >
      <div className="max-w-7xl mx-auto w-full relative">    
        <div className="text-right mb-8 absolute top-0 right-0">
          <a href="#" className="text-lite-green text-sm tracking-wide">
            [ OUR SERVICES ]
          </a>
        </div>
        
        <div className="relative mb-16 w-full">
          <h1 className="text-4xl md:text-5xl font-light leading-tight capitalize">
            <span className="text-lite-green">We're brand builders</span> at heart,<br className='md:block hidden' /> 
            creators by design, tech <br className='md:block hidden' />
            enthusiasts in practice, and<br className='md:block hidden' /> 
            integrated at our core
          </h1>
        </div>
      </div>
    <div className='relative wrapper' ref={racesWrapperRef} >
      <div 
        className="flex flex-nowrap h-[45vh] relative lg:px-16 " 
        ref={racesRef}
      >
        {services.map((service) => (
          <div 
            key={service.id} 
            className="w-screen h-full flex items-center px-4"
          >
            <div className=" mx-auto px-6 md:pr-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative ">
                <div className="space-y-8">
                  <div className="space-y-2">
                  <h2 
                    className="text-7xl tracking-tight whitespace-nowrap"
                    dangerouslySetInnerHTML={{
                      __html: `${service.title} <span class="text-lg align-super ml-1 text-[#686868] ">${service.number}</span>`
                    }}
                  />
                  </div>
                  </div>
                  </div>
        
                  
              </div>
            </div>
         
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative lg:px-16">
                  <motion.div 
                      // key={`image-${activeServiceIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className="relative rounded-lg">
                    <img
                    src={services[activeServiceIndex]?.imagePath || s1 }
                    alt={`${services[activeServiceIndex]?.title} services`}
                    width={600}
                      height={300}
                      className="object-cover h-[90%]"
                      />
                    </motion.div>
                <div className="flex flex-col justify-center space-y-8 static">
                <AnimatePresence mode="wait">
                  <motion.p 
                  key={`desc-${activeServiceIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6 }}
                  className="text-xl font-light md:pr-10 max-w-xl h-36 ">
                    {services[activeServiceIndex]?.description || services[0].description}
                  </motion.p>
                  </AnimatePresence>
      
                  <div>
                    <div className="pt-8 group">
                      <button
                        type="submit"
                        className="bg-[#FEE5CA] cursor-pointer w-40 text-lg text-black group-hover:text-[#FEE5CA] px-8 py-3 flex items-center gap-2 group-hover:bg-black transition-colors duration-300 border border-[#FEE5CA]"
                      >
                        <span>Send</span>
                        <div className="group-hover:bg-[#FEE5CA] bg-black p-1 ml-4 transform-translate group-hover:ml-6 duration-300 ease-out">
                          <FaArrowRight className="text-[#FEE5CA] group-hover:text-black text-sm"/>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Service