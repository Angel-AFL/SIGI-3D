import {
  AmbientLight,
  BufferGeometry,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import type { ModelDimensions } from "@/types/viewer";

export interface ParsedStl {
  geometry: BufferGeometry;
  dimensions: ModelDimensions;
}

export function parseStl(buffer: ArrayBuffer): ParsedStl {
  const geometry = new STLLoader().parse(buffer);
  geometry.computeBoundingBox();

  const box = geometry.boundingBox;
  const dimensions: ModelDimensions = box
    ? {
        x: box.max.x - box.min.x,
        y: box.max.y - box.min.y,
        z: box.max.z - box.min.z,
      }
    : { x: 0, y: 0, z: 0 };

  return { geometry, dimensions };
}

export function generateThumbnail(
  source: BufferGeometry,
  size = 512,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    let renderer: WebGLRenderer | null = null;

    try {
      renderer = new WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(size, size, false);
      renderer.setPixelRatio(1);

      const scene = new Scene();
      const geometry = source.clone();
      geometry.center();
      geometry.computeBoundingSphere();

      const material = new MeshStandardMaterial({
        color: "#94a3b8",
        metalness: 0.15,
        roughness: 0.75,
      });

      scene.add(new Mesh(geometry, material));
      scene.add(new AmbientLight("#ffffff", 1.4));

      const keyLight = new DirectionalLight("#ffffff", 2.2);
      keyLight.position.set(1, 2, 1.5);
      scene.add(keyLight);

      const radius = geometry.boundingSphere?.radius ?? 1;
      const camera = new PerspectiveCamera(45, 1, radius / 100, radius * 100);
      const distance = radius * 2.8;
      camera.position.set(distance, distance * 0.85, distance);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);

      renderer.domElement.toBlob(
        (blob) => {
          material.dispose();
          geometry.dispose();
          renderer?.dispose();
          resolve(blob);
        },
        "image/png",
        0.9,
      );
    } catch {
      renderer?.dispose();
      resolve(null);
    }
  });
}
