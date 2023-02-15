<template>
	<div class="container">
		<h1>Pick acceptable colors</h1>
		<div class="canvas">
			<h1>Original Image</h1>
			<canvas ref="originalImageCanvasRef" ></canvas>
		</div>

		<div class="redrawn-image-canvas">
			<h1>Redrawn Image</h1>
			<canvas ref="redrawnImageCanvasRef"></canvas>
		</div>
		<div class="drawn-canvas">
			<h1>Nearest Color</h1>
			<canvas ref="nearestColorCanvasRef"></canvas>
		</div>
		<div class="reduced-color-canvas">
			<h1>Reduced color</h1>
			<canvas ref="reducedColorCanvasRef"></canvas>
		</div>

		<!-- <img src="pixels.jpg" alt="" class="why" /> -->
		<button @click="doTheRest">Click to process Image</button>
	</div>
	<div class="all-colors">
			<h1>All the colors</h1>
			<canvas ref="allColorsRef" height="1000" width="1000"></canvas>
		</div>
</template>

<script setup lang="ts">
	import { onMounted, ref, Ref } from 'vue';
	import { DMC_COLORS } from '../assets/dmc.model';
	import { GEM_COLORS, GemColor, RgbColor } from '../classes/Color';






	const PIXELS_PER_SQUARE = 20;

	let randomColors = ['#5d8aa8', '#cc0000', '#ffc1cc', '#1a2421', '#85bb65'];

	let originalImageCanvasRef: Ref<HTMLCanvasElement | undefined> = ref();
	let redrawnImageCanvasRef: Ref<HTMLCanvasElement | undefined> = ref();
	let originalImageContext = originalImageCanvasRef.value?.getContext('2d');
	let redrawnImageContext = redrawnImageCanvasRef.value?.getContext('2d');
	let nearestColorCanvasRef: Ref<HTMLCanvasElement | undefined> = ref();
	let nearestColorContext = nearestColorCanvasRef.value?.getContext('2d');
	let reducedColorCanvasRef: Ref<HTMLCanvasElement | undefined> = ref();
	let reducedColorContext = reducedColorCanvasRef.value?.getContext('2d');
	let allColorsRef: Ref<HTMLCanvasElement | undefined> = ref();
	let allColorsContext = allColorsRef.value?.getContext('2d');
	// let sourceUrl = '/northernlights.jpg';
	let sourceUrl = '/franz.png';
	sourceUrl = 'anime1.png';
	sourceUrl = 'anime1.png';
	sourceUrl = '/yellow.png';
	sourceUrl = '/pixels.jpg';
	sourceUrl = 'anime1.png';

	let colorMap = new Map<string, number>();
	let dmcColorMap = new Map<string, number>();
	let hexToRGBMap = new Map<string, number[]>();

	let imageSections: ImageSection[] = [];

	function getNearestColorWithMaps(pixelData: any, topColors: Map<string, number>): string {
		let nearestColor = 'undefined';
		let smallestDistance = Infinity;

		topColors.forEach((occurences: number, hexValue: string) => {
			let rgbConversion: number[] | undefined = hexToRGBMap.get(hexValue);
			if (rgbConversion) {
				let distance = colorDiff(pixelData, rgbConversion);

				if (distance < smallestDistance) {
					smallestDistance = distance;
					nearestColor = hexValue;
				}
			}
		});

		return nearestColor;
	}
	function getNearestColor(pixelData: Uint8ClampedArray): any {
		let nearestColor = undefined;
		let bestMatch = Infinity;
		Object.entries(DMC_COLORS).forEach(dmcColor => {
			// console.log(dmcColor);
			// { floss: 3713, name: 'Salmon Very Light', r: 255, g: 226, b: 226 },
			let distance = colorDiff(
				[pixelData[0], pixelData[1], pixelData[2]],
				[dmcColor[1].r, dmcColor[1].g, dmcColor[1].b]
			);
			if (distance < bestMatch) {
				bestMatch = distance;
				nearestColor = dmcColor[1]; // todo: return gem since ([1] returns object)
				// console.log(nearestColor);
			}
		});
		return nearestColor;
	}

	function fillContextWithRectangle(
		context: CanvasRenderingContext2D,
		hex: string,
		column: number,
		row: number
	): void {
		context.fillStyle = hex;
		context.fillRect(column, row, PIXELS_PER_SQUARE, PIXELS_PER_SQUARE);
	}

	function doTheRest() {
		if (!originalImageCanvasRef.value) return;
		let count = 0;
		// console.log('the height: ', originalImageCanvasRef.value.height);
		// console.log({horizontalNumGems: originalImageCanvasRef.value.width/PIXELS_PER_SQUARE, verticalNumGems: originalImageCanvasRef.value.height/PIXELS_PER_SQUARE})
		for (
			var row = 0;
			row < originalImageCanvasRef.value.height - PIXELS_PER_SQUARE;
			row += PIXELS_PER_SQUARE
		) {
			for (
				var column = 0;
				column < originalImageCanvasRef.value.width - PIXELS_PER_SQUARE;
				column += PIXELS_PER_SQUARE
			) {
				if (!originalImageContext || !nearestColorContext || !redrawnImageContext) continue;
				// if (row == 1) console.log('1');
				if (row == 0 && column == 0) {
					var pixelData: Uint8ClampedArray = originalImageContext.getImageData(
						column,
						row,
						1,
						1
					).data;
					let myHex =
						'#' +
						('000000' + rgbToHex(pixelData[0], pixelData[1], pixelData[2])).slice(-6);

					let nextSpot = column + 1;
					while (true) {
						let nextPixelData: Uint8ClampedArray = originalImageContext.getImageData(
							nextSpot,
							row,
							1,
							1
						).data;
						let nextHex =
							'#' +
							(
								'000000' +
								rgbToHex(nextPixelData[0], nextPixelData[1], nextPixelData[2])
							).slice(-6);
						if (myHex != nextHex) {
							// console.log({ column: nextSpot, row: row });
							break;
						}
						nextSpot++;
					}
				}

				var pixelData: Uint8ClampedArray = originalImageContext.getImageData(
					column,
					row,
					1,
					1
				).data;
				var nearestColor: any = getNearestColor(pixelData);
				// grabbing the hex of the nearest color
				var hex =
					'#' +
					('000000' + rgbToHex(nearestColor.r, nearestColor.g, nearestColor.b)).slice(-6);
				// updating count map and hex->rgb map
				fillContextWithRectangle(nearestColorContext, hex, column, row);
				dmcColorMap.set(hex, (colorMap.get(hex) || 0) + 1);
				hexToRGBMap.set(hex, [nearestColor.r, nearestColor.g, nearestColor.b]);

				hex =
					'#' + ('000000' + rgbToHex(pixelData[0], pixelData[1], pixelData[2])).slice(-6);
				colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
				fillContextWithRectangle(redrawnImageContext, hex, column, row);

				let newImageSection = new ImageSection(
					row,
					column,
					PIXELS_PER_SQUARE,
					PIXELS_PER_SQUARE,
					[pixelData[0], pixelData[1], pixelData[2]]
				);
				imageSections.push(newImageSection);

				count++;
			}
		}

		// console.log({
		// 	dmcLength: dmcColorMap.size,
		// 	length: colorMap.size,
		// 	hexlength: hexToRGBMap.size,
		// 	count: count,
		// });
		let topColors = new Map(
			[...dmcColorMap.entries()].sort((a, b) => b[1] - a[1])
		);

		if (!originalImageContext || !nearestColorContext || !reducedColorContext) return;
		minimizeColors(
			topColors,
			dmcColorMap,
			nearestColorCanvasRef,
			nearestColorContext,
			reducedColorContext
		);
	}

	function minimizeColors(
		topColors: Map<string, number>,
		dmcColorMap: Map<string, number>,
		nearestColorRef: Ref,
		nearestColorContext: CanvasRenderingContext2D,
		reducedColorContext: CanvasRenderingContext2D
	): void {
		// remove these from map
		// topColors.forEach((v, k) => dmcColorMap.delete(k));
		// topColors.forEach((v,k) => console.log({topColor: k, mapResult: hexToRGBMap.get(k)}));
		let seen: Array<string> = [];

		for (
			var row = 0;
			row < nearestColorRef.value.height - PIXELS_PER_SQUARE;
			row += PIXELS_PER_SQUARE
		) {
			for (
				var column = 0;
				column < nearestColorRef.value.width - PIXELS_PER_SQUARE;
				column += PIXELS_PER_SQUARE
			) {
				var pixelData: Uint8ClampedArray = nearestColorContext.getImageData(
					column,
					row,
					1,
					1
				).data;
				var nearestColor: any = getNearestColor(pixelData);

				nearestColor = getNearestColorWithMaps(
					[nearestColor.r, nearestColor.g, nearestColor.b],
					topColors
				);

				if (!seen.includes(nearestColor)) {
					seen.push(nearestColor);
					// var hex =
					// 	'#' +
					// 	('000000' + rgbToHex(nearestColor.r, nearestColor.g, nearestColor.b)).slice(
					// 		-6
					// 	);
					// console.log({ color: nearestColor, l: seen.length });
				}
				fillContextWithRectangle(reducedColorContext, nearestColor, column, row);
				// nearestColorContext.fillStyle = nearestColor;
				// nearestColorContext.fillRect(column, row, PIXELS_PER_SQUARE, PIXELS_PER_SQUARE);
			}

			// nextMap.forEach((value, key) => console.log({key: key, value: value}));
		}
	}

	function convertToHex(r: number, g:number, b: number) {
		return '#' +
				('000000' + rgbToHex(r, g, b)).slice(-6);
	}

	onMounted(() => {
		const currentImage = new Image();
		currentImage.src = sourceUrl;

		originalImageContext = originalImageCanvasRef.value?.getContext('2d');
		nearestColorContext = nearestColorCanvasRef.value?.getContext('2d');
		redrawnImageContext = redrawnImageCanvasRef.value?.getContext('2d');
		reducedColorContext = reducedColorCanvasRef.value?.getContext('2d');
		allColorsContext = allColorsRef.value?.getContext('2d');
		// name, r, g, b
		let x = 0;
		// DMC_COLORS.forEach( ({floss, name, r, g, b}, i) => {
		// 	// updating count map and hex->rgb map
		// 	let hex = convertToHex(r,g,b);
		// 	if (!allColorsContext) return;
		// 	// for every multiple of 50, let's move over pixels_per_square\
		// 	let grid_count = 50;
		// 	x = Math.floor(i/grid_count) * (PIXELS_PER_SQUARE + 4);
		// 	console.log(name, x, i);
		// 	fillContextWithRectangle(allColorsContext, hex, x, (2*i * PIXELS_PER_SQUARE % 1000));
		// });
		GEM_COLORS.forEach( (color: GemColor, i:number) => {
			if (!allColorsContext) return;
			// for every multiple of 50, let's move over pixels_per_square\
			let grid_count = 50;
			x = Math.floor(i/grid_count) * (PIXELS_PER_SQUARE + 4);
			// console.log(name, x, i);
			fillContextWithRectangle(allColorsContext, color.hex, x, (2*i * PIXELS_PER_SQUARE % 1000));
		});

		currentImage.onload = () => {
			if (!originalImageCanvasRef.value) return;
			console.log({
				width: currentImage.width,
				height: currentImage.height,
				canvasW: originalImageCanvasRef.value.width,
				canvasH: originalImageCanvasRef.value.height,
			});
			// draw the initial image
			originalImageCanvasRef.value.getContext('2d')?.drawImage(
				currentImage,
				0,
				0,
				currentImage.width,
				currentImage.height,
				0,
				0,
				originalImageCanvasRef.value.width,
				originalImageCanvasRef.value.height
			);
		};
	});

	function rgbToHex(r: number, g: number, b: number) {
		if (r > 255 || g > 255 || b > 255) return '';
		return ((r << 16) | (g << 8) | b).toString(16);
	}

	function colorDiff(rgba1: any, rgba2: any): any {
		const [r1, g1, b1] = rgba1;
		const [r2, g2, b2] = rgba2;
		// console.log(r1,g1,b1,r2,g2,b2)

		var dr = Math.pow(r1 - r2, 2);
		var dg = Math.pow(g1 - g2, 2);
		var db = Math.pow(b1 - b2, 2);
		var t = (r1 + r2) / 2;
		return Math.sqrt(2 * dr + 4 * dg + 3 * db + t * (dr - db / 256));
	}

	class ImageSection {
		leftX: number;
		topY: number;
		width: number;
		height: number;
		color: number[];

		constructor(leftX: number, topY: number, width: number, height: number, color: number[]) {
			this.leftX = leftX;
			this.topY = topY;
			this.width = width;
			this.height = height;
			this.color = color;
		}
	}


</script>

<style lang="scss" scoped>
body {

	display: flex;
	flex-direction: column;
}
	.container {
		border: solid red;
		// $size: 440px;
		// justify-content: left;
		flex: 0.5;


		canvas {
			// height: $size;
			// width: $size
			width: 50vw;
		}
		.canvas {
		}

		.drawn-canvas {
		}

		.redrawn-image-canvas {
		}

	}
	.all-colors {
		height: 100vh;
		flex: 0.5;

	}
</style>
