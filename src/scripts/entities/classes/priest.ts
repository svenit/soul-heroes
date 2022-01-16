import { Scene } from '../../types/global';
import { Classess, GearOptions } from '../../types/player';
import Player from '../player';

class Priest extends Player {
    public class = Classess.Priest

    /* Private */
    private _gearsOptions: GearOptions = {
        body: 'baseBody',
        face: 'baseFace',
        eyes: 'baseEyes',
        skin: 'priest',
        hair: 'priest',
        hat: 'priest',
    }
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y);
        this.initGear(this._gearsOptions);
    }
}

export default Priest;
