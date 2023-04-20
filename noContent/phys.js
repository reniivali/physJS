// noinspection DuplicatedCode

const d = document;
const w = window;
let boxes = [];
let boxProp = [];
let explode = {};
let expForce = 200;
let boxMass = 17;
let columns = 30;
let rows = 20;
let oldR = 20, oldC = 30;
let mouseConstraint;
const engine = Matter.Engine.create();
const body = Matter.Body;
const bodies = Matter.Bodies;
const runner = Matter.Runner.create();
const composite = Matter.Composite;
let showOptions = true;

/**
 * functions for helping with physics setup
 */
const phys = {
	/**
	 * Adds a physics box
	 * @param x the box's x position
	 * @param y the box's y position
	 * @param w the box's width
	 * @param h the box's height
	 * @param b the box's bounciness
	 * @param m the box's mass
	 * @param content the box's content, in HTML
	 * @param stat whether the object is static or not
	 */
	addBox: function (x, y, w, h, b, m, content, stat) {
		let box = d.createElement('div');
		box.classList.add('box');
		box.style.width = w + 'px';
		box.style.height = h + 'px';
		box.style.left = x + 'px';
		box.style.top = y + 'px';
		box.innerHTML = content;
	
		if (!stat) {
			d.getElementById('content').appendChild(box);
			boxes.push(bodies.rectangle(x, y, w, h))
			Matter.Body.setMass(boxes[boxes.length - 1], m)
			boxProp.push({w: w, h: h, m: m})
		} else {
			boxes.push(bodies.rectangle(x, y, w, h, { isStatic: true }));
		}
	},
	/**
	 * Adds a physics circle
	 * @param x The circle's x position
	 * @param y The circle's y position
	 * @param r The circle's radius
	 * @param extra Whether the circle is an extra circle or not
	 */
	addCircle: function (x, y, r, extra) {
		let circle = d.createElement('div');
		circle.classList.add('box');
		circle.style.width = r*2 + 'px';
		circle.style.height = r*2 + 'px';
		circle.style.left = x + 'px';
		circle.style.top = y + 'px';
		circle.style.borderRadius = r + 'px';
		circle.innerHTML = `<div style="border-radius:${r}px;"><div style="position:relative;background-color:#fab387;top:${(r/4)-1}px;left:-5px;width:${(r)+4}px;height:2px;"></div></div>`
		d.getElementById('content').appendChild(circle);
		if (extra) {
			boxes.push(bodies.circle(x, y, r))
		} else {
			boxes.push(bodies.circle(x, y, r))
		}
		boxProp.push({w: r*2, h: r*2})
	},
	/**
	 * @param min Slider's minimum value
	 * @param max Slider's maximum value
	 * @param step Slider's step value
	 * @param value Slider's starting value
	 * @param id Slider's base id
	 * @param did What the display p element should call the changing value
	 * @param dval What the display p element should display as the starting value
	 * @param cngval What the slider should change (JS value)
	 * @param discrim discriminating id of the slider
	 * @param appendTo the demo box element passed in
	 * @param unit (OPTIONAL) the unit of the value (px, %, etc.)
	 */
	sliderSetup: function (min, max, step, value, id, did, dval, cngval, discrim, appendTo, unit) {
		const container = d.createElement("div");
		const disp = d.createElement("p");
		disp.id = `${id}Val${discrim}`;
		disp.innerHTML = `${did}: ${dval}`

		const slider = d.createElement("input");
		slider.type = "range";
		slider.min = min;
		slider.max = max;
		slider.value = value;
		slider.step = step;
		slider.className = "slider";
		slider.id = `${id}Slide${discrim}`;

		appendTo.append(container);
		container.append(disp, slider);
		slider.addEventListener('input', function() {
			eval(cngval + " = " + slider.value);
			disp.innerHTML = `${did}: ${slider.value}${unit}`;
		});
	},
	/**
	 * enact a force (explosion) on an array of objects
	 * @param obj array of objects to enact the force on
	 * @param objProp array of properties of the objects
	 * @param ex the force properties; should be an object with X and Y orgin points, and a bool stating wether or not to reverse the explosion.
	 * @param exclude the number of objects to exclude from the application of force
	 * @param bExclude the number of objects to exclude from the beginning of the array
	 */
	enactForce: function (obj, objProp, ex, exclude, bExclude) {
		exclude = exclude || 0;
		bExclude = bExclude || 0;
		for (let i = bExclude; i < obj.length - exclude; i++) {
			let dx, dy;
			if (ex.rv) {
				dx = ex.x - obj[i].position.x;
				dy = ex.y - obj[i].position.y;
			} else {
				dx = obj[i].position.x - ex.x;
				dy = obj[i].position.y - ex.y;
			}
			let dz = Math.sqrt(dx * dx + dy * dy),
				fz = expForce / dz,
				fx = fz * (dx / dz), fy = fz * (dy / dz);
			if (dx > objProp[i].w/2 || dy > objProp[i].h/2 || dx < -objProp[i].w/2 || dy < -objProp[i].h/2)
				// noinspection JSCheckFunctionSignatures
				Matter.Body.applyForce(obj[i], obj[i].position, { x: fx, y: fy });
		}
	},
	resetSim: function () {
		boxes = [];
		boxProp = [];
		d.getElementById('content').innerHTML = "";
		composite.clear(engine.world, false);

		for (let i = 0; i < columns; i++) {
			for (let j = 0; j < rows; j++) {
				phys.addCircle(i * 30 + 30, j * 30 + 30, 14);
			}
		}

		phys.addBox(w.innerWidth / 2, w.innerHeight + 50, w.innerWidth, 100, 0.5, 1, "", true);
		phys.addBox(w.innerWidth / 2, -50, w.innerWidth, 100, 0.5, 1, "", true);
		phys.addBox(-50, w.innerHeight / 2, 100, w.innerHeight, 0.5, 1, "", true);
		phys.addBox(w.innerWidth + 50, w.innerHeight / 2, 100, w.innerHeight, 0.5, 1, "", true);

		composite.add(engine.world, boxes)
		composite.add(engine.world, mouseConstraint);
	}
}

