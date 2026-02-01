"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Hammer } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-800">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="size-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <span className="font-bold">D</span>
              </div>
              <span className="font-bold text-xl text-white">DDTEC</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Precision-crafted power tools for professionals who demand excellence. Built to last, engineered to perform.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-slate-900 rounded-full hover:bg-teal-600 hover:text-white transition-colors">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Explore</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/components/WhoWeAre" className="hover:text-teal-400 transition-colors">Who We Are</Link></li>
              <li><Link href="/components/WhatWeOffer" className="hover:text-teal-400 transition-colors">What We Offer</Link></li>
              <li><Link href="/#shop" className="hover:text-teal-400 transition-colors">Shop Tools</Link></li>
              <li><Link href="/components/Contact" className="hover:text-teal-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-6">Support</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="hover:text-teal-400 transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-teal-400 transition-colors">Warranty Info</Link></li>
              <li><Link href="#" className="hover:text-teal-400 transition-colors">Shipping & Returns</Link></li>
              <li><Link href="#" className="hover:text-teal-400 transition-colors">Product Manuals</Link></li>
            </ul>
          </div>

          {/* Newsletter (Simplified) */}
          <div>
            <h4 className="text-white font-semibold mb-6">Stay Updated</h4>
            <p className="text-slate-400 text-sm mb-4">Subscribe for latest tool launches.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email..."
                className="bg-slate-900 border border-slate-700 rounded-l-lg px-4 py-2 text-sm w-full outline-none focus:border-teal-500"
              />
              <button className="bg-teal-600 hover:bg-teal-700 px-4 rounded-r-lg text-white">
                <Hammer className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {currentYear} DDTEC. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
