const magicNumber = {
    textOffset: 20 /** 文字的偏移量，改变锚点 */
}

/**
 * 渲染件的基类
 */
export abstract class GameObject {
    x: number = 0;
    y: number = 0;
    alpha: number = 1;

    /** 根据具体数值渲染 */
    draw(context: CanvasRenderingContext2D) {
        context.globalAlpha = this.alpha;
        this.render(context);
    }

    /** 按照特定地方式渲染该GameObject */
    abstract render(context: CanvasRenderingContext2D);
}

export class Bitmap extends GameObject {

    public source: string;
    render(context: CanvasRenderingContext2D) {
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

    render(context: CanvasRenderingContext2D) {
        context.save();
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
        context.restore();
    }
}

export class TextField extends GameObject {

    public color: string = '#000000';
    public text: string = '';

    render(context: CanvasRenderingContext2D) {
        context.save();
        context.fillStyle = this.color;
        context.fillText(this.text, this.x, this.y + magicNumber.textOffset);
        context.restore();
    }
}

/**
 * 创建一个新的GameObject
 * 
 * @param type GameObject类型
 * @param properties GameObject具体参数
 */
function createGameObject(type: string, properties: any) {
    let gameObject: GameObject;
    switch (type) {
        case 'rectangle':
            const rect = new Rectangle();
            rect.color = properties.color || '#000000';
            gameObject = rect;
            break;
        case 'textfield':
            const textfiled = new TextField();
            textfiled.color = properties.color || '#000000';
            textfiled.text = properties.text || '';
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


/** 用于存储需要加载的图片的哈希表 */
const imagesStorage: any = {};

/**
 * 加载一张图片
 * 
 * @param url 图片的本地路径，推荐使用绝对路径
 * @param onLoad 回调函数
 */

function loadImage(url: string, onLoad: Function): void {
    const image = new Image();
    image.src = url;
    image.onload = function () {
        onLoad(image);
    };
}

/**
 * 加载多张图片
 * 
 * @param urls 每张图片的本地路径，推荐使用绝对路径
 * @param onLoad 回调函数，该函数在每张图片加载完毕都会调用
 */
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

/**
 * 获取一张图片，注意必须先加载
 * 
 * @param url 图片的本地路径，传入加载图片时使用的图片路径
 */
function getImage(url: string) {
    return imagesStorage[url];
}

export default class GameEngine {

    /** 所有需要渲染的GameObject */
    private renderList: GameObject[] = [];

    /** 添加需要渲染的GameObject */
    private addGameObject(gameObject: GameObject) {
        this.renderList.push(gameObject);
    }

    private loadScene(sceneConfig: any) {
        for (let config of sceneConfig) {
            const object = createGameObject(config.type, config.properties);
            this.addGameObject(object);
        }
        this.render();
    }

    private render() {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const context = canvas.getContext('2d');
        for (const gameObject of this.renderList) {
            gameObject.draw(context);
        }
    }

    /**
     * 启动引擎
     * 
     * @param images 需要加载的图片，推荐使用绝对路径
     * @param sceneConfig 场景渲染配置信息
     */
    public start (images: string[], sceneConfig) {
        loadMultiImages(images, () => {
            this.loadScene(sceneConfig);
        });
    }
}