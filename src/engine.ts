import { Circle, GameObject, Rectangle, Triangle } from './entities';
import { Camera, Renderer } from './render';
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

    private renderer: Renderer;
    private camera: Camera;

    public addGameObject(gameObject: GameObject): void {
        this.renderList.push(gameObject);
    }

    public getGameObjecet(id: string): GameObject {
        return this.gameObjects[id];
    }

    createGameObject(type: string, properties: any): GameObject {
        let gameObject: GameObject;
        switch (type) {
            case 'rectangle':
                gameObject = new Rectangle(properties.width, properties.height, properties.color);
                break;
            case 'circle':
                gameObject = new Circle(properties.radius, properties.color);
                break;
            case 'triangle':
                gameObject = new Triangle(properties.color);
                break;
            default:
                throw new Error("不存在该物件");
        }
        return gameObject;
    }

    private enterFrame(advancedTime: number) {
        const deltaTime = advancedTime - this.lastTime;
        this.lastTime = advancedTime;
        this.onEnterFrame(deltaTime);
        requestAnimationFrame(advancedTime => this.enterFrame(advancedTime));
    }

    private loadScene(sceneConfig: any): void {
        this.camera = new Camera();
        for (let config of sceneConfig) {
            const object = this.createGameObject(config.type, config.properties);
            if (config.id) {
                this.gameObjects[config.id] = object;
            }
            this.addGameObject(object);
        }
        this.renderer = new Renderer(gl, this.renderList);
    }

    private onEnterFrame(deltaTime: number) {

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
        this.renderer.render(this.camera);
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
}