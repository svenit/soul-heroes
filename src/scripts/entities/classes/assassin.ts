import { DamageType } from '../../types/actor';
import { Scene } from '../../types/global';
import { Classess, GearOptions } from '../../types/player';
import Player from '../player';

class Assassin extends Player {
  public class = Classess.Assassin;

  /* Private */
  private _gearsOptions: GearOptions = {
    body: 'baseBody',
    face: 'baseFace',
    eyes: 'baseEyes',
    skin: 'assassin',
    hat: 'assassin',
  };
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);
    this.initGear(this._gearsOptions);
    this.initStats({
      hp: 10000,
      strength: [1, 200],
      speed: 2,
      autoAimRange: 300,
      physicalResistance: 500,
    });
  }
  public getBasicDamageType(): DamageType {
    return 'strength';
  }
}

export default Assassin;
