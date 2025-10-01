"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const footerLinks = {
    company: [
      { label: "About Us", href: "#about" },
      { label: "Our Fleet", href: "#cars" },
      { label: "Services", href: "#services" },
      { label: "Testimonials", href: "#testimonials" },
    ],
    services: [
      { label: "Car Rental", href: "/cars" },
      { label: "Long Term Lease", href: "#" },
      { label: "Airport Transfer", href: "#" },
      { label: "Corporate Solutions", href: "#" },
    ],
    support: [
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#contact" },
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
    ],
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Image
                                                          src="/logocar.png"
                                                          alt="CarZone Logo"
                                                          width={75}
                                                          height={40}
                                                          className="object-contain"
                                                        />
              </div>
              <span className="text-2xl font-bold text-foreground">
                CarZone
              </span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your premier destination for luxury car rentals. Experience the
              finest vehicles with exceptional service.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-muted-foreground"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Services
            </h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">info@carzone.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  123 Car Street, Auto City, AC 12345
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-secondary/20 rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-sm text-muted-foreground">
                Get the latest updates on new vehicles and exclusive offers
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="md:w-64"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Subscribe
              </Button>
            </div>
          </div>
        </motion.div>

        <Separator className="mb-8" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-muted-foreground text-sm">
            CarZone. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
