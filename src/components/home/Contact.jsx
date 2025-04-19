import React from "react"
import { useState } from "react"
import { FaArrowRight } from "react-icons/fa";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    position: "",
    phone: "",
    email: "",
    request: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Add your form submission logic here
  }

  return (
    <div className="bg-black text-white min-h-screen p-8 flex flex-col justify-center relative ">
      <div className="max-w-7xl lg:px-20 w-full">
        {/* Contact Us Header */}
        <div className="mb-16">
          <span className="text-lite-green font-light text-sm tracking-wide">[ CONTACT US ]</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 text-xl md:text-2xl lg:text-5xl">
          {/* Name Line */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <label className="font-light">Hello! I'm</label>
            <div className="relative  w-[34%]  h-4 px-2">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full  border-b border-white/30 focus:border-lite-green outline-none pb-1 transition-colors h-10 px-2 "
                required
              />
              <span className="absolute top-2 left-[40%] text-xs text-white/90">[ YOUR NAME ]</span>
            </div>
            <label className="font-light">And I'm Contacting You </label>

          </div>

          {/* Company Line */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <label className="font-light"> From</label>
            <div className="relative flex- w-[34%]  px-2 h-4">
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/30 focus:border-lite-green outline-none pb-1 transition-colors h-10 "
              />
              <span className="absolute top-2 left-[30%]  text-xs text-white/90">[ TYPE COMPANY NAME ]</span>
            </div>
            <label className="font-light">As The</label>
            <div className="relative flex- w-[34%]  px-2 h-4 ">
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/30 focus:border-lite-green outline-none pb-1 transition-colors h-10 "
              />
              <span className="absolute top-2 left-[40%]  text-xs text-white/90">[ POSITION ]</span>
            </div>
          </div>

      
          {/* Phone Line */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <label className="font-light">My Phone Number Is</label>
            <div className="relative  w-[54%]  px-2 h-4">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/30 focus:border-lite-green outline-none pb-1 transition-colors h-10"
              />
              <span className="absolute top-2 left-[40%] text-xs text-white/90">[ PHONE ]</span>
            </div>
          </div>

          {/* Email Line */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <label className="font-light">And Email</label>
            <div className="relative  w-[34%]  px-2 h-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/30 focus:border-lite-green outline-none pb-1 transition-colors h-10"
                required
              />
              <span className="absolute top-2 left-[40%] text-xs text-white/90">[ EMAIL ]</span>
            </div>
            <label className="font-light">I'm Looking To Get Your</label>
          </div>

          {/* Request Line */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <label className="font-light">Help With</label>
            <div className="relative  w-[34%]  px-2 h-4">
              <input
                type="text"
                name="request"
                value={formData.request}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/30 focus:border-lite-green outline-none pb-1 transition-colors h-10"
                required
              />
              <span className="absolute top-2  left-[40%] text-xs text-white/90">[ REQUEST ]</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-8">
            <button
              type="submit"
              className="bg-lite-green text-lg text-black px-8 py-3 flex items-center gap-2 hover:bg-lite-green transition-colors"
            >
              <span>Send</span>
              <div className="bg-black p-1 ml-6">
              <FaArrowRight  className="text-white  text-sm"/>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

