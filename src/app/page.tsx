'use client';
import { useContext, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import AuthContext from "@/hooks/auth-context";

export default function Home() {
  const controls = useAnimation();
  const { isLogged } = useContext(AuthContext);

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 1 }
    });
  }, []);

  if (!isLogged) return null;

  return (
    <main className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={controls}
        className="flex flex-col items-center justify-center h-screen"
      >
        <h1 className="text-4xl font-bold mb-4">Bienvenido</h1>
        <h2 className="text-2xl font-medium">A la tienda la bendición</h2>
      </motion.div>
    </main>
  );
}