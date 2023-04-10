const d = document;
const w = window;
let gravity = 0.75;
let boxes = [];
let boxProp = [];
let explode = false;
let expForce = 0.01;
const engine = Matter.Engine.create();
const bodies = Matter.Bodies;
const runner = Matter.Runner.create();
const composite = Matter.Composite;

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
function addBox(x, y, w, h, b, m, content, static) {
	let box = d.createElement('div');
	box.classList.add('box');
	box.style.width = w + 'px';
	box.style.height = h + 'px';
	box.style.left = x + 'px';
	box.style.top = y + 'px';
	box.innerHTML = content;

	if (!static) {
		d.body.appendChild(box);
		boxes.push(bodies.rectangle(x, y, w, h))
		boxProp.push({w: w, h: h})
	} else {
		boxes.push(bodies.rectangle(x, y, w, h, { isStatic: true }));
	}
}

d.addEventListener('DOMContentLoaded', () => {
	addBox(150, 150, 300, 300, 0.5, 1, "<div><h1>this is a div and it has physics</h1></div>", false);
	addBox(500, 150, 300, 300, 0.5, 1, "<div><h1>this is another div and it has physics</h1></div>", false);
	addBox(1000, 150, 600, 600, 0.5, 1, "<div><h1>i wanted to make this website a pain to use</h1><button>it's a button</button></div>");

	addBox(w.innerWidth / 2, w.innerHeight + 50, w.innerWidth, 100, 0.5, 1, "", true);
	addBox(w.innerWidth / 2, -50, w.innerWidth, 100, 0.5, 1, "", true);
	addBox(-50, w.innerHeight / 2, 100, w.innerHeight, 0.5, 1, "", true);
	addBox(w.innerWidth + 50, w.innerHeight / 2, 100, w.innerHeight, 0.5, 1, "", true);

	composite.add(engine.world, boxes);

	(function run() {
		window.requestAnimationFrame(run);
		Matter.Engine.update(engine, 1000 / 60);

		let els = d.getElementsByClassName('box');
		for (let i = 0; i < boxes.length - 4; i++) {
			let b = boxes[i];
			els[i].style.top = b.position.y - boxProp[i].h / 2 + 'px';
			els[i].style.left = b.position.x - boxProp[i].w / 2 + 'px';
			els[i].style.transform = `rotate(${b.angle}rad)`;
		}

		if (explode.d) {
			for (let i = 0; i < boxes.length - 4; i++) {
				let dx = boxes[i].position.x - explode.x;
				let dy = boxes[i].position.y - explode.y;
				Matter.Body.applyForce(boxes[i], {x: boxes[i].position.x, y: boxes[i].position.y}, {x: dx * expForce, y: dy * expForce});
			}
			explode.d = false;
		}
	})();

	w.addEventListener('mousedown', (e) => {
		explode = {d: true, x: e.clientX, y: e.clientY};
	});
});
