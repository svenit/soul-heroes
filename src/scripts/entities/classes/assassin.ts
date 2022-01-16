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
            hp: 650,
            speed: 3,
            attackRange: 300,
            accuracy: 100,
            weaponMastery: 0,
        });
    }
}

export default Assassin;
