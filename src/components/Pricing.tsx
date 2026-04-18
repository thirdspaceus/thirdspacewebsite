import React from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight, ArrowDown } from 'lucide-react';

const pricingPlans = [
  {
    name: 'Launchpad',
    price: '5,000',
    description: 'Perfect for startups looking to establish a strong visual foundation.',
    features: [
      'Visual Identity System',
      'Logo Design & Variations',
      'Typography & Color Palette',
      'Brand Style Guidelines',
      'Social Media Assets',
      '2-3 Weeks Delivery'
    ],
    cta: 'Start Branding',
    popular: false
  },
  {
    name: 'Pro',
    price: '12,000',
    description: 'High-end web experiences that convert and tell your brand story.',
    subtext: 'Upgrade from Launchpad for $7,500',
    features: [
      'Custom Web Design',
      'Framer / Webflow Development',
      'Motion & Interactions',
      'SEO Optimization',
      'CMS Integration',
      '4-6 Weeks Delivery'
    ],
    cta: 'Build My Site',
    popular: true
  },
  {
    name: 'Thirdspace Plan',
    price: '25,000',
    description: 'The complete package for brands ready to dominate their market.',
    subtext: 'Upgrade from Pro for $15,000',
    features: [
      'Full Brand Identity',
      'Premium Web Experience',
      'Custom Motion Systems',
      'Content Strategy',
      '3 Months Support',
      '8-12 Weeks Delivery'
    ],
    cta: 'Partner with Us',
    popular: false
  }
];

export const Pricing = ({ onOpenQuote }: { onOpenQuote: () => void }) => {
  return (
    <section id="pricing" className="bg-brand-beige px-3 py-28 md:px-5 md:py-32">
      <div className="mx-auto w-full px-4 md:px-[40px] lg:px-[60px] max-w-[2048px]">
        <div className="mb-14 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-grey">[ Investment ]</span>
            <ArrowDown size={12} className="text-brand-grey/80" />
          </div>
          <h2 className="max-w-[14ch] text-[clamp(2.8rem,5vw,5rem)] leading-[0.92] tracking-[-0.08em] text-brand-dark">
            Transparent Pricing.<br />
            Because you deserve it<span className="text-brand-orange">.</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand-grey md:text-base">
            We believe in clear communication and fair value. Choose a plan that fits your current stage or reach out for a custom execution.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative flex flex-col rounded-[24px] border p-8 transition-transform duration-500 hover:-translate-y-2 lg:p-10 ${
                plan.popular 
                  ? 'bg-[#0f0c0a] border-[#1f1a18] shadow-[0_32px_64px_rgba(235,100,40,0.12)]' 
                  : 'bg-white border-black/5 shadow-xl hover:shadow-2xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 right-8 flex items-center justify-center rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-deep px-4 py-1.5 shadow-[0_8px_16px_rgba(235,100,40,0.3)]">
                  <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-white">Most Popular</span>
                </div>
              )}

              <div className="mb-8 flex flex-col gap-2">
                <h3 className={`text-2xl font-medium tracking-tight ${plan.popular ? 'text-white' : 'text-brand-dark'}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs leading-relaxed ${plan.popular ? 'text-white/60' : 'text-brand-grey'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className={`font-mono text-[11px] uppercase tracking-widest ${plan.popular ? 'text-white/40' : 'text-black/40'}`}>From</span>
                <span className={`text-[clamp(2.5rem,3vw,3.5rem)] font-medium leading-none tracking-[-0.05em] ${plan.popular ? 'text-white' : 'text-brand-dark'}`}>
                  ${plan.price}
                </span>
              </div>
              
              {'subtext' in plan && plan.subtext ? (
                <div className={`-mt-4 mb-8 text-xs font-medium uppercase tracking-widest font-mono ${plan.popular ? 'text-brand-orange' : 'text-brand-orange-deep'}`}>
                  {plan.subtext as string}
                </div>
              ) : null}

              <div className="mb-10 flex flex-1 flex-col gap-4">
                <span className={`font-mono text-[10px] uppercase tracking-[0.22em] ${plan.popular ? 'text-white/40' : 'text-black/40'}`}>
                  What's included
                </span>
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`flex h-4 w-4 flex-none items-center justify-center rounded-full ${plan.popular ? 'bg-brand-orange/20 text-brand-orange' : 'bg-black/5 text-brand-dark'}`}>
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <span className={`text-[13px] tracking-tight ${plan.popular ? 'text-white/80' : 'text-brand-dark/80'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={onOpenQuote}
                className={`group/btn flex items-center justify-center gap-2 rounded-[14px] px-6 py-4 font-mono text-[10px] uppercase tracking-[0.24em] transition-all duration-300 ${
                  plan.popular
                    ? 'bg-brand-offwhite text-brand-dark hover:bg-brand-orange hover:text-white hover:shadow-[0_0_20px_rgba(235,100,40,0.4)]'
                    : 'bg-[#f4f4f4] text-brand-dark hover:bg-brand-dark hover:text-white'
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowRight size={12} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
