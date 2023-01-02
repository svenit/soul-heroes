import { Scene } from '../types/global';
import { MonsterInstane } from '../types/monster';

const monsters = ['fire-slime', 'pantheon', 'boomer', 'ice-bear', 'chaos-knight', 'skeleton'];

const loadMonster = (path: string) => () => import(`../entities/monsters/${path}`).then((m) => m.default) as any;

const monstersMap = new Map(monsters.map((scene) => [scene, loadMonster(scene)]));

class MonsterManager {
  static prefix = 'monster_';
  /**
   * @summary Spawn monsters
   * @param {object} Phaser.Map.Object
   * @param {Scene} scene
   * @param {CallableFunction} callback
   */
  static spawn(object: Phaser.Tilemaps.ObjectLayer, scene: Scene, callback?: CallableFunction) {
    if (object.name.includes(this.prefix)) {
      const monsterName = object.name.replace(/monster_/gim, '');
      if (!monstersMap.has(monsterName)) {
        return console.error(`Monster ${monsterName} does not exits`);
      }
      /* Lazy load */
      const loadMonster = monstersMap.get(monsterName);
      // @ts-ignore
      loadMonster().then((MonsterInstane: MonsterInstane) => {
        for (let monster of object.objects) {
          const monsterInstane = new MonsterInstane(scene, monster.x, monster.y);
          monsterInstane.makeMonster();
          callback && callback(monsterInstane);
        }
      });
    }
  }
}

export default MonsterManager;
