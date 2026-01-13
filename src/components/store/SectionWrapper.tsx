import { motion, Variants } from "framer-motion";
import { ReactNode, useMemo } from "react";
import { StoreSection, AnimationType, BACKGROUND_COLORS } from "@/types/storeLayout";

interface SectionWrapperProps {
  section: StoreSection;
  children: ReactNode;
  primaryColor?: string;
  className?: string;
}

const getAnimationVariants = (animation: AnimationType, duration: number = 0.5): Variants => {
  const baseTransition = { duration };
  
  switch (animation) {
    case 'fade':
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: baseTransition }
      };
    case 'slide-up':
      return {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: baseTransition }
      };
    case 'slide-down':
      return {
        hidden: { opacity: 0, y: -40 },
        visible: { opacity: 1, y: 0, transition: baseTransition }
      };
    case 'slide-left':
      return {
        hidden: { opacity: 0, x: 40 },
        visible: { opacity: 1, x: 0, transition: baseTransition }
      };
    case 'slide-right':
      return {
        hidden: { opacity: 0, x: -40 },
        visible: { opacity: 1, x: 0, transition: baseTransition }
      };
    case 'zoom':
      return {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: baseTransition }
      };
    case 'bounce':
      return {
        hidden: { opacity: 0, y: 40 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          } 
        }
      };
    default:
      return {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
      };
  }
};

const getBackgroundStyle = (
  settings: Record<string, any>, 
  primaryColor: string
): React.CSSProperties => {
  const bgValue = settings.backgroundColor || 'transparent';
  const opacity = settings.bgOpacity || 10;
  
  // Find predefined color
  const predefinedColor = BACKGROUND_COLORS.find(c => c.value === bgValue);
  
  let backgroundColor = 'transparent';
  
  if (bgValue === 'custom' && settings.customBgColor) {
    backgroundColor = settings.customBgColor;
  } else if (bgValue === 'primary-light') {
    backgroundColor = `${primaryColor}${Math.round(opacity * 2.55).toString(16).padStart(2, '0')}`;
  } else if (predefinedColor && predefinedColor.color !== 'primary-light' && predefinedColor.color !== 'custom') {
    backgroundColor = predefinedColor.color;
  }
  
  return { backgroundColor };
};

const getPatternStyle = (pattern: string): React.CSSProperties => {
  switch (pattern) {
    case 'dots':
      return {
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    case 'grid':
      return {
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    case 'diagonal':
      return {
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)',
      };
    default:
      return {};
  }
};

const getPaddingStyle = (padding: string): string => {
  switch (padding) {
    case 'none': return 'py-0';
    case 'compact': return 'py-4';
    case 'normal': return 'py-8';
    case 'relaxed': return 'py-12';
    case 'spacious': return 'py-16';
    default: return 'py-8';
  }
};

const getBorderStyle = (settings: Record<string, any>, primaryColor: string): React.CSSProperties => {
  if (!settings.showBorder) return {};
  
  const borderStyles: Record<string, string> = {
    subtle: 'rgba(0,0,0,0.05)',
    medium: 'rgba(0,0,0,0.1)',
    strong: 'rgba(0,0,0,0.2)',
    primary: primaryColor,
  };
  
  return {
    border: `1px solid ${borderStyles[settings.borderStyle] || borderStyles.subtle}`,
  };
};

export const SectionWrapper = ({ 
  section, 
  children, 
  primaryColor = '#000000',
  className = ''
}: SectionWrapperProps) => {
  const { settings } = section;
  
  const animation = (settings.animation || 'slide-up') as AnimationType;
  const duration = settings.animationDuration || 0.5;
  const delay = settings.animationDelay || 0;
  
  const variants = useMemo(() => getAnimationVariants(animation, duration), [animation, duration]);
  
  const backgroundStyle = useMemo(
    () => getBackgroundStyle(settings, primaryColor), 
    [settings, primaryColor]
  );
  
  const patternStyle = useMemo(
    () => getPatternStyle(settings.backgroundPattern || 'none'),
    [settings.backgroundPattern]
  );
  
  const borderStyle = useMemo(
    () => getBorderStyle(settings, primaryColor),
    [settings, primaryColor]
  );
  
  const paddingClass = getPaddingStyle(settings.padding || 'normal');
  
  const combinedStyle: React.CSSProperties = {
    ...backgroundStyle,
    ...patternStyle,
    ...borderStyle,
    borderRadius: 'var(--store-radius, 12px)',
  };
  
  // Don't wrap with animation if animation is 'none'
  if (animation === 'none') {
    return (
      <div 
        className={`${paddingClass} ${className}`}
        style={combinedStyle}
      >
        {children}
      </div>
    );
  }
  
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={variants}
      transition={{ delay }}
      className={`${paddingClass} ${className}`}
      style={combinedStyle}
    >
      {children}
    </motion.div>
  );
};

export default SectionWrapper;
