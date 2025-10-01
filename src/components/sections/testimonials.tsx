"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Testimonials = () => {
  const sectionRef = useRef(null);

  const testimonials = [
    {
      name: "John Smith",
      role: "Business Executive",
      rating: 5,
      comment: "Excellent service and amazing cars! The booking process was seamless and the vehicle exceeded my expectations. Highly recommended for anyone looking for premium car rentals.",
      initials: "JS",
    },
    {
      name: "Sarah Johnson",
      role: "Travel Blogger",
      rating: 5,
      comment: "Professional staff and premium vehicles. Great experience from start to finish! The attention to detail and customer service made my trip absolutely perfect.",
      initials: "SJ",
    },
    {
      name: "Mike Wilson",
      role: "Entrepreneur",
      rating: 5,
      comment: "Best car rental service in town. The fleet is impressive and well-maintained. Will definitely use again for all my future car rental needs.",
      initials: "MW",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".testimonial-card", {
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="testimonials" className="py-20 bg-secondary/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            What Our <span className="text-primary">Customers Say</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what our satisfied customers have to say about their experience with CarZone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="testimonial-card group bg-card p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-border relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-primary/10 group-hover:text-primary/20 transition-colors">
                <Quote className="h-12 w-12" />
              </div>

              {/* Rating */}
              <div className="flex mb-4 relative z-10">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-accent fill-current"
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                &ldquo;{testimonial.comment}&rdquo;
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 relative z-10">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-lg text-muted-foreground">
            Join thousands of satisfied customers and experience the CarZone difference today!
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
