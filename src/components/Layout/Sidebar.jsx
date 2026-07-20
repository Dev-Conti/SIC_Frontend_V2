"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiHelpCircle,
  FiLogOut,
} from "react-icons/fi";
import { Tooltip } from "@material-tailwind/react";
import { useAuth } from "@/context/AuthContext";
import DropdownText from "@/components/Buttons/DropdownText";
import SuportModal from "@/components/Modal/SuportModal";
import modules from "@/data/modules";

const Sidebar = ({ isCollapsed, toggleSidebar, className, sections, baseRoute }) => {
  const [activeMenu, setActiveMenu] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  const dropdownOptions = modules;

  const getDefaultDropdownOption = () => {
    const currentPath = window.location.pathname;
    const defaultOption = dropdownOptions.find(option => currentPath.startsWith(option.link));
    return defaultOption ? defaultOption.label : dropdownOptions[0].label;
  };

  const [selectedOption, setSelectedOption] = useState(getDefaultDropdownOption());

  const toggleMenu = (menu) => {
    setActiveMenu((prev) => (prev === menu ? "" : menu));
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setActiveMenu(""); // Fecha o menu ativo ao clicar fora
    }
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setSelectedOption(""); // Fecha o dropdown ao clicar fora
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option.label);
    window.location.href = option.link;
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      className={`${isCollapsed ? "w-16 min-w-[2rem]" : "w-64"
        } h-full transition-all duration-300 bg-sidebarBg text-sidebarText shadow-lg fixed top-0 left-0 flex flex-col z-50 ${className} ${isCollapsed ? "" : "shadow-[4px_0_15px_-5px_rgba(0,0,0,0.3)]"}`}
    >
      {/* Botão de Colapso */}
      <button
        className="absolute top-4 right-[-14px] w-7 h-7 bg-sidebarBg border border-sidebarBorder text-sidebarText rounded-full flex items-center justify-center hover:text-white"
        onClick={toggleSidebar}
      >
        <FiChevronLeft className={`transform ${isCollapsed ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`flex items-center gap-4 p-4 border-b border-sidebarBorder ${isCollapsed ? "justify-center" : ""
          }`}
      >
        {!isCollapsed && (
          <div>
            <p className="mt-2 font-bold">{user ? user.displayName : ""}</p>
            <p className="text-sm text-gray-300">{user ? user.jobTitle : ""}</p>
          </div>
        )}
      </div>

      {/* Dropdown Text */}
      {!isCollapsed && (
        <div className="p-3" ref={dropdownRef}>
          <DropdownText
            options={dropdownOptions.map(option => option.label)}
            selectedOption={selectedOption}
            onSelect={(label) => handleOptionSelect(dropdownOptions.find(option => option.label === label))}
            className="bg-sidebarBg text-sidebarText"
          />
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 p-3 space-y-6">
        {sections
          .map((section) => ({
            ...section,
            items: section.items.filter((item) => !item.hidden),
          }))
          .filter((section) => section.items.length > 0)
          .map((section, index) => (
          <div key={index}>
            <p
              className={`text-xs font-medium text-gray-400 uppercase ${isCollapsed ? "hidden" : "whitespace-nowrap"
                }`}
            >
              {section.label}
            </p>
            <ul className="mt-2 space-y-1">
              {section.items.map((item, idx) => (
                <li key={idx} className="relative">
                  {item.link ? (
                    <Tooltip content={isCollapsed ? item.label : ""} placement="right" className={`${isCollapsed ? "" : "opacity-0"}`}>
                      <a
                        href={item.link}
                        className={`flex items-center ${isCollapsed ? "justify-center" : "gap-4"
                          } w-full text-sm font-medium text-sidebarText hover:bg-sidebarHoverBg rounded-md p-2 whitespace-nowrap`}
                      >
                        {React.createElement(item.icon, { className: `text-xl ${isCollapsed ? "text-2xl" : ""}` })}
                        {!isCollapsed && <span>{item.label}</span>}
                      </a>
                    </Tooltip>
                  ) : (
                    <Tooltip content={isCollapsed ? item.label : ""} placement="right" className={`${isCollapsed ? "" : "opacity-0"}`}>
                      <button
                        className={`flex items-center ${isCollapsed ? "justify-center" : "gap-4"
                          } w-full text-sm font-medium text-sidebarText hover:bg-sidebarHoverBg rounded-md p-2 whitespace-nowrap`}
                        onClick={() => toggleMenu(item.label)}
                      >
                        {React.createElement(item.icon, { className: `text-xl ${isCollapsed ? "text-2xl" : ""}` })}
                        {!isCollapsed && <span>{item.label}</span>}
                      </button>
                    </Tooltip>
                  )}
                  {item.subItems && activeMenu === item.label && (
                    <div
                      className={`${isCollapsed
                        ? "absolute top-0 left-full ml-2 min-w-[8rem]"
                        : "mt-2 pl-6"
                        } bg-sidebarBg text-sidebarText shadow-lg rounded-lg p-4 z-40`}
                    >
                      <ul className="space-y-2">
                        {item.subItems.map((subItem, subIdx) => (
                          <li key={subIdx}>
                            <a
                              href={subItem.link}
                              className="flex items-center gap-4 text-sm text-gray-400 hover:bg-sidebarHoverBg rounded-md p-2 whitespace-nowrap"
                            >
                              {isCollapsed ? (
                                <span className="text-sidebarText">{subItem.label}</span>
                              ) : (
                                <span>{subItem.label}</span>
                              )}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>

              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Botões Fixados no Rodapé */}
      <div className="p-3 space-y-2 border-t border-sidebarBorder">
        <Tooltip content={isCollapsed ? "Ajuda" : ""} placement="right" className={`${isCollapsed ? "" : "opacity-0"}`}>
          <button
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-4"
              } w-full text-sm font-medium text-sidebarText hover:bg-sidebarHoverBg rounded-md p-2 whitespace-nowrap`}
            onClick={openModal}
          >
            <FiHelpCircle className={`text-xl ${isCollapsed ? "text-2xl" : ""}`} />
            {!isCollapsed && <span>Ajuda</span>}
          </button>
        </Tooltip>
        <Tooltip content={isCollapsed ? "Logout" : ""} placement="right" className={`${isCollapsed ? "" : "opacity-0"}`}>
          <button
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-4"
              } w-full text-sm font-medium text-sidebarText hover:bg-sidebarHoverBg rounded-md p-2 whitespace-nowrap`}
            onClick={logout}
          >
            <FiLogOut className={`text-xl ${isCollapsed ? "text-2xl" : ""}`} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </Tooltip>
      </div>

      {/* Modal de Suporte */}
      <SuportModal 
        isOpen={isModalOpen} 
        onRequestClose={closeModal} 
        userId={user ? user.id : null} 
        userName={user ? user.displayName : null} 
        userMail={user ? user.mail : null} 
        userPhone={user ? user.mobilePhone : null} 
        />
    </div>
  );
};

export default Sidebar;