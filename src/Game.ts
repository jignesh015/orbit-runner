import { SceneManager } from './scene/SceneManager';
import { Planet } from './world/Planet';
import { PlaneController } from './player/PlaneController';
import { InputManager } from './systems/InputManager';
import { CameraController } from './systems/CameraController';

export class Game {
  private sceneManager: SceneManager;
  private planet: Planet;
  private planeController: PlaneController;
  private inputManager: InputManager;
  private cameraController: CameraController;

  private isRunning: boolean = true;
  private lastFrameTime: number = 0;

  constructor() {
    // Initialize all systems
    this.sceneManager = new SceneManager('app');
    this.planet = new Planet(10);
    this.planet.addToScene(this.sceneManager.scene);

    this.inputManager = new InputManager();
    this.planeController = new PlaneController(this.planet);
    this.planeController.addToScene(this.sceneManager.scene);

    this.cameraController = new CameraController(this.sceneManager.camera);

    // Start game loop
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;

    // Update game logic
    this.update(deltaTime);

    // Render
    this.sceneManager.render();

    // Request next frame
    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Get player input
    const rotationInput = this.inputManager.getRotationInput();

    // Update plane
    // this.planeController.update(deltaTime, rotationInput);

    // Update camera
    const planePosition = this.planeController.getWorldPosition();
    const planeForward = this.planeController.getForwardDirection();
    const planeUp = planePosition.clone().normalize(); // Radial direction
    this.cameraController.update(planePosition, planeForward, planeUp);
  }

  dispose(): void {
    this.isRunning = false;
    this.sceneManager.dispose();
    this.planeController.dispose();
    this.inputManager.dispose();
    this.planet.dispose();
  }
}

