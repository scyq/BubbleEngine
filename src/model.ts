export class Model {
    positions: Float32Array;
    dimension: number;

    constructor(positions: Float32Array, dimension: number) {
        this.positions = positions;
        this.dimension = dimension;
    }
}