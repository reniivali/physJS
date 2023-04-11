const d = document;
const w = window;
let gravity = 0.75;
let boxes = [];
let boxProp = [];
let explode = false;
let expForce = 200;
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
 * @param stat whether the object is static or not
 */
function addBox(x, y, w, h, b, m, content, stat) {
	let box = d.createElement('div');
	box.classList.add('box');
	box.style.width = w + 'px';
	box.style.height = h + 'px';
	box.style.left = x + 'px';
	box.style.top = y + 'px';
	box.innerHTML = content;

	if (!stat) {
		d.body.appendChild(box);
		boxes.push(bodies.rectangle(x, y, w, h))
		boxProp.push({w: w, h: h})
	} else {
		boxes.push(bodies.rectangle(x, y, w, h, { isStatic: true }));
	}
}

function addCircle(x, y, r) {
	let circle = d.createElement('div');
	circle.classList.add('box');
	circle.style.width = r*2 + 'px';
	circle.style.height = r*2 + 'px';
	circle.style.left = x + 'px';
	circle.style.top = y + 'px';
	circle.style.borderRadius = r + 'px';
	circle.innerHTML = `<div style="border-radius:${r}px;"><div style="position:relative;background-color:#fab387;top:${r-14}px;left:-5px;width:${r-10}px;height:8px;"></div></div>`
	d.body.appendChild(circle);
	boxes.push(bodies.circle(x, y, r))
	boxProp.push({w: r*2, h: r*2})
}

let iFlexDemoBoxes = 4;

function unsetBasis() {
	for (let i = 0; i < iFlexDemoBoxes - 1; i++) {
		const flexDemoBox = d.getElementsByClassName("flexDemo")[i];
		flexDemoBox.style.flexBasis = "";
		d.getElementById(`flexBasisDemoVal${i}`).innerHTML = `Flex Basis: Unset`;
		d.getElementById(`flexBasisDemoSlide${i}`).value = "1";
	}
}

function unsetWidth() {
	for (let i = 0; i < iFlexDemoBoxes - 1; i++) {
		const flexDemoBox = d.getElementsByClassName("flexDemo")[i];
		flexDemoBox.style.width = "";
		d.getElementById(`flexRawWidthDemoVal${i}`).innerHTML = `Raw Width: Unset`;
		d.getElementById(`flexRawWidthDemoSlide${i}`).value = "1";
	}
}

/**
 * @param min Slider's minimum value
 * @param max Slider's maximum value
 * @param step Slider's step value
 * @param value Slider's starting value
 * @param id Slider's base id
 * @param did What the display p element should call the changing value
 * @param dval What the display p element should display as the starting value
 * @param cngval What the slider should change (CSS property in CamelCase)
 * @param nid the number of the demo box
 * @param appendTo the demo box element passed in
 * @param change the ID of the element to change
 * @param unit (OPTIONAL) the unit of the value (px, %, etc.)
 */
function sliderSetup(min, max, step, value, id, did, dval, cngval, nid, appendTo, change, unit) {
	const container = d.createElement("div");
	const disp = d.createElement("p");
	disp.id = `${id}DemoVal${nid}`;
	disp.innerHTML = `${did}: ${dval}`

	const slider = d.createElement("input");
	slider.type = "range";
	slider.min = min;
	slider.max = max;
	slider.value = value;
	slider.step = step;
	slider.className = "slider";
	slider.id = `${id}DemoSlide${nid}`;

	appendTo.append(container);
	container.append(disp, slider);
	if (change) {
		slider.addEventListener('input', function() {
			appendTo.style[cngval] = slider.value + unit;
			disp.innerHTML = `${did}: ${slider.value}${unit}`;
		});
	} else {
		slider.addEventListener('input', function() {
			disp.innerHTML = `${did}: ${slider.value}${unit}`;
		});
	}
}

