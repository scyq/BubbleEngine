const canvas = document.getElementById('game') as HTMLCanvasElement;
const context = canvas.getContext('2d');

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


export abstract class GameObject {
    x: number = 0;
    y: number = 0;
    alpha: number = 1;

    draw(context: CanvasRenderingContext2D) {
        context.globalAlpha = this.alpha;
        this.render(context);
    }

    abstract render(context: CanvasRenderingContext2D): void;
}

export class Bitmap extends GameObject {

    public source: string;
    render(context: CanvasRenderingContext2D): void {
        const image = getImage(this.source);
        if (image) {
            context.drawImage(image, this.x, this.y);
        }
    }
}

export class Rectangle extends GameObject {

    public color: string = '#000000';
    public width: number = 100;
    public height: number = 100;

    render(context: CanvasRenderingContext2D): void {
        context.save();
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
        context.restore();
    }
}

export class TextField extends GameObject {

    public color: string = '#000000';
    public text: string = '';

    constructor(text?: string) {
        super();
        this.text = text;
    }

    render(context: CanvasRenderingContext2D): void {
        context.save();
        context.fillStyle = this.color;
        context.fillText(this.text, this.x, this.y + magicNumber.textOffset);
        context.restore();
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
            case 'rectangle':
                const rect = new Rectangle();
                rect.color = properties.color || '#000000';
                gameObject = rect;
                break;
            case 'textfield':
                const textfiled = new TextField(properties.text || '');
                textfiled.color = properties.color || '#000000';
                gameObject = textfiled;
                break;
            case 'bitmap':
                const bitmap = new Bitmap();
                bitmap.source = properties.source || '';
                gameObject = bitmap;
                break;
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
        context.clearRect(0, 0, canvas.width, canvas.height);

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
        this.draw(context);
    }

    public draw(context: CanvasRenderingContext2D): void {
        for (const gameObject of this.renderList) {
            gameObject.draw(context);
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
}