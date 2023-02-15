import { DMC_COLORS } from "@/assets/dmc.model";
import { GemColor, RgbColor } from "./Color";
DMC_COLORS.sort((a1, a2) => {
	// return a1.b as number - a2.b as number
	// + a1.r as number - (a2.r as number)
	// + a1.g as number - a2.g as number;
	// return a1.b as number - a2.b as number;
	// return a1.r as number - (a2.r as number)
	return a1.g as number - a2.g as number;
	// return a1.floss as number - (a2.floss as number)

});
const GEM_COLORS: GemColor[] = DMC_COLORS.map((c) => {
	console.log(c);
	return new GemColor(c.floss as string, c.name, c.r, c.g, c.b);
});

class ColorMatcher {
	GEM_COLORS = GEM_COLORS;
	hexToRgbMap = new Map<string,RgbColor>();

	getNearestColor(r:number, g:number, b:number): GemColor {
		let gemColor:GemColor = this.GEM_COLORS[0];
		let minDistance = Infinity;
		this.GEM_COLORS.forEach((color) => {
			const distance = this.colorDiff(
				{r,g,b},color.rgb
			);
			if (distance < minDistance) {
				minDistance = distance;
				gemColor = color;
			}
		})
		return gemColor;
	}

	getNearestColorWithMaps(color: RgbColor, topColors: Map<string, number>): string {
		let nearestColor = 'undefined';
		let smallestDistance = Infinity;

		topColors.forEach((occurences: number, hexValue: string) => {
			const rgbConversion: RgbColor | undefined = this.hexToRgbMap.get(hexValue);
			if (rgbConversion) {
				const distance = this.colorDiff(color, rgbConversion);

				if (distance < smallestDistance) {
					smallestDistance = distance;
					nearestColor = hexValue;
				}
			}
		});

		return nearestColor;
	}

	colorDiff(r1: RgbColor, r2: RgbColor): number {
		const dr = Math.pow(r1.r - r2.r, 2);
		const dg = Math.pow(r1.g - r2.g, 2);
		const db = Math.pow(r1.b - r2.b, 2);
		const t = (r1.r + r2.r) / 2;
		return Math.sqrt(2 * dr + 4 * dg + 3 * db + t * (dr - db / 256));
	}

	convertToHex(r: number, g:number, b: number):string {
		return '#' +
				('000000' + this.rgbToHex(r, g, b)).slice(-6);
	}

	rgbToHex(r: number, g: number, b: number):string {
		if (r > 255 || g > 255 || b > 255) return '';
		return ((r << 16) | (g << 8) | b).toString(16);
	}
}

export default new ColorMatcher();