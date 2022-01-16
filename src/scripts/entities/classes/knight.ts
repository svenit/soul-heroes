import { Scene } from '../../types/global';
import { Classess, GearOptions } from '../../types/player';
import Player from '../player';

class Knight extends Player {
    class = Classess.Knight
    gearsOptions: GearOptions = {
        body: 'baseBody',
        face: 'baseFace',
        eyes: 'baseEyes',
        skin: 'knight',
        hat: 'knight',
    }
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y);
        this.initGear(this.gearsOptions);
        this.initStats({
            hp: 1000,
            speed: 2.5
        });
    }
}

export default Knight;
