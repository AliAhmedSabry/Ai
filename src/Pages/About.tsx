import React from 'react';
import { motion } from 'framer-motion';
import {Award, BookOpen, Globe, Users, Heart, Star, Rocket} from 'lucide-react';
import type { Page } from '../types/navigation'; // better to move Page to types folder
import Navbar from "../components/Nave.tsx";

interface AboutProps {
    onNavigate: (page: Page) => void;
}


const About: React.FC<AboutProps> = ({ onNavigate }) => {

    const achievements = [
        { icon: Users, number: '50,000+', label: 'Students Joined', color: 'from-blue-500 to-blue-600' },
        { icon: BookOpen, number: '15+', label: 'Years Experience', color: 'from-green-500 to-green-600' },
        { icon: Globe, number: '10+', label: 'Ai assistants', color: 'from-purple-500 to-purple-600' },
        { icon: Award, number: '98%', label: 'Success Rate', color: 'from-yellow-500 to-yellow-600' },
    ];

    const testimonials = [
        {
            name: 'Sarah Johnson',
            country: 'USA',
            text: 'Smart learning made simple. I understand more, study faster, and feel confident every day!',
            rating: 5
        },
        {
            name: 'Ahmed Ali',
            country: 'UK',
            text: 'AI-powered guidance transformed how I learn — no more confusion, just progress.',
            rating: 5
        },
        {
            name: 'Maria Rodriguez',
            country: 'Spain',
            text: 'From struggling with lessons to mastering them — this app changed the way I study!',
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">
                                Meet Ali El-hawashy
                            </h1>
                            <p className="text-2xl mb-6 text-blue-200">
                                <Rocket>

                                </Rocket>
                            </p>
                            <p className="text-xl leading-relaxed mb-8">
                                Hi, I’m Ali Ahmed, a passionate developer and lifelong learner.
                                I started my journey in Full-Stack Development in 2018, driven by curiosity and a love for building impactful digital solutions.

                                Over the years, I’ve focused on creating smart, modern applications that combine clean design with powerful functionality. My goal is simple: build technology that makes learning easier, smarter, and more productive.
                            </p>
                            <div className="flex items-center space-x-4">
                                <Heart className="w-6 h-6 text-red-400" />
                                <span className="text-lg">Passionate about Coding since 2018</span>
                            </div>
                        </motion.div>

                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div className="w-80 h-80 mx-auto bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                                <span className="text-8xl font-bold text-white">Ali</span>
                            </div>
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 px-6 py-3 rounded-lg shadow-lg">
                                <p className="font-semibold">Meet Ali El-hawashy</p>
                                <p className="text-sm text-blue-600 text-center"> passionate developer </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Achievements Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Website Excellence</h2>
                        <p className="text-xl text-gray-600">Numbers that speak for themselves</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {achievements.map((achievement, index) => (
                            <motion.div
                                key={index}
                                className="text-center"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <motion.div
                                    className={`w-24 h-24 bg-gradient-to-r ${achievement.color} rounded-full flex items-center justify-center mx-auto mb-6`}
                                    whileHover={{ scale: 1.1, rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <achievement.icon className="w-12 h-12 text-white" />
                                </motion.div>
                                <h3 className="text-4xl font-bold text-gray-900 mb-2">{achievement.number}</h3>
                                <p className="text-lg text-gray-600">{achievement.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">My Journey</h2>
                        <p className="text-2xl text-blue-600 mb-8" >Become a Sentiens</p>
                    </motion.div>

                    <motion.div
                        className="prose prose-lg mx-auto text-gray-600"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-xl leading-relaxed mb-6">
                            My journey with coding began in 2018 when I decided to step into the world of Full-Stack Development
                            . What started as curiosity quickly became a deep passion. I was fascinated by how simple lines of code could
                            turn into powerful applications that solve real-world problems.
                        </p>

                        <p className="text-xl leading-relaxed mb-6">
                            From the beginning, I focused on understanding both front-end and back-end development.
                            I learned how to design user-friendly interfaces, build responsive websites, and develop secure,
                            scalable server-side systems. Over the years, I worked on multiple projects that helped me strengthen my
                            problem-solving skills and think like a real developer — not just someone who writes code, but someone who builds solutions.
                        </p>

                        <p className="text-xl leading-relaxed mb-6">
                            Coding for me is not just a career — it is a mindset, a passion, and a lifelong journey of growth and innovation.
                        </p>

                        <div className="bg-blue-50 p-8 rounded-xl mt-12">
                            <blockquote className="text-2xl font-semibold text-blue-900 text-center mb-4">
                                "Once upon a time, learning was just memorizing. But as a Sentiens, you step into a new world — where curiosity meets intelligence and every challenge becomes a chance to grow. Guided by smart AI, you explore, understand, and create. Each lesson unlocks a new part of your potential, turning knowledge into action. Your journey as a Sentiens begins here — smarter, stronger, unstoppable."
                            </blockquote>
                            <p className="text-center text-blue-600 font-medium from-blue-600 to-indigo-600 ">- Ali El-hawashy</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">What Users Say</h2>
                        <p className="text-xl text-gray-600">Hear from our User community</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                className="bg-white rounded-xl shadow-lg p-8"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                                    <p className="text-sm text-blue-600">{testimonial.country}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
