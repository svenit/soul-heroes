import Assassin from '../entities/classes/assassin';
import BaseMonster from '../entities/monster';
import SkyShurikenWeapon from '../entities/weapons/assassin/sky-shuriken';
import GameHelper from '../helpers/game';
import JoystickHandler from '../helpers/joystick';
import MonsterManager from '../managers/monster';
import BaseScene from './base';

interface Phaser {
    Scene: {
        bulletColliders?: any
    }
}

class LobbyScene extends BaseScene {
    enemies: any[] = [];
    bulletColliders: any[] = [];
    globalColliders: any[] = [];
    map!: Phaser.Tilemaps.Tilemap;
    groundBelow!: Phaser.Tilemaps.TilemapLayer;
    ground!: Phaser.Tilemaps.TilemapLayer;
    groundFront!: Phaser.Tilemaps.TilemapLayer;
    character: any;
    weapon!: SkyShurikenWeapon;
    joystickHandler!: JoystickHandler;
    joyStick: any;
    cusors!: Phaser.Types.Input.Keyboard.CursorKeys;
    delta: number = 0;

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
        this.scale.lockOrientation('landscape');

        /* Load map */
        this.map = this.add.tilemap('map');
        const greenWall = this.map.addTilesetImage('GreenWall', 'GreenWall');
        const road = this.map.addTilesetImage('Road', 'Road');
        this.groundBelow = this.map.createLayer('BackgroundBelow', road, 0, 0);
        this.ground = this.map.createLayer('Background', greenWall, 0, 0);
        this.groundFront = this.map.createLayer('BackgroundFront', greenWall, 0, 0);
        this.groundFront.setDepth(4);

        /* Set physics cho map */
        this.physics.world.setBounds(0, 0, this.ground.width, this.ground.height);
        this.ground.setCollisionByProperty({ collides: true });

        /* Render map collides khi bật debug mode */
        GameHelper.renderDebug(this.ground, this);
        GameHelper.renderDebug(this.groundFront, this);

        /* Set collides cho bullet và global colliers */
        this.bulletColliders = [this.ground, this.groundFront];
        this.globalColliders = [this.ground];

        /* Spawn monsters */
        this.map.objects.forEach((object) =>
            MonsterManager.spawn(object, this, (enemy: BaseMonster) => {
                this.enemies.push(enemy);
            }),
        );

        this.character = new Assassin(this, 200, 200);

        this.weapon = new SkyShurikenWeapon(this, {
            colliders: [this.ground],
        });

        this.character.useWeapon(this.weapon);
        this.character.bindCollider([this.ground]);

        this.cameras.main.setBounds(0, 0, this.ground.width, this.ground.height);
        this.cameras.main.startFollow(this.character, true);

        this.joystickHandler = new JoystickHandler();

        // @ts-ignore
        this.joyStick = this.plugins.get('joystick').add(this, {
            x: 100,
            y: this.game.canvas.height - 100,
            base: this.add.image(0, 0, 'joystick-base').setScale(0.5),
            thumb: this.add.image(0, 0, 'joystick-thumb').setScale(0.5),
        });

        this.joyStick.on('start', () => (this.joystickHandler.isActive = true));
        this.joyStick.on('update', () => this.joystickHandler.make(this.joyStick), this);
        this.joyStick.on('stop', () => (this.joystickHandler.isActive = false));

        this.joyStick.base.setDepth(999);
        this.joyStick.thumb.setDepth(999);

        this.cusors = this.input.keyboard.createCursorKeys();
        this.listenClientEvent();
    }
    listenClientEvent() {
        window.addEventListener('resize', () => {
            if (this.joyStick) {
                this.joyStick.base.setPosition(100, this.game.canvas.height - 100);
                this.joyStick.thumb.setPosition(100, this.game.canvas.height - 100);
            }
        });
    }
    update(time: number, delta: number) {
        super.update(time, delta);
        this.delta = delta / 1000;
        this.character.resetState();
        if (this.joystickHandler.isActive) {
            GameHelper.moveByAngle(this.character, this.joystickHandler.angle, this.character.stats.speed);
            this.character.onMove();
        }
        if (this.cusors.space.isDown) {
            this.weapon.onBasicAttack();
        }
    }
}

export default LobbyScene;
