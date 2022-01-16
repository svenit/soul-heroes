import { Scene } from '../../types/global';
import { Classess, GearOptions } from '../../types/player';
import Player from '../player';

class Priest extends Player {
    class = Classess.Priest
    gearsOptions: GearOptions = {
        body: 'baseBody',
        face: 'baseFace',
        eyes: 'baseEyes',
        skin: 'priest',
        hair: 'priest',
        hat: 'priest',
    }
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y);
        this.initGear(this.gearsOptions);
    }
}

export default Priest;