d.addEventListener('DOMContentLoaded', () => {
	const container = d.getElementById('content');
	container.style.left = "0";
	container.style.top = "0";
	container.style.width = w.innerWidth + "px";
	container.style.height = w.innerHeight + "px";
	container.style.position = "absolute";
	d.body.style.height = w.innerHeight + "px"; //i have NO IDEA why the body doesn't automatically fill the screen but this fixes it

	for (let i = 0; i < 30; i++) {
		for (let j = 0; j < 20; j++) {
			phys.addCircle(i * 30 + 30, j * 30 + 30, 14);
		}
	}

	phys.addBox(w.innerWidth / 2, w.innerHeight + 50, w.innerWidth, 100, 0.5, 1, "", true);
	phys.addBox(w.innerWidth / 2, -50, w.innerWidth, 100, 0.5, 1, "", true);
	phys.addBox(-50, w.innerHeight / 2, 100, w.innerHeight, 0.5, 1, "", true);
	phys.addBox(w.innerWidth + 50, w.innerHeight / 2, 100, w.innerHeight, 0.5, 1, "", true);

	phys.sliderSetup(1, 40, 1, 20, "rows", "Ball Rows", "20", "rows", "", d.getElementById("optionsSliders"), "");
	phys.sliderSetup(1, 60, 1, 30, "columns", "Ball Columns", "30", "columns", "", d.getElementById("optionsSliders"), "");
	phys.sliderSetup(-10, 10, 0.01, 1, "gravY", "Y Axis Gravity", "1", "engine.world.gravity.y", "", d.getElementById("optionsSliders"), "");
	phys.sliderSetup(-10, 10, 0.01, 1, "gravX", "X Axis Gravity", "0", "engine.world.gravity.x", "", d.getElementById("optionsSliders"), "");
	phys.sliderSetup(10, 2000, 1, 300, "expForce", "Explosion Force", "300", "expForce", "", d.getElementById("optionsSliders"), "");
	phys.sliderSetup(30, 1000, 1, 17, "boxMass", "Box Mass", "17", "boxMass", "", d.getElementById("optionsSliders"), "");

	composite.add(engine.world, boxes);

	let mouse = Matter.Mouse.create(d.body);
	mouseConstraint = Matter.MouseConstraint.create(engine, {
		mouse: mouse,
		constraint: {
			stiffness: 0.2,
		}
	});

	composite.add(engine.world, mouseConstraint);

	let oldBoxMass;
	(function run() {
		if (oldR !== rows || oldC !== columns) {
			phys.resetSim();
		}

		window.requestAnimationFrame(run);
		Matter.Engine.update(engine, 1000 / 60);

		let els = d.getElementsByClassName('box');
		for (let i = 0; i < boxes.length - 4; i++) {
			let b = boxes[i];
			let px = b.position.x, py = b.position.y;
			if (px < 0 || px > w.innerWidth || py < 0 || py > w.innerHeight) {
				Matter.Body.setPosition(b, { x: w.innerWidth / 2, y: w.innerHeight / 2 })
				//noinspection JSCheckFunctionSignatures
				Matter.Body.setVelocity(b, { x: 0, y: 0 })
			}
			if (oldBoxMass !== boxMass) {
				for (let i = 0; i < boxes.length - 4; i++) {
					Matter.Body.setMass(boxes[i], boxMass);
				}
			}
			els[i].style.top = b.position.y - boxProp[i].h / 2 + 'px';
			els[i].style.left = b.position.x - boxProp[i].w / 2 + 'px';
			els[i].style.transform = `rotate(${b.angle}rad)`;
		}

		if (explode.d) {
			switch (explode.b) {
				// on LMB, cause an explosion, but don't allow it to happen every frame until the mouse is released ( it gets weird )
				case 0:
					phys.enactForce(boxes, boxProp, {x: explode.x, y: explode.y, rv: false}, 4);
					explode.d = false;
					break;
				// on RMB, pull every object toward the mouse - until it is released
				case 2:
					phys.enactForce(boxes, boxProp, {x: explode.x, y: explode.y, rv: true}, 4, 0);
					break;
			}
		}

		if (showOptions) {
			d.getElementById("options").style.display = "block";
		} else {
			d.getElementById("options").style.display = "none";
		}

		oldR = rows; oldC = columns;
	})();

	w.addEventListener('mousedown', (e) => {
		explode = {d: true, x: e.clientX, y: e.clientY, b: e.button};
		if (e.button === 2) {
			//addCircle(w.innerWidth/2,w.innerHeight/2, 75, true);
			//composite.add(engine.world, extraBoxes[extraBoxes.length - 1]);
		}
	});

	w.addEventListener('mousemove', (e) => {
		explode.x = e.clientX;
		explode.y = e.clientY;
	});

	w.addEventListener('mouseup', () => {
		explode.d = false;
	});

	w.addEventListener('keydown', (e) => {
		switch (e.key) {
			case "o":
				showOptions = !showOptions;
				break;
		}
	});

	w.addEventListener( 'contextmenu', (e) => { e.preventDefault(); } );
});
