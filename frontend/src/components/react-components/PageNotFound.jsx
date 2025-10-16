import { RainbowButton } from "../ui/rainbow-button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

const PageNotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md text-center bg-gray-900/70 border-gray-800 shadow-lg backdrop-blur-lg">
          <CardHeader>
            <p className="text-indigo-400 text-sm font-semibold">404</p>
            <CardTitle className="text-4xl sm:text-5xl font-bold text-white mt-2">
              Page not found
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-gray-400 text-base mb-8">
              Sorry, we couldn’t find the page you’re looking for.
            </p>

            <RainbowButton
              asChild
              size="lg"
              className="bg-indigo-500 hover:bg-indigo-400 text-black"
            >
              <a href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4 text-black" />
                Go back home
              </a>
            </RainbowButton>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
};

export default PageNotFound;
