import GameHelper from '../helpers/game';
import { Scene } from '../types/global';

const sounds = {
  ice: 'audio/skills/ice.wav',
  shuriken: 'audio/skills/shuriken.wav',
  bow_arrow: 'audio/skills/bow_arrow.wav',
};

class SoundManager {
  static async play(name: string, scene: Scene, options: Phaser.Types.Sound.SoundConfig = {}) {
    if (sounds.hasOwnProperty(name)) {
      await GameHelper.loadSprite('audio', name, (sounds as any)[name], scene);
      const sould = scene.sound.add(name, options);
      sould.play();
    }
  }
}

export default SoundManager;
