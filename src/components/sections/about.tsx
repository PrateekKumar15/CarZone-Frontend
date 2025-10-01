"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Award, Users, Car, TrendingUp, Shield, Clock } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const About = () => {
  const sectionRef = useRef(null);

  const stats = [
    { icon: Car, value: "1000+", label: "Premium Vehicles" },
    { icon: Users, value: "50K+", label: "Happy Customers" },
    { icon: Award, value: "10+", label: "Years Experience" },
    { icon: TrendingUp, value: "98%", label: "Satisfaction Rate" },
  ];

  const features = [
    {
      icon: Shield,
      title: "Fully Insured",
      description: "All vehicles come with comprehensive insurance coverage",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer service for your convenience",
    },
    {
      icon: Award,
      title: "Best Quality",
      description: "Premium vehicles maintained to the highest standards",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-stat", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: {
          trigger: ".stats-grid",
          start: "top 85%",
        },
      });

      gsap.from(".about-feature", {
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-20 bg-background relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About <span className="text-primary">CarZone</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            With over 10 years of experience in the car rental industry, CarZone
            has established itself as the premier choice for luxury vehicle
            rentals. Our commitment to excellence and customer satisfaction sets
            us apart.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="about-stat bg-card rounded-xl p-6 text-center shadow-md border border-border hover:shadow-lg transition-all duration-300"
            >
              <stat.icon className="h-10 w-10 text-primary mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="about-feature group"
            >
              <div className="bg-card rounded-xl p-8 border border-border hover:border-primary transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
