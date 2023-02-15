const DEFAULT_WIDTH = 20;
const DEFAULT_HEIGHT = 20;
class CanvasArtist {

	fillContextWithRectangle(
		context: CanvasRenderingContext2D,
		hex: string,
		column: number,
		row: number,
		width = DEFAULT_WIDTH,
		height = DEFAULT_HEIGHT
	): void {
		context.fillStyle = hex;
		context.fillRect(column, row, width, height);
	}
}

export default new CanvasArtist();