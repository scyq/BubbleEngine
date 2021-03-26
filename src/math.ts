/**
 * 齐次坐标表示的向量
 * 只支持继承 Vector2 和 Vector3
 * 默认表示为一个点
 */
abstract class Vector {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x: number, y: number, z: number, w?: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        if (w) {
            this.w = w;
        } else {
            this.w = 1;
        }
    }
}


/**
 * w为1代表一个点，w为0代表向量
 * 默认为点
 */
class Vector3 extends Vector {
    constructor(x: number, y: number, z: number, w?: number) {
        super(x, y, z, w);
    }
}

class Vector2 extends Vector {
    constructor(x: number, y: number, w?: number) {
        super(x, y, 0, w);
    }
}

abstract class Matrix {
    dimension: number;
    matrix: Array<number>;

    constructor(m?: Array<number>) {
        if (m) {
            if (m.length < this.dimension * this.dimension) {
                throw new Error("矩阵大小错误");
            }
            this.matrix = m;
        } else {
            let temp = new Array(this.dimension * this.dimension);
            // 默认返回单位矩阵
            for (let i = 0; i < this.dimension; i++) {
                const pos = i * this.dimension + i;
                temp[pos] = 1;
            }
            this.matrix = temp;
        }
    }
}

/**
 * 三维空间下的矩阵，为四维方阵
 * 用于表示三维空间的仿射变化
 * 采用GL的左手系
 * 
 * +----+----+----+----+
 * | Xx | Xy | Xz |  0 |  <- x axis
 * +----+----+----+----+
 * | Yx | Yy | Yz |  0 |  <- y axis
 * +----+----+----+----+
 * | Zx | Zy | Zz |  0 |  <- z axis
 * +----+----+----+----+
 * | Tx | Ty | Tz |  1 |  <- 相机位置
 * +----+----+----+----+
*/
export class Matrix4 extends Matrix {
    constructor(m4?: Array<number>) {
        super(m4);
        this.dimension = 4;
    }
}

class Matrix3 extends Matrix {
    constructor(m3?: Array<number>) {
        super(m3);
        this.dimension = 3;
    }
}

/**
 * 两个四维矩阵相乘
 * @returns 数组
 */
function m4Mulm4(a: Array<number>, b: Array<number>): Array<number> {
    let out = new Array(16);
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    let a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    let a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    let a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];

    // Cache only the current line of the second matrix
    let b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    return out;
}

/**
 * 两个三维矩阵相乘
 * @returns 数组
 */
function m3Mulm3(a: Array<number>, b: Array<number>): Array<number> {
    let out = new Array(9);
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2];
    let a10 = a[3],
        a11 = a[4],
        a12 = a[5];
    let a20 = a[6],
        a21 = a[7],
        a22 = a[8];

    let b00 = b[0],
        b01 = b[1],
        b02 = b[2];
    let b10 = b[3],
        b11 = b[4],
        b12 = b[5];
    let b20 = b[6],
        b21 = b[7],
        b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
}

/**
 * 矩阵相乘的统一接口
 * 只考虑三维、四维矩阵乘法
 */
export function mutiply(a: Matrix, b: Matrix) {
    if (a.dimension !== b.dimension) {
        throw new Error("维数错误");
    }
    const dimension = a.dimension;
    if (dimension === 3) {
        return new Matrix3(m3Mulm3(a.matrix, b.matrix));
    } else if (dimension === 4) {
        return new Matrix4(m4Mulm4(a.matrix, b.matrix));
    } else {
        throw new Error("暂不支持该维度的矩阵运算");
    }
}

// 获得三维空间的平移矩阵
function translation(tx: number, ty: number, tz?: number) {
    let z;
    if (tz) {
        z = tz;
    } else {
        z = tz;
    }
    return new Matrix4([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        tx, ty, z, 1
    ]);
}

/**
 * 三维空间的缩放矩阵
 */
function scale3D(scaleX: number, scaleY: number, scaleZ: number) {
    return new Matrix4([
        scaleX, 0, 0, 0,
        0, scaleY, 0, 0,
        0, 0, scaleZ, 0,
        0, 0, 0, 1
    ]);
}

/**
 *  获取绕x轴旋转的旋转矩阵
 */
function rotateX(angle: number) {
    const angleInRad = angle * Math.PI / 180;
    const c = Math.cos(angleInRad);
    const s = Math.sin(angleInRad);
    return new Matrix4([
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
    ]);
}

/**
 * 获取绕Y轴旋转的旋转矩阵
 */
function rotateY(angle: number) {
    const angleInRad = angle * Math.PI / 180;
    const c = Math.cos(angleInRad);
    const s = Math.sin(angleInRad);
    return new Matrix4([
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
    ]);
}

/**
 * 获取绕Z轴旋转的旋转矩阵
 */
function rotateZ(angle: number) {
    const angleInRad = angle * Math.PI / 180;
    const c = Math.cos(angleInRad);
    const s = Math.sin(angleInRad);
    return new Matrix4([
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

