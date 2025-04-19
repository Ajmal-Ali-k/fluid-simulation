import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import testi1 from '../../assets/images/testi1.png';
import testi2 from '../../assets/images/testi2.png';
import testi3 from '../../assets/images/testi3.png';
import testi4 from '../../assets/images/testi4.png';
import torn from '../../assets/images/torn.png';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Thomas",
      image: testi1,
      testimonial:
        "Working with TapClone transformed our business. Their innovative approach and attention to detail exceeded our expectations.",
    },
    {
      id: 2,
      name: "Mathew",
      image: testi2,
      testimonial:
        "The team at TapClone delivered exceptional results. Their strategic insights helped us reach new markets effectively.",
    },
    {
      id: 3,
      name: "Stephen",
      image: testi3,
      testimonial:
        "I was impressed by TapClone's professionalism and creativity. They truly understand how to build a strong brand presence.",
    },
    {
      id: 4,
      name: "Joseph",
      image: testi4,
      testimonial:
        "TapClone provided solutions that were both innovative and practical. Their work has had a lasting positive impact on our company.",
    },
  ]

  const [expandedId, setExpandedId] = useState(null)
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const tl = useRef(null); // Store timeline in a ref

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Clear only our own ScrollTriggers
    const existingTrigger = ScrollTrigger.getById("testi-pin");
    if (existingTrigger) existingTrigger.kill();
    if (tl.current) tl.current.kill();

    // Filter out null refs
    cardsRef.current = cardsRef.current.filter(Boolean);
    
    // Set initial state
    gsap.set(cardsRef.current, { y: 100, opacity: 0 });
    
    // Create timeline
    tl.current = gsap.timeline({
      scrollTrigger: {
        id: "testi-pin",
        trigger: sectionRef.current,
        start: "top -20%",
        end: () => `+=${cardsRef.current.length * 400}`,
        pin: true,
        scrub: 1,
        markers: false,
        // Important: prevent this from interfere with other sections
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });
    
    // Add animations
    cardsRef.current.forEach((card, index) => {
      tl.current.to(card, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      }, index * 0.2);
    });

    // Cleanup only our own triggers
    return () => {
      const trigger = ScrollTrigger.getById("testi-pin");
      if (trigger) trigger.kill();
      if (tl.current) tl.current.kill();
    };
  }, [testimonials.length]);

  return (
    <div className="bg-black text-white relative py-10" ref={sectionRef}>
      {/* Reviews text */}
      <div className="max-w-7xl w-full relative mx-auto px-4 pt-10">
        <div className="text-right">
          <span className="text-lite-green text-sm pr-10">[REVIEWS]</span>
        </div>
      </div>
    
      {/* Heading */}
      <div className="mx-auto px-4 text-center my-8">
        <h2 className="text-6xl md:text-7xl lg:text-8xl font-extrabold font-impact">
          <div className="w-full h-px bg-[#333333]"></div>
          <span className="text-transparent bg-clip-text" style={{ WebkitTextStroke: "1px #CDEA68" }}>
            WHAT
          </span>
          <div className="w-full h-px bg-[#333333]"></div>
          <span className="text-transparent bg-clip-text" style={{ WebkitTextStroke: "1px #CDEA68" }}>
            PEOPLE
          </span>{" "}
          <span className="text-white">SAY ABOUT</span>
          <div className="w-full h-px bg-[#333333]"></div>
          <span className="text-white">TAPCLONE</span>
        </h2>
        <div className="w-full h-px bg-[#333333]"></div>
      </div>

      {/* Testimonial cards */}
      <div className="mx-auto px-4 pt-12 pb-48">
        <img src={torn} className="absolute bottom-0 w-full" alt="torn paper effect"/>
        <div className="max-w-7xl w-full relative mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-10">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className="relative"
              ref={el => {
                if (el) cardsRef.current[index] = el;
              }}
            >
              <div className="bg-lite-green rounded-lg overflow-hidden">
                <div className="bg-black m-6 rounded-lg overflow-hidden">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={`${testimonial.name}'s portrait`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-10 pb-5 flex justify-between items-center">
                  <h3 className="text-black text-xl font-medium">{testimonial.name}</h3>
                  <button
                    onClick={() => toggleExpand(testimonial.id)}
                    className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-sm"
                  >
                    <span className="text-xl">{expandedId === testimonial.id ? "−" : "+"}</span>
                  </button>
                </div>

                {/* Expanded testimonial */}
                {expandedId === testimonial.id && (
                  <div className="p-4 pt-0 text-black">
                    <p>{testimonial.testimonial}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}