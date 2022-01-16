import { Scene } from '../../types/global';
import { Classess, GearOptions } from '../../types/player';
import Player from '../player';

class Mage extends Player {
    public class = Classess.Mage

    /* Private */
    private _gearsOptions: GearOptions = {
        body: 'baseBody',
        face: 'baseFace',
        eyes: 'baseEyes',
        skin: 'mage',
        hair: 'mage',
        hat: 'mage',
    };
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y);
        this.initGear(this._gearsOptions);
    }
}

export default Mage;
