import { useState, useRef, useEffect } from "react";
import Img from '../../assets/images/secondsecimg.png';
import video1 from '../../assets/videos/video1.mp4';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function TapcloneSection() {
  const [activeSocial, setActiveSocial] = useState("Facebook");
  const [showVideo, setShowVideo] = useState(false);  // New state for video visibility
  const [text, settext] = useState(true);  // New state for video visibility
  const tapcloneRef = useRef(null);
  const containerRef = useRef(null);
  const imageSectionRef = useRef(null);
  const videoRef = useRef(null);  // Ref for video element

  useEffect(() => {
    // Animation---timeline---

    if (!imageSectionRef.current  ) {
      console.error(" image Refs not available");
      return;
    }
    if (!tapcloneRef.current) {
      console.error(" tapclone Refs not available");
      return;
    }
    console.log("heloooooooooooooooooo")

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: imageSectionRef.current,
        start: "top bottom",
        end: "top top",
        scrub: true,
        markers: false, // Remove in production
        onUpdate: (self) => {
          // Calculate the scroll progress ..
          const progress = self.progress;
          console.log("Progress:", progress);
          if(progress > 0.3 && progress < 1.0){
            settext(false);
          }
          else{
            settext(true);
          }

          // Check if scroll is near the desired point (adjust as needed)
          if (progress > 0.9 && progress < 1.0) {
            setTimeout(() => { 
              setShowVideo(true);
              },[1000])
            if (videoRef.current) {
              videoRef.current.play().catch(error => {
                console.error("Error playing video:", error);
              });
            }
          } else {
            setShowVideo(false);
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }
        }
      }
    });

    // Make TAPCLONE stick to top and scale down
    tl.to(tapcloneRef.current, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, 17%) scale(0.5)",
      fontSize: "4vw",
      zIndex: 100,
      ease: "power2.out",
      opacity: 1
    });

    // Handle when scrolling past the image section
    ScrollTrigger.create({
      trigger: imageSectionRef.current,
      start: "100% bottom",
      onEnter: () => gsap.to(tapcloneRef.current, { opacity: 0, duration: 3.5, ease: "power2.out" }),
      onLeaveBack: () => gsap.to(tapcloneRef.current, { opacity: 1, duration: 0.5 }),
      pin: true
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
      <div>
        <div 
          ref={tapcloneRef}
          className="w-[90vw] z-50 fixed left-1/2 top-[59%] -translate-x-1/2 -translate-y-1/2 origin-center"
        >
          <h1 className="text-[13vw] z-[999] font-medium text-center bg-gradient-to-b from-gray-300 to-gray-500 text-transparent bg-clip-text font-monument select-none">
            TAPCLONE
          </h1>
        </div>
      </div>

      <div className="sticky top-0 h-auto" ref={containerRef}>
        <div className="relative w-full h-screen bg-black text-white flex flex-col justify-between px-20 py-8">
          {/* Top tagline */}
          <div className="mt-24 md:mt-40 z-10">
           {text && (
            <h2 className="text-xl md:text-3xl font-light">
              A good start is the best <br className="md:block hidden"/> recipe for <span className="text-lite-green">success</span>.
            </h2>)} 
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-[15%] w-full md:pr-36 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end z-10 mt-auto">
              {/* Social media links */}
              <div className="bg-lite-green text-black rounded-lg px-2 py-2 flex items-center space-x-4 mb-6 md:mb-0">
                <button
                  className={`px-3 py-2 rounded-lg ${activeSocial === "Facebook" ? "bg-black text-white" : ""}`}
                  onClick={() => setActiveSocial("Facebook")}
                >
                  Facebook
                </button>
                <button
                  className={`px-3 py-2 rounded-lg ${activeSocial === "Instagram" ? "bg-black text-white" : ""}`}
                  onClick={() => setActiveSocial("Instagram")}
                >
                  Instagram
                </button>
                <button
                  className={`px-3 py-2 rounded-lg ${activeSocial === "X" ? "bg-black text-white" : ""}`}
                  onClick={() => setActiveSocial("X")}
                >
                  X
                </button>
              </div>

              {/* Right side text */}
              <div className="max-w-xs md:max-w-xs">
                <p className="text-sm md:text-base font-light">
                  In today's fast-paced digital world, your<br className="md:block hidden"/> brand deserves more than just visibility—it<br className="md:block hidden"/> deserves impact! at
                  [your company name]
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={imageSectionRef}   
        className="relative w-full py-2 h-screen text-black z-0"
      >

        <div className="absolute inset-0 z-0">
          <img src={Img} alt="Background"  className="object-cover w-full" priority />
        </div>


        {showVideo && (
          <video
            ref={videoRef}
            src={video1}
            autoPlay
            muted
            loop
            className="absolute w-full h-full object-cover"
          />
        )}

    

      </div>
    </>
  );
}