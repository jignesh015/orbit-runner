import * as THREE from 'three';
import { Planet } from '../world/Planet';

export class PlaneController {
  mesh: THREE.Group;
  position: THREE.Vector3;
  planet: Planet;
  
  // Movement parameters
  forwardSpeed: number = 2; // Units per second
  rotationSpeed: number = 3; // Radians per second
  heightAboveSurface: number = 1.5;

  // Orientation
  private forwardDirection: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
  private rightDirection: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
  private upDirection: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

  constructor(planet: Planet, startPosition?: THREE.Vector3) {
    this.planet = planet;
    this.mesh = new THREE.Group();

    // Initialize position on sphere surface
    if (startPosition) {
      this.position = startPosition.clone();
    } else {
      // Start at top of planet
      this.position = new THREE.Vector3(0, planet.radius + this.heightAboveSurface, 0);
    }

    this.mesh.position.copy(this.position);

    // Create a simple plane geometry as placeholder
    this.createPlaneGeometry();

    // Initial orientation
    this.updateOrientation();
  }

  private createPlaneGeometry(): void {
    // Simple plane representation (will be replaced with proper model later)
    const geometry = new THREE.BoxGeometry(0.5, 0.3, 1.5);
    const material = new THREE.MeshPhongMaterial({
      color: 0xff6b6b,
      emissive: 0x440000,
    });
    const body = new THREE.Mesh(geometry, material);
    body.castShadow = true;
    body.receiveShadow = true;
    this.mesh.add(body);

    // Add a simple cockpit indicator
    const cockpitGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0.2, 0.3);
    this.mesh.add(cockpit);
  }

  /**
   * Update plane position and orientation based on time delta and input
   */
  update(deltaTime: number, rotationInput: number): void {
    // Apply rotation around planet
    this.rotateAroundPlanet(rotationInput * this.rotationSpeed * deltaTime);

    // Move forward along the tangent plane
    const movementDistance = this.forwardSpeed * deltaTime;
    const tangentMovement = this.forwardDirection
      .clone()
      .multiplyScalar(movementDistance);

    // Update position
    this.position.add(tangentMovement);

    // Constrain to sphere surface
    this.constrainToSphereSurface();

    // Update mesh position and orientation
    this.mesh.position.copy(this.position);
    this.updateOrientation();
  }

  /**
   * Rotate the plane around the planet center
   * Input is in radians per second
   */
  private rotateAroundPlanet(rotationAmount: number): void {
    if (rotationAmount === 0) return;

    // Create a rotation axis perpendicular to current forward direction
    // and perpendicular to the sphere normal (which is the radial direction)
    const sphereNormal = this.position.clone().normalize();
    
    // Rotation axis is perpendicular to both forward and surface normal
    const rotationAxis = this.forwardDirection
      .clone()
      .cross(sphereNormal)
      .normalize();

    // Rotate position around planet center
    const offset = this.position.clone().multiplyScalar(-1);
    const axis = new THREE.Vector3(0, 0, 0);
    axis.copy(rotationAxis);

    const rotationQuaternion = new THREE.Quaternion();
    rotationQuaternion.setFromAxisAngle(rotationAxis, rotationAmount);

    this.position.applyQuaternion(rotationQuaternion);

    // Rotate forward direction around the rotation axis
    this.forwardDirection.applyQuaternion(rotationQuaternion);
  }

  /**
   * Ensure plane stays at correct height above sphere surface
   */
  private constrainToSphereSurface(): void {
    // Get the direction from planet center to plane
    const radialDirection = this.position.clone().normalize();

    // Position should be at (radius + height) from center
    const targetDistance = this.planet.radius + this.heightAboveSurface;

    // Set position to correct distance, maintaining direction
    this.position.copy(radialDirection.multiplyScalar(targetDistance));
  }

  /**
   * Update the plane's mesh rotation to align with sphere surface
   * The up vector should point away from planet center (along radial)
   * The forward vector should be tangent to the sphere
   */
  private updateOrientation(): void {
    // The radial direction from planet center (this is our "up" in local space)
    const sphereNormal = this.position.clone().normalize();

    // Update right and up directions based on forward and radial
    // Right = forward × up
    this.rightDirection.crossVectors(this.forwardDirection, sphereNormal).normalize();

    // Recalculate forward if it got distorted (ensure it's perpendicular to radial)
    this.forwardDirection.crossVectors(sphereNormal, this.rightDirection).normalize();

    // Update mesh orientation using a matrix
    const matrix = new THREE.Matrix4();
    
    // Set matrix columns: right, up (radial), forward
    matrix.set(
      this.rightDirection.x, sphereNormal.x, -this.forwardDirection.x, 0,
      this.rightDirection.y, sphereNormal.y, -this.forwardDirection.y, 0,
      this.rightDirection.z, sphereNormal.z, -this.forwardDirection.z, 0,
      0, 0, 0, 1
    );

    // Extract rotation from matrix
    this.mesh.quaternion.setFromRotationMatrix(matrix);
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.mesh);
  }

  /**
   * Get the plane's world position
   */
  getWorldPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  /**
   * Get the plane's forward direction (tangent to sphere)
   */
  getForwardDirection(): THREE.Vector3 {
    return this.forwardDirection.clone();
  }

  dispose(): void {
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
  }
}

