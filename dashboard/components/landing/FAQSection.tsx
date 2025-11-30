'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// FAQ data - Add or edit FAQ items here
const FAQ_ITEMS = [
  {
    question: "What is Face Value?",
    answer:
      "Face Value is a fun, virtual stock exchange where you can trade 'stocks' of famous CEOs and tech founders. Think of it as a meme stock market — no real money involved, just pure entertainment and bragging rights!",
  },
  {
    question: "How does trading work?",
    answer:
      "We use a real order-book matching engine just like professional exchanges. You can place market orders (execute immediately at best price) or limit orders (set your own price). When a buy order matches a sell order, a trade happens!",
  },
  {
    question: "What's the virtual currency?",
    answer:
      "Everyone starts with virtual currency (FVC — Face Value Coins). You can use it to buy CEO stocks, and earn more by selling at higher prices. It's all for fun — no real money can be deposited or withdrawn.",
  },
  {
    question: "How are CEO stock prices determined?",
    answer:
      "Prices are determined purely by supply and demand. When more people want to buy a CEO, the price goes up. When more want to sell, it goes down. Each CEO has a 'Face Value' (base price) that serves as a reference.",
  },
  {
    question: "Can I lose my virtual money?",
    answer:
      "Yes, just like real trading! If you buy a stock and its price drops, your holdings lose value. But remember, it's all virtual — no real financial consequences.",
  },
  {
    question: "Is this open source?",
    answer:
      "Yes! Face Value is completely open source. Check out our GitHub repository to see the code, contribute, or even self-host your own instance.",
  },
];

// FAQ Item component
interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => {
  return (
    <div className="border-b border-white/10">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-left group cursor-pointer"
      >
        <span className="text-lg font-medium text-white group-hover:text-orange-500 transition-colors">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-gray-400 transition-transform duration-300",
            isOpen && "rotate-180 text-orange-500"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-96 pb-6" : "max-h-0"
        )}
      >
        <p className="text-gray-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

// FAQ Section
export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-black">
      <div className="max-w-3xl mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked <span className="text-orange-500">Questions</span>
          </h2>
          <p className="text-gray-400 text-xl">
            Everything you need to know about Face Value
          </p>
        </div>

        {/* FAQ Items */}
        <div className="border-t border-white/10">
          {FAQ_ITEMS.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
