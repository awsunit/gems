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
	import { GemColor, RgbColor } from '../classes/Color';
	import ColorMatcher from '../classes/ColorMatcher';
	import  CanvasArtist  from '../classes/CanvasArtist';





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

				var pixelData: Uint8ClampedArray = originalImageContext.getImageData(
					column,
					row,
					1,
					1
				).data;
				var nearestColor: GemColor = ColorMatcher.getNearestColor(pixelData[0], pixelData[1], pixelData[2]);
				// updating count map and hex->rgb map
				CanvasArtist.fillContextWithRectangle(nearestColorContext, nearestColor.hex, column, row);
				dmcColorMap.set(nearestColor.hex, (colorMap.get(nearestColor.hex) || 0) + 1);
				hexToRGBMap.set(nearestColor.hex, [nearestColor.rgb.r, nearestColor.rgb.g, nearestColor.rgb.b]);
				const originalPixelHex = ColorMatcher.convertToHex(pixelData[0], pixelData[1], pixelData[2]);
				colorMap.set(originalPixelHex, (colorMap.get(originalPixelHex) || 0) + 1);
				CanvasArtist.fillContextWithRectangle(redrawnImageContext, originalPixelHex, column, row);

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
				const nearestColor: GemColor = ColorMatcher.getNearestColor(pixelData[0], pixelData[1], pixelData[2]);

				// returns string
				const nearestColorHex: string = ColorMatcher.getNearestColorWithMaps(
					nearestColor.rgb,
					topColors
				);

				if (!seen.includes(nearestColorHex)) {
					seen.push(nearestColorHex);

				}
				CanvasArtist.fillContextWithRectangle(reducedColorContext, nearestColorHex, column, row);
			}
		}
	}

	onMounted(() => {
		const currentImage = new Image();
		currentImage.src = sourceUrl;

		originalImageContext = originalImageCanvasRef.value?.getContext('2d');
		nearestColorContext = nearestColorCanvasRef.value?.getContext('2d');
		redrawnImageContext = redrawnImageCanvasRef.value?.getContext('2d');
		reducedColorContext = reducedColorCanvasRef.value?.getContext('2d');
		allColorsContext = allColorsRef.value?.getContext('2d');

		let x = 0;
		ColorMatcher.GEM_COLORS.forEach( (color: GemColor, i:number) => {
			if (!allColorsContext) return;
			// for every multiple of 50, let's move over pixels_per_square\
			let grid_count = 50;
			x = Math.floor(i/grid_count) * (PIXELS_PER_SQUARE + 4);
			// console.log(name, x, i);
			CanvasArtist.fillContextWithRectangle(allColorsContext, color.hex, x, (2*i * PIXELS_PER_SQUARE % 1000));
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
			// width: 50vw;
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
		width: 100vw;
		flex: 0.5;

	}
</style>
