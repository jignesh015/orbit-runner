import * as THREE from 'three';

export class CameraController {
  camera: THREE.PerspectiveCamera;
  targetPosition: THREE.Vector3 = new THREE.Vector3();
  
  // Camera parameters
  distance: number = 8; // Distance behind plane
  height: number = 3;   // Height above plane
  dampingFactor: number = 0.1; // Smooth following (0-1, lower = smoother)

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  /**
   * Update camera to follow the plane
   * @param planePosition - World position of the plane
   * @param planeForward - Forward direction of the plane (tangent)
   * @param planeUp - Up direction of the plane (radial outward)
   */
  update(
    planePosition: THREE.Vector3,
    planeForward: THREE.Vector3,
    planeUp: THREE.Vector3
  ): void {
    // Calculate desired camera position
    // Position behind the plane and slightly above
    const backOffset = planeForward.clone().multiplyScalar(-this.distance);
    const upOffset = planeUp.clone().multiplyScalar(this.height);

    this.targetPosition.copy(planePosition).add(backOffset).add(upOffset);

    // Smoothly move camera to target position
    this.camera.position.lerp(this.targetPosition, this.dampingFactor);

    // Look at a point ahead of the plane
    const lookAheadDistance = 5;
    const lookTarget = planePosition
      .clone()
      .add(planeForward.clone().multiplyScalar(lookAheadDistance))
      .add(upOffset.clone().multiplyScalar(0.5));

    this.camera.lookAt(lookTarget);
  }
}

