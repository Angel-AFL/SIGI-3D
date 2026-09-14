"use client";

import {
  Component,
  Suspense,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Grid, OrbitControls, useProgress } from "@react-three/drei";
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { cn } from "@/lib/utils";

type Controls = ComponentRef<typeof OrbitControls>;

interface StlViewerProps {
  url: string;
  name: string;
  className?: string;
}

function SceneContent({ url, resetToken }: { url: string; resetToken: number }) {
  const source = useLoader(STLLoader, url);
  const { camera } = useThree();

  const geometry = useMemo(() => {
    const clone = source.clone();
    clone.center();
    clone.computeBoundingBox();
    clone.computeBoundingSphere();
    return clone;
  }, [source]);

  const radius = geometry.boundingSphere?.radius ?? 1;
  const floorY = geometry.boundingBox?.min.z ?? -radius;

  useLayoutEffect(() => {
    const distance = Math.max(radius * 2.4, 1);
    camera.position.set(distance, distance * 0.85, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, radius, resetToken]);

  return (
    <>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={geometry}>
          <meshStandardMaterial
            color="#a1a1aa"
            metalness={0.15}
            roughness={0.7}
          />
        </mesh>
      </group>
      <Grid
        args={[10, 10]}
        cellSize={radius / 8}
        cellThickness={0.6}
        cellColor="#a1a1aa"
        sectionSize={radius / 2}
        sectionThickness={1}
        sectionColor="#71717a"
        fadeDistance={radius * 14}
        fadeStrength={1}
        infiniteGrid
        position={[0, floorY, 0]}
      />

      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 10, 7]} intensity={1.5} />
      <directionalLight position={[-6, -4, -8]} intensity={0.4} />
    </>
  );
}

interface BoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

class StlErrorBoundary extends Component<
  BoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function StlViewer({ url, name, className }: StlViewerProps) {
  const [resetToken, setResetToken] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsRef = useRef<Controls>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { active } = useProgress();

  function zoomBy(factor: number) {
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }

    controls.object.position.multiplyScalar(factor);
    controls.update();
  }

  async function toggleFullscreen() {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
        return;
      }

      await element.requestFullscreen();
      setIsFullscreen(true);
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
  }

  const controlButton =
    "flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-white/90 text-zinc-600 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-[24rem] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-100 to-zinc-200 [&:fullscreen]:h-screen [&:fullscreen]:rounded-none dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950",
        className,
      )}
    >
      <StlErrorBoundary
        fallback={
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No se pudo cargar el modelo 3D.
          </div>
        }
      >
        <Canvas
          camera={{ position: [40, 34, 40], fov: 45, near: 0.01, far: 100000 }}
          dpr={[1, 2]}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <Suspense fallback={null}>
            <SceneContent url={url} resetToken={resetToken} />
          </Suspense>
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan
            enableZoom
            enableDamping
            dampingFactor={0.12}
          />
        </Canvas>
      </StlErrorBoundary>

      {active ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm dark:bg-zinc-950/40">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Cargando {name}…
          </span>
        </div>
      ) : null}

      <div className="absolute top-3 left-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setResetToken((value) => value + 1)}
          className={controlButton}
          aria-label="Reiniciar vista"
          title="Reiniciar vista"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(0.8)}
          className={controlButton}
          aria-label="Acercar"
          title="Acercar"
        >
          <ZoomIn className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(1.25)}
          className={controlButton}
          aria-label="Alejar"
          title="Alejar"
        >
          <ZoomOut className="size-4" aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={toggleFullscreen}
        className={cn(controlButton, "absolute top-3 right-3")}
        aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      >
        {isFullscreen ? (
          <Minimize2 className="size-4" aria-hidden="true" />
        ) : (
          <Maximize2 className="size-4" aria-hidden="true" />
        )}
      </button>

      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-zinc-500 backdrop-blur dark:bg-zinc-900/80 dark:text-zinc-400">
        Arrastra para rotar · rueda para zoom
      </p>
    </div>
  );
}
