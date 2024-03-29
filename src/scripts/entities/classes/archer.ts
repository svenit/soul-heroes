import { Scene } from '../../types/global';
import { Classess, GearOptions } from '../../types/player';
import Player from '../player';

class Archer extends Player {
  public class = Classess.Archer;

  /* Private */
  private _gearsOptions: GearOptions = {
    body: 'baseBody',
    face: 'baseFace',
    eyes: 'baseEyes',
    skin: 'archer',
    hair: 'archer',
    hat: 'archer',
  };

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);
    this.initGear(this._gearsOptions);
    this.initStats({
      hp: 570,
      speed: 2.5,
    });
  }
}

export default Archer;
