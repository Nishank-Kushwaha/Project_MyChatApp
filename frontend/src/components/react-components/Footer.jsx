import { MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2 text-white font-semibold text-lg">
            <MessageCircle className="h-5 w-5 text-amber-500" />
            <span className="tracking-wide">ChatApp</span>
          </div>

          {/* Links (optional) */}
          <div className="flex gap-6 text-sm text-gray-400">
            <a
              href="#"
              className="hover:text-white transition-colors duration-200"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors duration-200"
            >
              Terms
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors duration-200"
            >
              Support
            </a>
          </div>

          {/* Social icons (optional) */}
          <div className="flex items-center gap-4 text-gray-400">
            <a
              href="#"
              className="hover:text-white transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.22 4.22 0 001.85-2.33 8.31 8.31 0 01-2.64 1.02A4.15 4.15 0 0015.5 4a4.18 4.18 0 00-4.15 4.15c0 .32.04.63.1.93A11.84 11.84 0 013 5.1a4.16 4.16 0 001.29 5.55 4.1 4.1 0 01-1.88-.52v.05a4.18 4.18 0 003.34 4.1 4.2 4.2 0 01-1.88.07 4.19 4.19 0 003.9 2.9A8.36 8.36 0 012 19.55 11.8 11.8 0 008.29 21c7.55 0 11.68-6.26 11.68-11.68v-.53A8.4 8.4 0 0022.46 6z" />
              </svg>
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.04c-5.52 0-10 4.48-10 10.01 0 4.42 3.58 8.09 8.2 8.94v-6.32h-2.47v-2.62h2.47v-2c0-2.44 1.46-3.78 3.68-3.78 1.07 0 2.18.2 2.18.2v2.4h-1.23c-1.21 0-1.58.76-1.58 1.54v1.85h2.68l-.43 2.62h-2.25V21c4.62-.85 8.2-4.52 8.2-8.95 0-5.53-4.48-10.01-10-10.01z" />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <p className="text-gray-500 text-sm text-center md:text-right">
            © {new Date().getFullYear()}{" "}
            <span className="text-white">ChatApp</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
