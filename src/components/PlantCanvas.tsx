import { useEffect, useRef, useState } from 'react';

type Branch = {
  startX: number;
  startY: number;
  length: number;
  angle: number;
  branchWidth: number;
  depth: number;
  grown: number;
  finished: boolean;
};

type Seed = {
  x: number;
  y: number;
  vx: number;
  speed: number;
};

export function PlantCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const initialBudRef = useRef<HTMLDivElement | null>(null);
  const wateringRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const branchesRef = useRef<Branch[]>([]);
  const seedsRef = useRef<Seed[]>([]);
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const bud = initialBudRef.current;
    if (!canvas || !bud) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);

      branchesRef.current.forEach((branch) => {
        branch.grown = Math.min(branch.length, branch.grown + branch.length / 150);
        context.lineWidth = branch.branchWidth;
        context.strokeStyle = '#8fb996';
        context.beginPath();
        context.moveTo(branch.startX, branch.startY);
        context.lineTo(
          branch.startX + Math.sin((branch.angle * Math.PI) / 180) * -branch.grown,
          branch.startY + Math.cos((branch.angle * Math.PI) / 180) * -branch.grown,
        );
        context.stroke();

        if (branch.grown >= branch.length && !branch.finished && branch.depth > 0) {
          branch.finished = true;
          const childCount = Math.floor(Math.random() * 2) + 2;
          for (let index = 0; index < childCount; index += 1) {
            branchesRef.current.push({
              startX: branch.startX + Math.sin((branch.angle * Math.PI) / 180) * -branch.length,
              startY: branch.startY + Math.cos((branch.angle * Math.PI) / 180) * -branch.length,
              length: branch.length * (0.9 + Math.random() * 0.2),
              angle: branch.angle + (Math.random() * 60 - 30),
              branchWidth: branch.branchWidth * 0.75,
              depth: branch.depth - 1,
              grown: 0,
              finished: false,
            });
          }

          if (branch.depth <= 2 && Math.random() > 0.6) {
            const seedX =
              branch.startX + Math.sin((branch.angle * Math.PI) / 180) * -branch.length * 0.75;
            const seedY =
              branch.startY + Math.cos((branch.angle * Math.PI) / 180) * -branch.length * 0.75;
            seedsRef.current.push({
              x: seedX,
              y: seedY,
              vx: Math.random() * 2 - 1,
              speed: Math.random() * 1 + 0.5,
            });
          }
        }
      });

      seedsRef.current = seedsRef.current.filter((seed) => {
        if (seed.y < rect.height) {
          seed.x += seed.vx;
          seed.y += seed.speed;
          context.fillStyle = '#d8b4e2';
          context.beginPath();
          context.arc(seed.x, seed.y, 2, 0, Math.PI * 2);
          context.fill();
          return true;
        }

        if (branchesRef.current.length < 120 && Math.random() < 0.02) {
          branchesRef.current.push({
            startX: seed.x,
            startY: rect.height,
            length: rect.height / 6,
            angle: 180 + (Math.random() * 30 - 15),
            branchWidth: 4,
            depth: 2,
            grown: 0,
            finished: false,
          });
        }
        return false;
      });

      animationFrameRef.current = window.requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animationFrameRef.current = window.requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      branchesRef.current = [];
      seedsRef.current = [];
    };
  }, []);

  const startGrowth = () => {
    if (animationStarted) return;
    const canvas = canvasRef.current;
    const bud = initialBudRef.current;
    const watering = wateringRef.current;
    if (!canvas || !bud || !watering) return;

    setAnimationStarted(true);

    // Start pouring animation immediately
    watering.classList.add('no-hover', 'pouring');

    // Delay the actual growth by 1 second so the watering animation plays first
    window.setTimeout(() => {
      const budRect = bud.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const startX = budRect.left - canvasRect.left + budRect.width / 2;
      const startY = budRect.top - canvasRect.top + budRect.height / 2 + 5;
      const cssCanvasHeight = canvasRect.height;

      // Main upward-growing tree (angle 0 = UP in canvas coords)
      branchesRef.current.push({
        startX,
        startY,
        length: cssCanvasHeight / 7.5,
        angle: 0,
        branchWidth: 10,
        depth: 7,
        grown: 0,
        finished: false,
      });

      // Root going downward (angle 180 = DOWN), depth 0 so no sub-branches
      const rootLength = Math.max(cssCanvasHeight - startY, 50);
      branchesRef.current.push({
        startX,
        startY,
        length: rootLength,
        angle: 180,
        branchWidth: 10,
        depth: 0,
        grown: 0,
        finished: false,
      });
    }, 1000);

    // Fade out watering can after pouring
    window.setTimeout(() => {
      watering.classList.remove('pouring');
      watering.classList.add('fade-out');
      bud.style.opacity = '0';
      window.setTimeout(() => {
        watering.style.display = 'none';
        bud.style.display = 'none';
      }, 1000);
    }, 2500);
  };

  return (
    <div className="plant-scene">
      <canvas id="plantCanvas" ref={canvasRef} suppressHydrationWarning></canvas>
      <div>
        <div
          className="watering-container"
          ref={wateringRef}
          role="button"
          tabIndex={0}
          onClick={startGrowth}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              startGrowth();
            }
          }}
        >
          <div className="watering-can">
            <div className="watering-can-body"></div>
            <div className="watering-can-spout"></div>
            <div className="watering-can-handle"></div>
            <div className="watering-can-water-drops">
              <div className="watering-can-drop"></div>
              <div className="watering-can-drop"></div>
              <div className="watering-can-drop"></div>
            </div>
          </div>
        </div>
        <div id="initialBud" ref={initialBudRef}></div>
      </div>
    </div>
  );
}
