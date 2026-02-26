/**
 * GLWA 투명 UI(Glassmorphism) 컴포넌트 라이브러리
 * 원칙: 투명함이 곧 럭셔리함의 끝
 * 모든 기능과 버튼에 투명 감성 이식
 */

import React from "react";
import { motion } from "framer-motion";
import "../styles/glassmorphism-theme.css";

/* ============================================
   1. Glass Card Component
   ============================================ */

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  onClick,
  hoverEffect = true,
}) => {
  return (
    <motion.div
      className={`glass-card ${className}`}
      onClick={onClick}
      whileHover={hoverEffect ? { scale: 1.02 } : {}}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

/* ============================================
   2. Hologram Button Component
   ============================================ */

export interface HologramButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  glowPulse?: boolean;
}

export const HologramButton: React.FC<HologramButtonProps> = ({
  children,
  onClick,
  className = "",
  disabled = false,
  glowPulse = true,
}) => {
  return (
    <motion.button
      className={`hologram-button ${glowPulse ? "glow-pulse" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  );
};

/* ============================================
   3. Glass Bar Component (Progress Bar)
   ============================================ */

export interface GlassBarProps {
  percentage: number;
  label?: string;
  className?: string;
}

export const GlassBar: React.FC<GlassBarProps> = ({
  percentage,
  label,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <span className="text-sm text-gold-light">{label}</span>}
      <div className="glass-bar">
        <motion.div
          className="glass-bar::after"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background:
              "linear-gradient(90deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.6))",
            borderRadius: "8px",
          }}
        />
      </div>
      <span className="text-xs text-gold-muted">{percentage.toFixed(0)}%</span>
    </div>
  );
};

/* ============================================
   4. Glass Modal Component
   ============================================ */

export interface GlassModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="glass-modal-backdrop"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`glass-modal ${className}`}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {title && (
          <h2 className="text-xl font-bold text-gold mb-4">{title}</h2>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
};

/* ============================================
   5. Glass Input Component
   ============================================ */

export interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  icon,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm text-gold-light">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-3 text-gold-muted">{icon}</div>}
        <input
          className={`glass-input ${icon ? "pl-10" : ""} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

/* ============================================
   6. Glass Dashboard Grid
   ============================================ */

export interface GlassDashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassDashboardGrid: React.FC<GlassDashboardGridProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`dashboard-glass-grid ${className}`}>{children}</div>
  );
};

/* ============================================
   7. Glass Dashboard Card
   ============================================ */

export interface GlassDashboardCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export const GlassDashboardCard: React.FC<GlassDashboardCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend = "neutral",
  className = "",
}) => {
  const trendColor = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-gold",
  }[trend];

  return (
    <GlassCard className={`dashboard-glass-card ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gold-muted uppercase tracking-wide">
            {title}
          </p>
          <p className={`text-2xl font-bold mt-2 ${trendColor}`}>
            {value}
            {unit && <span className="text-sm ml-1">{unit}</span>}
          </p>
        </div>
        {icon && <div className="text-gold text-2xl">{icon}</div>}
      </div>
    </GlassCard>
  );
};

/* ============================================
   8. Glass Badge Component
   ============================================ */

export interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  const variantClass = {
    default: "glass-badge",
    success: "glass-badge bg-green-900/20 border-green-500/30 text-green-300",
    warning: "glass-badge bg-yellow-900/20 border-yellow-500/30 text-yellow-300",
    danger: "glass-badge bg-red-900/20 border-red-500/30 text-red-300",
  }[variant];

  return <span className={`${variantClass} ${className}`}>{children}</span>;
};

/* ============================================
   9. Glass Text Overlay Component
   ============================================ */

export interface GlassTextOverlayProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassTextOverlay: React.FC<GlassTextOverlayProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`glass-text-overlay ${className}`}>{children}</div>
  );
};

/* ============================================
   10. Glass Divider Component
   ============================================ */

export const GlassDivider: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return <div className={`glass-divider ${className}`} />;
};

/* ============================================
   11. Glass Container (Wrapper)
   ============================================ */

export interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  blur?: "light" | "medium" | "heavy";
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  className = "",
  blur = "medium",
}) => {
  const blurClass = {
    light: "backdrop-blur-sm",
    medium: "backdrop-blur-md",
    heavy: "backdrop-blur-lg",
  }[blur];

  return (
    <div
      className={`bg-black/10 ${blurClass} rounded-lg border border-gold/10 ${className}`}
    >
      {children}
    </div>
  );
};

export default {
  GlassCard,
  HologramButton,
  GlassBar,
  GlassModal,
  GlassInput,
  GlassDashboardGrid,
  GlassDashboardCard,
  GlassBadge,
  GlassTextOverlay,
  GlassDivider,
  GlassContainer,
};
