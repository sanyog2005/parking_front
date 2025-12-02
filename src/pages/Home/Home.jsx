import React from 'react'
import Navbar from '../../components/Navbar/Navbar'
import HomeBanner from '../../components/HomeBanner/HomeBanner'
import HomeCars from '../../components/HomeCars/HomeCars'
import Testimonial from '../../components/Testimonial/Testimonial'
import Footer from '../../components/Footer/Footer'

const Home = () => {
  return (
    <div>
      <Navbar/>
      <HomeBanner/>
      <HomeCars/>
      <Testimonial/>
      <Footer/>
    </div>
  )
}

export default Home

