"use client";

import { useEffect, useRef, type RefObject } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  seedX: number;
  seedY: number;
  wanderForce: number;
  wanderSpeedX: number;
  wanderSpeedY: number;
  maxSpeed: number;
};

interface HeroParticleFieldProps {
  containerRef: RefObject<HTMLElement | null>;
  reducedMotion?: boolean;
}

function createParticles(width: number, height: number) {
  const area = width * height;
  const particleCount = Math.max(90, Math.min(240, Math.floor(area / 4300)));
  const particles: Particle[] = [];

  for (let index = 0; index < particleCount; index += 1) {
    const radius = Math.random() * 5.8 + 1;
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius,
      alpha: Math.random() * 0.32 + 0.18,
      seedX: Math.random() * Math.PI * 2,
      seedY: Math.random() * Math.PI * 2,
      wanderForce: Math.random() * 0.055 + 0.018,
      wanderSpeedX: Math.random() * 0.0012 + 0.00035,
      wanderSpeedY: Math.random() * 0.0014 + 0.00045,
      maxSpeed: Math.random() * 0.9 + 0.6,
    });
  }

  return particles;
}

export function HeroParticleField({
  containerRef,
  reducedMotion = false,
}: HeroParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number | null>(null);
  const themeRef = useRef<"dark" | "light">("dark");
  const pointerRef = useRef({
    active: false,
    x: 0,
    y: 0,
    radius: 170,
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const drawParticles = (width: number, height: number) => {
      const isLight = themeRef.current === "light";

      context.clearRect(0, 0, width, height);

      for (const particle of particlesRef.current) {
        const glowRadius = particle.radius * (isLight ? 4.8 : 5.8);
        const gradient = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          glowRadius
        );

        if (isLight) {
          gradient.addColorStop(
            0,
            `rgba(28, 173, 133, ${particle.alpha * 0.8})`
          );
          gradient.addColorStop(
            0.45,
            `rgba(75, 195, 152, ${particle.alpha * 0.28})`
          );
          gradient.addColorStop(1, "rgba(75, 195, 152, 0)");
        } else {
          gradient.addColorStop(0, `rgba(26, 255, 182, ${particle.alpha})`);
          gradient.addColorStop(
            0.45,
            `rgba(0, 214, 153, ${particle.alpha * 0.35})`
          );
          gradient.addColorStop(1, "rgba(0, 214, 153, 0)");
        }

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = isLight
          ? `rgba(12, 120, 96, ${particle.alpha * 0.9})`
          : `rgba(171, 255, 229, ${particle.alpha})`;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
    };

    const setThemeFromDom = () => {
      themeRef.current =
        document.documentElement.dataset.theme === "light" ? "light" : "dark";
    };

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = createParticles(rect.width, rect.height);
      drawParticles(rect.width, rect.height);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current.active = true;
      pointerRef.current.x = event.clientX - rect.left;
      pointerRef.current.y = event.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    const themeObserver = new MutationObserver(() => {
      setThemeFromDom();
      const { width, height } = container.getBoundingClientRect();
      drawParticles(width, height);
    });

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    const render = (time: number) => {
      const { width, height } = container.getBoundingClientRect();
      const padding = 26;

      for (const particle of particlesRef.current) {
        const driftX =
          Math.cos(time * particle.wanderSpeedX + particle.seedX) *
          particle.wanderForce;
        const driftY =
          Math.sin(time * particle.wanderSpeedY + particle.seedY) *
          particle.wanderForce;

        particle.vx += driftX;
        particle.vy += driftY;

        if (pointerRef.current.active && !reducedMotion) {
          const dx = particle.x - pointerRef.current.x;
          const dy = particle.y - pointerRef.current.y;
          const distance = Math.hypot(dx, dy);

          if (distance < pointerRef.current.radius) {
            const force =
              ((pointerRef.current.radius - distance) /
                pointerRef.current.radius) *
              (themeRef.current === "light" ? 1.55 : 1.85);
            const angle = Math.atan2(dy, dx);
            particle.vx +=
              Math.cos(angle) * force * (particle.radius * 0.46 + 1.2);
            particle.vy +=
              Math.sin(angle) * force * (particle.radius * 0.46 + 1.2);
          }
        }

        const speed = Math.hypot(particle.vx, particle.vy);
        if (speed > particle.maxSpeed) {
          particle.vx = (particle.vx / speed) * particle.maxSpeed;
          particle.vy = (particle.vy / speed) * particle.maxSpeed;
        }

        particle.vx *= 0.985;
        particle.vy *= 0.985;
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -padding) {
          particle.x = width + padding;
        } else if (particle.x > width + padding) {
          particle.x = -padding;
        }

        if (particle.y < -padding) {
          particle.y = height + padding;
        } else if (particle.y > height + padding) {
          particle.y = -padding;
        }
      }

      drawParticles(width, height);

      frameRef.current = window.requestAnimationFrame(render);
    };

    setThemeFromDom();
    resizeCanvas();
    resizeObserver.observe(container);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    if (!reducedMotion) {
      container.addEventListener("pointermove", handlePointerMove);
      container.addEventListener("pointerleave", handlePointerLeave);
      frameRef.current = window.requestAnimationFrame(render);
    }

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      resizeObserver.disconnect();
      themeObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [containerRef, reducedMotion]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-95"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_30%)]" />
    </div>
  );
}
