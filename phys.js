const d = document;
const w = window;
let gravity = 0.75;
let boxes = [];

/**
 * Adds a physics box
 * @param x the box's x position
 * @param y the box's y position
 * @param w the box's width
 * @param h the box's height
 * @param b the box's bounciness
 * @param m the box's mass
 */
function addBox(x, y, w, h, b, m, content) {
	let box = d.createElement('div');
	box.classList.add('box');
	box.style.width = w + 'px';
	box.style.height = h + 'px';
	box.style.left = x + 'px';
	box.style.top = y + 'px';
	box.innerHTML = content;
	d.body.appendChild(box);

	boxes.push({
		x: x,
		y: y,
		vy: 0,
		vx: 0,
		w: w,
		h: h,
		b: b,
		m: m,
		f: 0.97,
	});
}

d.addEventListener('DOMContentLoaded', () => {
	addBox(20, 20, 300, 200, 0.5, 1, "<h1>this is a div and it has physics</h1>");

	w.setInterval(() => {
		let els = d.querySelectorAll('.box');
		for (let i = 0; i < boxes.length; i++) {
			let b = boxes[i];
			if (b.y + b.h < w.innerHeight) b.vy += gravity; else {
				//b.vy = 0;
				//b.y = w.innerHeight - b.h;
			}
			b.vx *= b.f;

			if (b.y + b.h > w.innerHeight) {
				b.y = w.innerHeight - b.h;
				b.vy = -b.vy * b.b;
				if (b.vy < 1 && b.vy > 0) b.vy = 0;
			}
			if (b.y < 0) {
				b.y = 0;
				b.vy = -b.vy * b.b;
			}
			if (b.x + b.w > w.innerWidth) {
				b.x = w.innerWidth - b.w;
				b.vx = -b.vx * b.b;
			}
			if (b.x < 0) {
				b.x = 0;
				b.vx = -b.vx * b.b;
			}

			b.x += b.vx;
			b.y += b.vy;

			els[i].style.top = b.y + 'px';
			els[i].style.left = b.x + 'px';
			console.log("element: " + els[i])
		}
	}, 1000 / 60);
});
