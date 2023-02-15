import { DMC_COLORS } from "@/assets/dmc.model";
export interface RgbColor {
	r: number;
	g: number;
	b: number;
}

export class GemColor {
	floss: string;
	name: string;
	rgb: RgbColor;
	hex: string;

	constructor(floss:string, name:string, r:number, g:number, b:number) {
		this.floss = floss;
		this.name = name;
		this.hex = this.convertToHex(r,g,b);
		this.rgb = {r,g,b};
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





DMC_COLORS.sort((a1, a2) => {
	// return a1.b as number - a2.b as number
	// + a1.r as number - (a2.r as number)
	// + a1.g as number - a2.g as number;
	// return a1.b as number - a2.b as number;
	// return a1.r as number - (a2.r as number)
	return a1.g as number - a2.g as number;
	// return a1.floss as number - (a2.floss as number)

});
export const GEM_COLORS: GemColor[] = DMC_COLORS.map((c) => {
	console.log(c);
	return new GemColor(c.floss as string, c.name, c.r, c.g, c.b);
});

