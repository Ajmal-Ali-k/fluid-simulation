import React, { useRef } from 'react'
import SimulationHeader from '../components/SimulationHeader'
import FluidSimulation from '../components/FluidSimulation'
import SimulationControls from '../components/SimulationControls'
import Navbar from '../components/home/Navbar'
import Layout from '../components/layout/Layout'
import Banner from '../components/home/Banner'
import AboutSection from '../../../tapclone-react/client/src/Components/User/Home/About'
import Testimonials from '../../../tapclone-react/client/src/Components/User/Home/Testimonials'
import Service from '../../../tapclone-react/client/src/Components/User/Home/Service'
import ContactForm from '../../../tapclone-react/client/src/Components/User/Home/Contact'
import LatestProjects from '../../../tapclone-react/client/src/Components/User/Home/Project'

const Home = () => {
    const simulationRef = useRef(null);
    return (
        <Layout>
            <div className='app'>
                <SimulationHeader />
                <Banner />
                <AboutSection />
                <Testimonials />
                <Service/>
                <ContactForm/>
                <LatestProjects/>
                <FluidSimulation ref={simulationRef} />
                {/* <SimulationControls simulation={simulationRef.current} /> */}
            </div>
        </Layout>
    )
}

export default Home