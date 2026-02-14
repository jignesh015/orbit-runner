export class InputManager {
  private keys: Record<string, boolean> = {};

  private readonly boundKeyDown: (e: KeyboardEvent) => void;
  private readonly boundKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);

    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
  }

  private onKeyDown(e: KeyboardEvent): void {
    this.keys[e.code.toLowerCase()] = true;
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keys[e.code.toLowerCase()] = false;
  }

  /**
   * Check if a key is currently pressed
   */
  isKeyPressed(code: string): boolean {
    return this.keys[code.toLowerCase()] ?? false;
  }

  /**
   * Get rotation input (-1, 0, 1)
   * Negative = rotate left, Positive = rotate right
   */
  getRotationInput(): number {
    let rotation = 0;

    // A or ArrowLeft for left rotation
    if (this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft')) {
      rotation -= 1;
    }

    // D or ArrowRight for right rotation
    if (this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight')) {
      rotation += 1;
    }

    return rotation;
  }

  dispose(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.keys = {};
  }
}

