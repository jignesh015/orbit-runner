import * as THREE from 'three';

export class Planet {
  mesh: THREE.Mesh;
  radius: number;
  
  private textureLoader = new THREE.TextureLoader();

  constructor(radius: number = 10) {
    this.radius = radius;
    this.textureLoader = new THREE.TextureLoader();

    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(
      radius,
      64, // width segments
      64  // height segments
    );
    
    const texture = this.textureLoader.load('/assets/earth_map.svg');

    // Create material with some visual interest
    const material = new THREE.MeshPhongMaterial({
        map: texture,
      color: 0xffffff,
      emissive: 0x0a4d0a,
      shininess: 100,
      flatShading: false,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  /**
   * Get the surface normal at a given world position on the sphere
   * The normal points outward from the sphere center
   */
  getNormalAtPosition(position: THREE.Vector3): THREE.Vector3 {
    // For a sphere, the normal at any point is just the normalized position vector
    return position.clone().normalize();
  }

  /**
   * Get the point on the sphere surface closest to a given position
   */
  getClosestSurfacePoint(position: THREE.Vector3): THREE.Vector3 {
    return position.clone().normalize().multiplyScalar(this.radius);
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.mesh);
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}

