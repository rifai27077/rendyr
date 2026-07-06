'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className="border border-custom-border bg-secondary/50 rounded-xl overflow-hidden transition-all duration-300 glow-hover"
          >
            <button
              onClick={() => toggle(faq.id)}
              className="flex items-center justify-between w-full p-5 text-left font-bold text-white hover:text-primary transition-colors focus:outline-none cursor-pointer"
            >
              <span className="text-sm sm:text-base">{faq.question}</span>
              <ChevronDown
                className={`h-5 w-5 text-primary transition-transform duration-300 shrink-0 ml-4 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div
                    className="px-5 pb-5 text-xs sm:text-sm text-muted-gray leading-relaxed border-t border-custom-border/30 pt-4"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
