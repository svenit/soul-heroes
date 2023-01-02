interface JoyStickType {
  angle: number;
  force: number;
  rotation: number;
  createCursorKeys: () => string[];
}

class JoystickHandler {
  public angle: number;
  public force: number;
  public direction: string | null;
  public isActive: boolean = false;
  public cursorKeys: any;
  public rotation: number | undefined;

  constructor() {
    this.angle = 0;
    this.force = 0;
    this.direction = null;
    this.isActive = false;
  }
  public make(joyStick: JoyStickType) {
    this.angle = Math.floor(joyStick.angle * 100) / 100;
    this.force = Math.floor(joyStick.force * 100) / 100;
    this.rotation = joyStick.rotation;
    this.cursorKeys = joyStick.createCursorKeys();

    for (let name in this.cursorKeys) {
      if (this.cursorKeys[name].isDown) {
        this.direction = name;
      }
    }
  }
}

export default JoystickHandler;
