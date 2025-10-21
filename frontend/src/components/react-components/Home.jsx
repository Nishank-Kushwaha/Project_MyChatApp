import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { ArrowRight } from "lucide-react";

export default function Home() {
  const { user, loginStatus } = useSelector((state) => state.user);
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-4">
      <main className="flex flex-col items-center justify-center text-center">
        {/* Main Heading with Gradient */}
        <h1 className="text-7xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
          Chat App
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl">
          Experience the future of conversation
        </p>

        {/* CTA Button */}
        <Link
          to={loginStatus ? "/chat" : "/login"}
          className="group px-8 py-4 bg-white text-black rounded-full font-semibold hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          Get Started
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </main>
    </div>
  );
}
