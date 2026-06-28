"use client";

import Link from "next/link";

export function BreadcrumbsDefault({ items = [] }) {
  return (
    <nav className="flex text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center">
            {index > 0 && <span className="mx-2">/</span>}
            {isLast || !item.path ? (
              <span className="text-gray-800 font-medium">{item.name}</span>
            ) : (
              <Link href={item.path} className="hover:text-blue-600 transition-colors">
                {item.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