function addFlexDemoBox() {
	const flexDemoContainer = d.getElementById("flexDemoContainer");
	const flexDemoBox = d.createElement("div");
	flexDemoBox.className = "demo flexDemo";
	flexDemoBox.id = `flexDemo${iFlexDemoBoxes + 1}`;
	flexDemoBox.innerHTML = `<h1>Box ${iFlexDemoBoxes + 1}</h1>`;
	flexDemoContainer.append(flexDemoBox);
	iFlexDemoBoxes++;
	sliderSetup(0, 1000, 1, 1, "flexBasis", "Flex Basis", "Unset", "flexBasis", iFlexDemoBoxes, flexDemoBox, true, "px");
	sliderSetup(0, 1000, 1, 1, "flexRawWidth", "Raw Width", "Unset", "width", iFlexDemoBoxes, flexDemoBox, true, "px");
	sliderSetup(0, 1, 0.001, 1, "flexGrow", "Flex Grow", "1", "flexGrow", iFlexDemoBoxes, flexDemoBox, true, "");
	sliderSetup(0, 1, 0.001, 1, "flexShrink", "Flex Shrink", "1", "flexShrink", iFlexDemoBoxes, flexDemoBox, true, "");
}

function removeFlexDemoBox() {
	if (iFlexDemoBoxes > 4) {
		d.getElementById(`flexDemo${iFlexDemoBoxes}`).remove();
		iFlexDemoBoxes--;
	} else {
		alert("You can't remove any more boxes!");
	}
}

