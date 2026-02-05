import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

/**
 * Professional, calm therapy logo - Mindful Qalb
 * A heart with gentle curves symbolizing mental wellness and inner peace
 */
const Logo = ({ size = 'md', showText = true, className = '' }: LogoProps) => {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 40, text: 'text-xl' },
    lg: { icon: 56, text: 'text-2xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Logo Icon - Stylized heart with lotus/mindfulness element */}
      <motion.svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        className="flex-shrink-0"
      >
        {/* Background circle with subtle gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="50%" stopColor="#8B7EC8" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#8B7EC8" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Soft outer glow */}
        <circle cx="24" cy="24" r="22" fill="url(#logoGradient)" opacity="0.1" />
        
        {/* Main heart shape - stylized and calm */}
        <path
          d="M24 38C24 38 10 28 10 19C10 14.5 13.5 11 18 11C20.5 11 22.7 12.2 24 14C25.3 12.2 27.5 11 30 11C34.5 11 38 14.5 38 19C38 28 24 38 24 38Z"
          fill="url(#heartGradient)"
          filter="url(#softShadow)"
        />
        
        {/* Inner lotus/peace symbol - represents mindfulness */}
        <g opacity="0.9">
          {/* Center circle */}
          <circle cx="24" cy="22" r="3" fill="white" opacity="0.9" />
          
          {/* Lotus petals - simplified, calming design */}
          <ellipse cx="24" cy="18" rx="2" ry="3.5" fill="white" opacity="0.7" />
          <ellipse cx="20" cy="21" rx="2" ry="3" fill="white" opacity="0.6" transform="rotate(-30 20 21)" />
          <ellipse cx="28" cy="21" rx="2" ry="3" fill="white" opacity="0.6" transform="rotate(30 28 21)" />
        </g>
        
        {/* Subtle sparkle for hope/healing */}
        <circle cx="32" cy="16" r="1.5" fill="white" opacity="0.8" />
        <circle cx="34" cy="14" r="0.8" fill="white" opacity="0.6" />
      </motion.svg>

      {/* Text */}
      {showText && (
        <span className={`font-display ${text} font-semibold`}>
          <span className="bg-gradient-to-r from-lavender-700 to-lavender-600 bg-clip-text text-transparent">
            Mindful
          </span>
          <span className="text-gray-700">Qalb</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
