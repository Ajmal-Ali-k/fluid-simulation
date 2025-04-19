export default function AboutSection() {
    return (
      <div className="bg-black text-white pt-16  px-8  flex flex-col justify-center relative">
        <div className="max-w-7xl mx-auto w-full">
          {/* About Us Link */}
          <div className="text-right mb-8">
            <a href="#" className="text-lite-green text-sm tracking-wide">
              [ ABOUT US ]
            </a>
          </div>
  
          {/* Heading */}
          <div className="relative mb-16 w-full ">
            <h1 className="text-4xl md:text-5xl font-light leading-tight">
              Straight Talk
              <br />
              Direct <span className="text-lite-green">Results</span>
            </h1>
          <div className="h-[0.3px] bg-lite-green  absolute bottom-[10%] w-[77%] right-0"></div>

          </div>
  
          {/* Divider Line */}

          <div className="flex md:w-full gap-8 pb-8">
            {/* Left side - Description */}
            <div className="md:w-[30%]">
            </div>
  
            {/* Right side - Stats */}
            <div className="md:w-[70%]">
            <div className="max-w-xs">
              <p className="text-2xl font-thin leading-tight">To Bring You Quality <br className="md:block hidden"/>Growth And The <br className="md:block hidden"/> Development Of Your  <br className="md:block hidden"/>Brand</p>
            </div>
            </div>
            
          </div>
  
          <div className="flex md:w-full gap-8 pt-10">
            {/* Left side - Description */}
            <div className="md:w-[30%]">
            </div>
  
            {/* Right side - Stats */}
            <div className="grid grid-cols-3 gap-4 md:w-[70%]">
              {/* Stat 1 */}
              <div className="text-start">
                <p className="text-5xl md:text-6xl font-light mb-2">
                  <span className="bg-gradient-to-b from-white to-lite-green text-transparent bg-clip-text font-medium">7</span>
                  <span className="bg-gradient-to-b from-white to-lite-green text-transparent bg-clip-text  font-medium ">+</span>
                </p>
                <p className="text-sm text-white font-light" >Years experience</p>
              </div>
  
              {/* Stat 2 */}
              <div className="text-start">
                <p className="text-5xl md:text-6xl font-light mb-2">
                  <span className="bg-gradient-to-b from-white to-lite-green text-transparent bg-clip-text  font-medium ">45</span>
                  <span className="bg-gradient-to-b from-white to-lite-green text-transparent bg-clip-text  font-medium ">+</span>
                </p>
                <p className="text-sm text-white font-light" >Clients</p>
              </div>
  
              {/* Stat 3 */}
              <div className="text-start">
                <p className="text-5xl md:text-6xl font-light mb-2">
                  <span className="bg-gradient-to-b from-white to-lite-green text-transparent bg-clip-text  font-medium ">50</span>
                  <span className="bg-gradient-to-b from-white to-lite-green text-transparent bg-clip-text  font-medium ">+</span>
                </p>
                <p className="text-sm text-white font-light" >Completed works</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }
  
  