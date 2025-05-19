import React from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import TestimonialsSlider from '../components/TestimonialsSlider';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';
// import LeadershipSection from '../components/LeadershipSection';
// import MissionSection from '../components/MissionSection';
// import ConsultationSection from '../components/ConsultationSection';

const Home: React.FC = () => {
  return (
    <Layout>
      <div>
        <Hero />
        {/* <MissionSection /> */}
        <Features />
        {/* <ConsultationSection /> */}
        <HowItWorks />
        {/* <LeadershipSection /> */}
        <TestimonialsSlider />
        <FAQ />
        <CTA />
      </div>
    </Layout>
  );
};

export default Home;
