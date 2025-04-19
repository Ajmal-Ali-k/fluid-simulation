import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import { Autoplay,Navigation } from "swiper/modules";
import p1 from '../../assets/images/p1.png';
import p2 from '../../assets/images/p2.png';
import projectbg from '../../assets/images/projectbg.png';



export default function LatestProjects() {
  
  const projects = [
    {
      id: 1,
      title: "LANDSCAPE ARCHITECTURE",
      subtitle: "STUDIO",
      image: p1,
      tag: "THINKING DEPT",
    },
    {
      id: 2,
      title: "Empowering Businesses With Smart,",
      subtitle: "Scalable Logistics",
      image: p2,
      tag: "PHIVA",
    },
    {
      id: 3,
      title: "URBAN DEVELOPMENT",
      subtitle: "SOLUTIONS",
      image: p1,
      tag: "CITY PLANNERS",
    },
  ]

  return (
    <section className="relative py-20 overflow-hidden bg-black lg:px-20">
      {/* Background texture overlay */}
      {/* <div className="absolute inset-0 bg-[url('..')] opacity-20 mix-blend-overlay"></div> */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay">
        <img
          src={projectbg} // Update with your image path
          alt="Background texture"
          className="object-cover w-full"
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold text-white tracking-wide">LATEST PROJECTS</h2>
          <a href="#" className="text-lite-green hover:underline">
            [ OUR WORKS ]
          </a>
        </div>

        <Swiper
              slidesPerView={1}
              spaceBetween={20}
              loop={true}
              autoplay={{
                delay: 5000, // Adjust autoplay delay as needed
                disableOnInteraction: false,
              }}
              navigation={{
                prevEl: '.swiper-button-prevab',
                nextEl: '.swiper-button-nextcd',
              }}
              speed={1000} // Adjusts scrolling speed
             
              modules={[Autoplay,Navigation]}
              className="mySwiper"
            >
          {projects.map((project) => (
            <SwiperSlide key={project.id} class="h-full">
              <div className="relative overflow-hidden group ">
                {/* Project Image */}
                <div className=" inset-0 w-full h-full">
                  <img
                    src={project.image }
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

