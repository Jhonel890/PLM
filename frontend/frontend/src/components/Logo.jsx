// frontend/src/components/Logo.jsx
import React from 'react';

const Logo = ({ className = "", size = "h-20" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 120"
      className={`${size} ${className} overflow-visible`}
      fill="none"
      role="img"
      aria-label="MIND RUSH Logo"
    >
      {/* 1. FONDO DE EXPLOSIÓN (Comic Burst) */}
      {/* Sombra de la explosión */}
      <path
        d="M280 60 L260 85 L290 110 L240 105 L220 130 L190 110 L160 135 L140 105 L100 130 L90 100 L50 115 L60 85 L20 80 L60 55 L30 30 L70 35 L80 10 L110 40 L140 10 L160 45 L200 15 L210 50 L250 20 L240 60 L280 60Z"
        fill="#212121"
        transform="translate(8, 8)"
        opacity="0.4"
      />
      
      {/* Cuerpo de la explosión (Amarillo Neón) */}
      <path
        d="M280 60 L260 85 L290 110 L240 105 L220 130 L190 110 L160 135 L140 105 L100 130 L90 100 L50 115 L60 85 L20 80 L60 55 L30 30 L70 35 L80 10 L110 40 L140 10 L160 45 L200 15 L210 50 L250 20 L240 60 L280 60Z"
        fill="#FFFF00" // Amarillo Neón
        stroke="#212121"
        strokeWidth="4"
        className="animate-pulse-slow origin-center"
      />

      {/* 2. GRUPO DE TEXTO (Rotado para dinamismo) */}
      <g transform="rotate(-3 150 60)">
        
        {/* --- PALABRA "MIND" (Arriba, Rosa) --- */}
        {/* Sombra dura */}
        <text
          x="40" y="55"
          fontFamily="Impact, Arial Black, sans-serif"
          fontSize="60"
          fontWeight="900"
          fill="#212121"
          transform="translate(4, 4)"
        >
          MIND
        </text>
        {/* Relleno */}
        <text
          x="40" y="55"
          fontFamily="Impact, Arial Black, sans-serif"
          fontSize="60"
          fontWeight="900"
          fill="#FF00FF" // Magenta Neón
          stroke="#212121"
          strokeWidth="3"
        >
          MIND
        </text>
        {/* Brillo interior (Detalle pro) */}
        <path d="M45 25 L55 25" stroke="white" strokeWidth="4" opacity="0.6" />
        <path d="M75 25 L85 25" stroke="white" strokeWidth="4" opacity="0.6" />


        {/* --- PALABRA "RUSH" (Abajo, Cyan, Desplazada) --- */}
        {/* Sombra dura */}
        <text
          x="100" y="95"
          fontFamily="Impact, Arial Black, sans-serif"
          fontSize="60"
          fontWeight="900"
          fill="#212121"
          transform="translate(4, 4)"
        >
          RUSH
        </text>
        {/* Relleno */}
        <text
          x="100" y="95"
          fontFamily="Impact, Arial Black, sans-serif"
          fontSize="60"
          fontWeight="900"
          fill="#00FFFF" // Cyan Neón
          stroke="#212121"
          strokeWidth="3"
        >
          RUSH
        </text>
        
        {/* 3. ELEMENTOS DECORATIVOS (Rayos de velocidad) */}
        <path 
          d="M260 40 L280 30 L270 50" 
          stroke="#212121" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round"
        />
        <path 
          d="M275 60 L290 55" 
          stroke="#212121" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round" 
        />
        
        {/* Rayo Cruzado (Sobre la letra U de Rush) */}
        <path
          d="M145 70 L135 100 L155 90"
          fill="#39FF14" // Verde Neón
          stroke="#212121"
          strokeWidth="2"
        />

      </g>
    </svg>
  );
};

export default Logo;