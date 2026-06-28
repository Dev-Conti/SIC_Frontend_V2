import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DropdownText({ options = [], onSelect, selectedOption, className }) {
  const [selected, setSelected] = useState(selectedOption || options[0] || "");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelected(selectedOption || options[0] || "");
  }, [selectedOption, options]);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative inline-block text-left w-full ${className}`} ref={dropdownRef}>
      <div
        className="flex items-center justify-between w-full cursor-pointer px-4 py-2"
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: isOpen ? "black" : "", backgroundColor: isOpen ? "inherit" : "" }}
      >
        <span className="text-lg font-semibold">{selected}</span>
        <ChevronDown className="w-5 h-5 transition-transform" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 w-full bg-white border rounded-lg shadow-lg z-50"
            style={{ color: "black" }}
          >
            {options.map((option, index) => (
              <div
                key={index}
                className={`px-4 py-2 cursor-pointer text-lg ${option === selected ? "font-semibold bg-gray-200" : "hover:bg-gray-100"}`}
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
