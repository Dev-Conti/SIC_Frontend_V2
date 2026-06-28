import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InfoButton({ content, width = "48", maxHeight = "auto", hoverToOpen = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const infoRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverToOpen) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (hoverToOpen) {
      setIsOpen(false);
    }
  };

  return (
    <div
      className="relative inline-block"
      ref={infoRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => !hoverToOpen && setIsOpen(!isOpen)}
        className="p-1 text-gray-500 hover:text-gray-700"
      >
        <Info className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-full ml-2 p-2 bg-white border rounded-lg shadow-lg"
            style={{ width: `${width}px`, maxHeight: `${maxHeight}px`, overflowY: 'auto' }}
          >
            {typeof content === "string" ? <p className="text-sm text-gray-700">{content}</p> : content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
