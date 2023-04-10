const d = document;
const w = window;
let gravity = 0.75;
let boxes = [];
let explode = false;
let expForce = 20;

/**
 * Adds a physics box
 * @param x the box's x position
 * @param y the box's y position
 * @param w the box's width
 * @param h the box's height
 * @param b the box's bounciness
 * @param m the box's mass
 * @param content the box's content, in HTML
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
		f: 0.99,
	});
}

d.addEventListener('DOMContentLoaded', () => {
	addBox(20, 20, 300, 300, 0.5, 1, "<div><h1>this is a div and it has physics</h1></div>");
	addBox(340, 20, 300, 300, 0.5, 1, "<div><h1>this is another div and it has physics</h1></div>");
	//addBox(660, 20, 600, 600, 0.5, 1, "<div><h1>i wanted to make this website a pain to use</h1></div>");

	w.setInterval(() => {
		d.getElementById('debug').innerHTML = '';
		let els = d.querySelectorAll('.box');
		for (let i = 0; i < boxes.length; i++) {
			let b = boxes[i];
			b.vy += gravity;
			b.vx *= b.f;

			b.x += b.vx;
			b.y += b.vy;

			// calculate explosion based on mouse position
			if (explode.d) {
				let difx = b.x - explode.x;
				let dify = b.y - explode.y;

				let dist = Math.sqrt(difx * difx + dify * dify);
				b.vx += ((difx / dist) * expForce) / dist * dist;
				b.vy += ((dify / dist) * expForce) / dist * dist;
			}

			if (b.y + b.h > w.innerHeight) {
				b.y = w.innerHeight - b.h;
				b.vy = -b.vy * b.b;
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

			if(Math.abs(b.vy) < 2.5 && b.y > w.innerHeight - b.h - 2.5){
				b.vy = 0;
				b.y = w.innerHeight - b.h;
			}

			for (let j = 0; j < boxes.length; j++) {
				if (i === j) continue;
				let b2 = boxes[j];
				if (b.x + b.w > b2.x && b.x < b2.x + b2.w && b.y + b.h > b2.y && b.y < b2.y + b2.h) {
					//calc collision vector
					let difx = b.x - b2.x;
					let dify = b.y - b2.y;
					let dist = Math.sqrt(difx * difx + dify * dify);
					let nx = difx / dist;
					let ny = dify / dist;
					let tx = -ny;
					let ty = nx;
					//move the boxes away from each other
					/*let p = (b.w / 2 + b2.w / 2) - dist;
					b.x += nx * p;
					b.y += ny * p;
					b2.x -= nx * p;
					b2.y -= ny * p;*/
					//calc dot products
					let dpTan1 = b.vx * tx + b.vy * ty;
					let dpTan2 = b2.vx * tx + b2.vy * ty;
					let dpNorm1 = b.vx * nx + b.vy * ny;
					let dpNorm2 = b2.vx * nx + b2.vy * ny;
					//calc new velocities
					let m1 = (dpNorm1 * (b.m - b2.m) + 2 * b2.m * dpNorm2) / (b.m + b2.m);
					let m2 = (dpNorm2 * (b2.m - b.m) + 2 * b.m * dpNorm1) / (b.m + b2.m);
					//set new velocities
					b.vx = tx * dpTan1 + nx * m1;
					b.vy = ty * dpTan1 + ny * m1;
					b2.vx = tx * dpTan2 + nx * m2;
					b2.vy = ty * dpTan2 + ny * m2;

				}
			}

			els[i].style.top = b.y + 'px';
			els[i].style.left = b.x + 'px';
			d.getElementById('debug').innerHTML += `box ${i} {<br> x: ${b.x}<br> y: ${b.y}<br> vx: ${b.vx}<br> vy: ${b.vy}<br>}<br>`
		}
		explode = {d: false, x: 0, y: 0};
	}, 1000 / 60);

	w.addEventListener('mousedown', (e) => {
		explode = {d: true, x: e.clientX, y: e.clientY};
	});
});
