import Assassin from '../entities/classes/assassin';
import BaseMonster from '../entities/monster';
import Player from '../entities/player';
import SkyShurikenWeapon from '../entities/weapons/assassin/sky-shuriken';
import GameHelper from '../helpers/game';
import JoystickHandler from '../helpers/joystick';
import MonsterManager from '../managers/monster';
import { Actor } from '../types/actor';
import BaseScene from './base';
class LobbyScene extends BaseScene {
  public globalColliders: Phaser.Physics.Arcade.Sprite[] | Phaser.Tilemaps.TilemapLayer[] = [];
  public bulletColliders: Phaser.Physics.Arcade.Sprite[] | Phaser.Tilemaps.TilemapLayer[] = [];
  public enemies: Actor[] = [];
  public map!: Phaser.Tilemaps.Tilemap;
  public character: Player;

  /* Private */
  private _groundBelow!: Phaser.Tilemaps.TilemapLayer;
  private _ground!: Phaser.Tilemaps.TilemapLayer;
  private _groundFront!: Phaser.Tilemaps.TilemapLayer;
  private _weapon!: SkyShurikenWeapon;
  private _joystickHandler!: JoystickHandler;
  private _joyStick: any;
  private _cusors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('LobbyScene');
  }
  preload() {
    /* Load map tiled */
    this.load.image('GreenWall', 'meta/map/spring/GreenWall.png');
    this.load.image('Road', 'meta/map/common/Road.png');
    /* Load map config */
    this.load.tilemapTiledJSON('map', 'meta/map/spring/map.json');
    /* Load common images */
    this.load.atlas('gears', 'images/gears/base1.png', 'images/gears/base.json');
    this.load.image('shadow', 'images/common/shadow.png');
    this.load.image('skill-place', 'images/common/skill-place.png');
    this.load.image('joystick-base', 'images/joystick/base.png');
    this.load.image('joystick-thumb', 'images/joystick/thumb.png');
    this.load.image('critical', 'images/common/critical.png');
    /* Load common plugins */
    this.load.plugin('joystick', 'js/libs/joystick.js', true);
    /* Load common sounds */
    this.load.audio('foot-step', 'images/common/footstep.wav');
    /* Handle preload */
    this.handlePreload(this.load);
  }
  create() {
    super.create();
    /* Load map */
    this.loadMap();
    /* Set collides cho bullet và global colliers */
    this.bulletColliders = [this._ground, this._groundFront];
    this.globalColliders = [this._ground];
    /* Spawn monsters */
    this.map.objects.forEach((object) =>
      MonsterManager.spawn(object, this, (enemy: BaseMonster) => {
        this.enemies.push(enemy);
      }),
    );
    this.character = new Assassin(this, 200, 200);
    this._weapon = new SkyShurikenWeapon(this, {
      colliders: [this._ground],
    });
    this.character.useWeapon(this._weapon);
    this.character.bindCollider([this._ground]);
    this.cameras.main.setBounds(0, 0, this._ground.width, this._ground.height);
    this.cameras.main.setZoom(1);
    this.cameras.main.startFollow(this.character, true);
    this._joystickHandler = new JoystickHandler();
    // @ts-ignore
    this._joyStick = this.plugins.get('joystick').add(this, {
      x: 100,
      y: this.game.canvas.height - 100,
      base: this.add.image(0, 0, 'joystick-base').setScale(0.5),
      thumb: this.add.image(0, 0, 'joystick-thumb').setScale(0.5),
    });
    this._joyStick.on('start', () => (this._joystickHandler.isActive = true));
    this._joyStick.on('update', () => this._joystickHandler.make(this._joyStick), this);
    this._joyStick.on('stop', () => (this._joystickHandler.isActive = false));
    this._joyStick.base.setDepth(999);
    this._joyStick.thumb.setDepth(999);
    this._cusors = this.input.keyboard.createCursorKeys();
    this.listenClientEvent();
  }
  loadMap() {
    this.map = this.add.tilemap('map');
    const greenWall = this.map.addTilesetImage('GreenWall', 'GreenWall');
    const road = this.map.addTilesetImage('Road', 'Road');
    this._groundBelow = this.map.createLayer('BackgroundBelow', road, 0, 0);
    this._ground = this.map.createLayer('Background', greenWall, 0, 0);
    this._groundFront = this.map.createLayer('BackgroundFront', greenWall, 0, 0);
    this._groundFront.setDepth(4);
    /* Set physics cho map */
    this.physics.world.setBounds(0, 0, this._ground.width, this._ground.height);
    this._ground.setCollisionByProperty({ collides: true });
    /* Render map collides khi bật debug mode */
    GameHelper.renderDebug(this._ground, this);
    GameHelper.renderDebug(this._groundFront, this);
  }
  listenClientEvent() {
    window.addEventListener('resize', () => {
      if (this._joyStick) {
        this._joyStick.base.setPosition(100, this.game.canvas.height - 100);
        this._joyStick.thumb.setPosition(100, this.game.canvas.height - 100);
      }
    });
  }
  update(time: number, delta: number) {
    super.update(time, delta);
    this.character.resetState();
    if (this._joystickHandler.isActive) {
      GameHelper.moveByAngle(this.character, this._joystickHandler.angle, this.character.stats.speed);
      this.character.onMove();
    }
    if (this._cusors.space.isDown) {
      this._weapon.onBasicAttack();
    }
  }
}

export default LobbyScene;
