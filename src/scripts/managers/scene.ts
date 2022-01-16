import { Scene } from "../types/global";

/* @vite-ignore */
const loadScene = (path: string) => () => import(`../scenes/${path}`).then((m) => m.default);

const scenes = ['login', 'lobby'];

const scenesMap = new Map(scenes.map((scene) => [scene, loadScene(scene)]));

class SceneManager {
    /**
     * @summary Navigate scene
     * @param {scenes} sceneName
     * @param {Scene} game
     */
    static navigate(sceneName: string, game: Scene) {
        if (!scenesMap.has(sceneName)) {
            return console.error('Scene does not exits');
        }
        /* Lazy load */
        const loadScene = scenesMap.get(sceneName);
        // @ts-ignore
        loadScene().then((scene: any) => {
            const isAdded = game.scene.get(sceneName);
            if (isAdded) {
                return game.scene.start(sceneName);
            }
            game.scene.add(sceneName, scene, true);
        });
    }
}

export default SceneManager;