d.addEventListener('DOMContentLoaded', () => {
	addBox(1400, 150, 300, 310, 0.5, 1, "<div class=\"subSection\">\n<h1>Border Radius</h1>\n<div id=\"borderRadDemo\"></div>\n<p id=\"borderRadDemoVal\" style=\"margin-bottom: 0;\">Radius: 5px</p>\n<input type=\"range\" min=\"0\" max=\"100\" value=\"5\" class=\"slider\" id=\"borderRadDemoSlide\">\n</div>", false);
	addBox(1400, 450, 370, 425, 0.5, 1, "<div class=\"subSection\" id=\"boxShadowDemoContainer\">\n<h1>Box Shadow</h1>\n<div id=\"boxShadowDemo\"></div>\n<div id=\"boxShadowDemoSliders\"></div>\n</div>", false);
	addBox(510, 400, 1000, 625, 0.5, 1, "<div class=\"subSection\" style=\"overflow:auto;\">\n<h1>Flexbox</h1>\n<div id=\"flexDemoContainer\">\n<div class=\"demo flexDemo\">\n<h1>Box 1</h1>\n</div>\n<div class=\"demo flexDemo\">\n<h1>Box 2</h1>\n</div>\n<div class=\"demo flexDemo\">\n<h1>Box 3</h1>\n</div>\n<div class=\"demo flexDemo\">\n<h1>Box 4</h1>\n</div>\n</div>\n<h2 style=\"margin: 0;\">Container Properties</h2>\n<div class=\"flexContainer\">\n<div class=\"demo flexBox\" style=\"width: 300px;\">\n<h2>Direction</h2>\n<select id=\"flexDirection\">\n<option value=\"row\">Row</option>\n<option value=\"row-reverse\">Row Reverse</option>\n<option value=\"column\">Column</option>\n<option value=\"column-reverse\">Column Reverse</option>\n</select>\n</div>\n<div class=\"demo flexBox\" style=\"width: 160px\">\n<h2>Wrap</h2>\n<select id=\"flexWrap\">\n<option value=\"nowrap\">No Wrap</option>\n<option value=\"wrap\">Wrap</option>\n<option value=\"wrap-reverse\">Wrap Reverse</option>\n</select>\n</div>\n<div class=\"demo flexBox\">\n<h2>Basis (all boxes)</h2>\n<button onclick=\"unsetBasis()\">Unset</button>\n</div>\n<div class=\"demo flexBox\">\n<h2>Raw Width (all boxes)</h2>\n<button onclick=\"unsetWidth()\">Unset</button>\n</div>\n<div class=\"demo flexBox\">\n<h2>Add / Remove Demo Boxes</h2>\n<button onclick=\"addFlexDemoBox()\">Add Box</button>\n<button onclick=\"removeFlexDemoBox()\">Remove Box</button>\n</div>\n</div>");
	addCircle(100, 150, 75);
	addCircle(300, 150, 75);
	addCircle(500, 150, 75);
	addCircle(700, 150, 75);
	addCircle(900, 150, 75);
	addCircle(1100, 150, 75);

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
			switch (explode.b) {
				// on LMB, cause an explosion, but don't allow it to happen every frame until the mouse is released ( it gets weird )
				case 0:
					for (let i = 0; i < boxes.length - 4; i++) {
						let dx = boxes[i].position.x - explode.x;
						let dy = boxes[i].position.y - explode.y;
						//console.log(boxes[i].position);
						let fx = expForce / dx, fy = expForce / dy;
						console.log(`Distance of the mouse from the cube: {X: ${dx}, Y: ${dy}} Applied force to object ${i}: {X: ${fx}, Y: ${fy}}`)
						if (dx > boxProp[i].w/2 || dy > boxProp[i].h/2 || dx < -boxProp[i].w/2 || dy < -boxProp[i].h/2)
							// noinspection JSCheckFunctionSignatures
							Matter.Body.applyForce(boxes[i], boxes[i].position, { x: fx, y: fy });
					}
					explode.d = false;
					break;
				// on RMB, pull every object toward the mouse - until it is released
				case 2:
					for (let i = 0; i < boxes.length - 4; i++) {
						let dx = explode.x - boxes[i].position.x;
						let dy = explode.y - boxes[i].position.y;
						let fx = expForce / dx, fy = expForce / dy;
						if (dx > boxProp[i].w/2 || dy > boxProp[i].h/2 || dx < -boxProp[i].w/2 || dy < -boxProp[i].h/2)
							// noinspection JSCheckFunctionSignatures
							Matter.Body.applyForce(boxes[i], boxes[i].position, { x: fx, y: fy });
					}
					break;
			}
		}
	})();

	w.addEventListener('mousedown', (e) => {
		explode = {d: true, x: e.clientX, y: e.clientY, b: e.button};
	});

	w.addEventListener('mousemove', (e) => {
		explode.x = e.clientX;
		explode.y = e.clientY;
	});

	w.addEventListener('mouseup', () => {
		explode.d = false;
	})

	w.addEventListener( 'contextmenu', (e) => { e.preventDefault(); } );

	//css dict
	const borderRadSlider = d.getElementById("borderRadDemoSlide")
	const borderRadElement = d.getElementById("borderRadDemo")
	borderRadSlider.addEventListener('input', function() {
		borderRadElement.style.borderRadius = borderRadSlider.value + "px";
		d.getElementById("borderRadDemoVal").innerHTML = `Radius: ${borderRadSlider.value}px`;
	});

	const flexDemoBoxes = d.getElementsByClassName("flexDemo");
	for (let i = 0; i < 4; i++) {
		sliderSetup(0, 1000, 1, 1, "flexBasis", "Flex Basis", "Unset", "flexBasis", i, flexDemoBoxes[i], true, "px");
		sliderSetup(0, 1000, 1, 1, "flexRawWidth", "Raw Width", "Unset", "width", i, flexDemoBoxes[i], true, "px");
		sliderSetup(0, 1, 0.001, 1, "flexGrow", "Flex Grow", "1", "flexGrow", i, flexDemoBoxes[i], true, "");
		sliderSetup(0, 1, 0.001, 1, "flexShrink", "Flex Shrink", "1", "flexShrink", i, flexDemoBoxes[i], true, "");
	}

	d.getElementById("flexDirection").addEventListener('change', function() {
		d.getElementById("flexDemoContainer").style.flexDirection = d.getElementById("flexDirection").value;
	});

	d.getElementById("flexWrap").addEventListener('change', function() {
		d.getElementById("flexDemoContainer").style.flexWrap = d.getElementById("flexWrap").value;
	});

	const boxShadowContainer = d.getElementById("boxShadowDemoSliders");
	const boxShadowDemo = d.getElementById("boxShadowDemo");
	sliderSetup(0, 100, 1, 0, "boxShadowX", "offset-x", "0", "", 1, boxShadowContainer, false,  "px");
	sliderSetup(0, 100, 1, 0, "boxShadowY", "offset-y", "0", "", 1, boxShadowContainer, false,  "px");
	sliderSetup(0, 100, 1, 0, "boxShadowBlur", "blur-radius", "0", "", 1, boxShadowContainer, false,  "px");
	sliderSetup(0, 100, 1, 0, "boxShadowSpread", "spread-radius", "0", "", 1, boxShadowContainer, false,  "px");

	function updateBoxShadow() {
		const x = d.getElementById("boxShadowXDemoSlide1").value;
		const y = d.getElementById("boxShadowYDemoSlide1").value;
		const blur = d.getElementById("boxShadowBlurDemoSlide1").value;
		const spread = d.getElementById("boxShadowSpreadDemoSlide1").value;
		boxShadowDemo.style.boxShadow = `${x}px ${y}px ${blur}px ${spread}px black`;
	}

	setInterval(updateBoxShadow, 50);
});
