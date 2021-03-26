import { GameObject } from './components';
import { Matrix4, mutiply } from './math';
const canvas = document.getElementById('game') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2');

const magicNumber = {
    textOffset: 20 /** 文字的偏移量，改变锚点 */
}

const imagesStorage: any = {};

function getImage(url: string): ImageBitmap {
    return imagesStorage[url];
}

function loadImage(url: string, onLoad: Function): void {
    const image = new Image();
    image.src = url;
    image.onload = function () {
        imagesStorage[url] = image;
        onLoad(image);
    };
}

function loadMultiImages(urls: string[], onLoad: Function): void {
    if (urls.length < 1) {
        onLoad();
        return;
    }
    let count = 0;
    for (const url of urls) {
        loadImage(url, image => {
            count++;
            imagesStorage[url] = image;
            if (count === urls.length) {
                onLoad();
            }
        });
    }
}

export class GameEngine {

    private fps: number = 60;
    private mileSecondPerFrame: number = 1000 / this.fps;
    private iterationCurrentTime: number = 0;


    public onTick?: () => void;
    public onUpdate?: (deltaTime: number) => void;
    public onStart?: () => void;

    private lastTime: number = 0;

    private renderList: GameObject[] = [];
    private gameObjects: { [id: string]: GameObject } = {};

    public addGameObject(gameObject: GameObject): void {
        this.renderList.push(gameObject);
    }

    public getGameObjecet(id: string): GameObject {
        return this.gameObjects[id];
    }

    createGameObject(type: string, properties: any): GameObject {
        let gameObject: GameObject;
        switch (type) {
            default:
                throw Error;
        }
        gameObject.x = properties.x || 0;
        gameObject.y = properties.y || 0;
        gameObject.alpha = properties.hasOwnProperty('alpha') ? properties.alpha : 1;
        return gameObject;
    }

    private enterFrame(advancedTime: number) {
        const deltaTime = advancedTime - this.lastTime;
        this.lastTime = advancedTime;
        this.onEnterFrame(deltaTime);
        requestAnimationFrame(advancedTime => this.enterFrame(advancedTime));
    }

    private loadScene(sceneConfig: any): void {
        for (let config of sceneConfig) {
            const object = this.createGameObject(config.type, config.properties);
            if (config.id) {
                this.gameObjects[config.id] = object;
            }
            this.addGameObject(object);
        }
    }

    private onEnterFrame(deltaTime: number) {
        // gl.clearRect(0, 0, canvas.width, canvas.height);

        this.iterationCurrentTime += deltaTime;
        while (this.iterationCurrentTime >= this.mileSecondPerFrame) {
            this.iterationCurrentTime -= this.mileSecondPerFrame;
            if (this.onTick) {
                this.onTick();
            }
        }
        if (this.onUpdate) {
            this.onUpdate(deltaTime);
        }
        this.draw(gl);
    }

    public draw(gl: WebGL2RenderingContext): void {
        for (const gameObject of this.renderList) {
            gameObject.draw(gl);
        }
    }

    public start(images: string[], sceneConfig: any, onComplete?: Function): void {
        const initialTime = Date.now();
        loadMultiImages(images, () => {
            this.loadScene(sceneConfig);
            if (this.onStart) {
                this.onStart();
            }
            const advancedTime = Date.now() - initialTime;
            this.enterFrame(advancedTime);
            if (onComplete) {
                onComplete();
            }
        });
    }

    public test() {
        const a = new Matrix4([
            1, 2, 3, 4,
            5, 6, 7, 8,
            8, 7, 6, 5,
            4, 3, 2, 1
        ]);
        console.log(mutiply(a, a).matrix);
    }
}