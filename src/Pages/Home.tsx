import React from 'react';
import type { Page } from '../App';

import Hero from '../components/Hero';
import WhyChooseUs from '../components/WhyChooseUs';
import FloatingLetters from '../components/FloatingLetters';
import Navbar from "../components/Nave.tsx";

interface HomeProps {
    onNavigate: (page: Page) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    return (
        <div className="relative">
            <Navbar />
            <FloatingLetters />

            <Hero onNavigate={onNavigate} />

            <WhyChooseUs />

        </div>
    );
};

export default Home;
