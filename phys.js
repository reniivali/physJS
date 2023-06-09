// noinspection DuplicatedCode

const d = document;
const w = window;
let boxes = [];
let boxProp = [];
let extraBoxes = [];
let exBoxProp = [];
let explode = false;
let expForce = 500;
let oldW = w.innerWidth, oldH = w.innerHeight;
const engine = Matter.Engine.create();
const bodies = Matter.Bodies;
const runner = Matter.Runner.create();
const composite = Matter.Composite;
let showOptions = true;
let iFlexDemoBoxes = 4;
let boxMass = 30;
let mouseConstraint;

/**
 * functions for the CSS dictionary elements
 */
const dict = {
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
	sliderSetup: function (min, max, step, value, id, did, dval, cngval, nid, appendTo, change, unit) {
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
	},
	addFlexDemoBox: function () {
		const flexDemoContainer = d.getElementById("flexDemoContainer");
		const flexDemoBox = d.createElement("div");
		flexDemoBox.className = "demo flexDemo";
		flexDemoBox.id = `flexDemo${iFlexDemoBoxes + 1}`;
		flexDemoBox.innerHTML = `<h1>Box ${iFlexDemoBoxes + 1}</h1>`;
		flexDemoContainer.append(flexDemoBox);
		iFlexDemoBoxes++;
		this.sliderSetup(0, 1000, 1, 1, "flexBasis", "Flex Basis", "Unset", "flexBasis", iFlexDemoBoxes-1, flexDemoBox, true, "px");
		this.sliderSetup(0, 1000, 1, 1, "flexRawWidth", "Raw Width", "Unset", "width", iFlexDemoBoxes-1, flexDemoBox, true, "px");
		this.sliderSetup(0, 1, 0.001, 1, "flexGrow", "Flex Grow", "1", "flexGrow", iFlexDemoBoxes, flexDemoBox, true, "");
		this.sliderSetup(0, 1, 0.001, 1, "flexShrink", "Flex Shrink", "1", "flexShrink", iFlexDemoBoxes, flexDemoBox, true, "");
	},
	removeFlexDemoBox: function () {
		if (iFlexDemoBoxes > 4) {
			d.getElementById(`flexDemo${iFlexDemoBoxes}`).remove();
			iFlexDemoBoxes--;
		} else {
			alert("You can't remove any more boxes!");
		}
	},
	unsetBasis: function () {
		for (let i = 0; i < iFlexDemoBoxes; i++) {
			const flexDemoBox = d.getElementsByClassName("flexDemo")[i];
			flexDemoBox.style.flexBasis = "";
			d.getElementById(`flexBasisDemoVal${i}`).innerHTML = `Flex Basis: Unset`;
			d.getElementById(`flexBasisDemoSlide${i}`).value = "1";
		}
	},
	unsetWidth: function () {
		for (let i = 0; i < iFlexDemoBoxes; i++) {
			const flexDemoBox = d.getElementsByClassName("flexDemo")[i];
			flexDemoBox.style.width = "";
			d.getElementById(`flexRawWidthDemoVal${i}`).innerHTML = `Raw Width: Unset`;
			d.getElementById(`flexRawWidthDemoSlide${i}`).value = "1";
		}
	}
}

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
		circle.innerHTML = `<div style="border-radius:${r}px;"><div style="position:relative;background-color:#fab387;top:${r-14}px;left:-5px;width:${r-10}px;height:8px;"></div></div>`
		d.getElementById('content').appendChild(circle);
		if (extra) {
			extraBoxes.push(bodies.circle(x, y, r))
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

		phys.addBox(1400, 150, 300, 310, 0.5, 30, "<div class=\"subSection\">\n<h1>Border Radius</h1>\n<div id=\"borderRadDemo\"></div>\n<p id=\"borderRadDemoVal\" style=\"margin-bottom: 0;\">Radius: 5px</p>\n<input type=\"range\" min=\"0\" max=\"100\" value=\"5\" class=\"slider\" id=\"borderRadDemoSlide\">\n</div>", false);
		phys.addBox(1400, 450, 370, 425, 0.5, 30, "<div class=\"subSection\" id=\"boxShadowDemoContainer\">\n<h1>Box Shadow</h1>\n<div id=\"boxShadowDemo\"></div>\n<div id=\"boxShadowDemoSliders\"></div>\n</div>", false);
		phys.addBox(510, 400, 1000, 625, 0.5, 30, "<div class=\"subSection\" style=\"overflow:auto;\">\n<h1>Flexbox</h1>\n<div id=\"flexDemoContainer\">\n<div class=\"demo flexDemo\">\n<h1>Box 1</h1>\n</div>\n<div class=\"demo flexDemo\">\n<h1>Box 2</h1>\n</div>\n<div class=\"demo flexDemo\">\n<h1>Box 3</h1>\n</div>\n<div class=\"demo flexDemo\">\n<h1>Box 4</h1>\n</div>\n</div>\n<h2 style=\"margin: 0;\">Container Properties</h2>\n<div class=\"flexContainer\">\n<div class=\"demo flexBox\" style=\"width: 300px;\">\n<h2>Direction</h2>\n<select id=\"flexDirection\">\n<option value=\"row\">Row</option>\n<option value=\"row-reverse\">Row Reverse</option>\n<option value=\"column\">Column</option>\n<option value=\"column-reverse\">Column Reverse</option>\n</select>\n</div>\n<div class=\"demo flexBox\" style=\"width: 160px\">\n<h2>Wrap</h2>\n<select id=\"flexWrap\">\n<option value=\"nowrap\">No Wrap</option>\n<option value=\"wrap\">Wrap</option>\n<option value=\"wrap-reverse\">Wrap Reverse</option>\n</select>\n</div>\n<div class=\"demo flexBox\">\n<h2>Basis (all boxes)</h2>\n<button onclick=\"dict.unsetBasis()\">Unset</button>\n</div>\n<div class=\"demo flexBox\">\n<h2>Raw Width (all boxes)</h2>\n<button onclick=\"dict.unsetWidth()\">Unset</button>\n</div>\n<div class=\"demo flexBox\">\n<h2>Add / Remove Demo Boxes</h2>\n<button onclick=\"dict.addFlexDemoBox()\">Add Box</button>\n<button onclick=\"dict.removeFlexDemoBox()\">Remove Box</button>\n</div>\n</div>", false);
		phys.addBox(1300, 150, 600, 600, 0.5, 30, `<div class="subSection" style="overflow-y: scroll;"><h1>Rotate, Transform</h1><div id="rotDemoContainer"><div id="rotateDemo"><div class="propDemo cf ff">front</div><div class="propDemo cf fl">left</div><div class="propDemo cf fr">right</div><div class="propDemo cf fba">back</div><div class="propDemo cf ft">top</div><div class="propDemo cf fbt">bottom</div></div></div><div id="rotateDemoSliders" class="demoSliders"></div></div>`, false)

		phys.addCircle(100, 150, 75);
		phys.addCircle(300, 150, 75);
		phys.addCircle(500, 150, 75);
		phys.addCircle(700, 150, 75);
		phys.addCircle(900, 150, 75);
		phys.addCircle(1100, 150, 75);
		phys.addCircle(1300, 150, 75);
		phys.addCircle(1500, 150, 75);
		phys.addCircle(1700, 150, 75);

		phys.addBox(w.innerWidth / 2, w.innerHeight + 50, w.innerWidth, 100, 0.5, 1, "", true);
		phys.addBox(w.innerWidth / 2, -50, w.innerWidth, 100, 0.5, 1, "", true);
		phys.addBox(-50, w.innerHeight / 2, 100, w.innerHeight, 0.5, 1, "", true);
		phys.addBox(w.innerWidth + 50, w.innerHeight / 2, 100, w.innerHeight, 0.5, 1, "", true);

		composite.add(engine.world, boxes)
		composite.add(engine.world, mouseConstraint);
	}
}

d.addEventListener('DOMContentLoaded', () => {
	d.body.style.height = w.innerHeight + "px"; //i have NO IDEA why the body doesn't automatically fill the screen but this fixes it

	phys.addBox(1400, 150, 300, 310, 0.5, 30, "<div class=\"subSection\">\n<h1>Border Radius</h1>\n<div id=\"borderRadDemo\"></div>\n<p id=\"borderRadDemoVal\" style=\"margin-bottom: 0;\">Radius: 5px</p>\n<input type=\"range\" min=\"0\" max=\"100\" value=\"5\" class=\"slider\" id=\"borderRadDemoSlide\">\n</div>", false);
	phys.addBox(1400, 450, 370, 425, 0.5, 30, "<div class=\"subSection\" id=\"boxShadowDemoContainer\">\n<h1>Box Shadow</h1>\n<div id=\"boxShadowDemo\"></div>\n<div id=\"boxShadowDemoSliders\"></div>\n</div>", false);
	phys.addBox(510, 400, 1000, 625, 0.5, 30, "<div class=\"subSection\" style=\"overflow:auto;\">\n<h1>Flexbox</h1>\n<div id=\"flexDemoContainer\">\n<div class=\"demo flexDemo\">\n<h1>Box 1</h1>\n</div>\n<div class=\"demo flexDemo\">\n<h1>Box 2</h1>\n</div>\n<div class=\"demo flexDemo\">\n<h1>Box 3</h1>\n</div>\n<div class=\"demo flexDemo\">\n<h1>Box 4</h1>\n</div>\n</div>\n<h2 style=\"margin: 0;\">Container Properties</h2>\n<div class=\"flexContainer\">\n<div class=\"demo flexBox\" style=\"width: 300px;\">\n<h2>Direction</h2>\n<select id=\"flexDirection\">\n<option value=\"row\">Row</option>\n<option value=\"row-reverse\">Row Reverse</option>\n<option value=\"column\">Column</option>\n<option value=\"column-reverse\">Column Reverse</option>\n</select>\n</div>\n<div class=\"demo flexBox\" style=\"width: 160px\">\n<h2>Wrap</h2>\n<select id=\"flexWrap\">\n<option value=\"nowrap\">No Wrap</option>\n<option value=\"wrap\">Wrap</option>\n<option value=\"wrap-reverse\">Wrap Reverse</option>\n</select>\n</div>\n<div class=\"demo flexBox\">\n<h2>Basis (all boxes)</h2>\n<button onclick=\"dict.unsetBasis()\">Unset</button>\n</div>\n<div class=\"demo flexBox\">\n<h2>Raw Width (all boxes)</h2>\n<button onclick=\"dict.unsetWidth()\">Unset</button>\n</div>\n<div class=\"demo flexBox\">\n<h2>Add / Remove Demo Boxes</h2>\n<button onclick=\"dict.addFlexDemoBox()\">Add Box</button>\n<button onclick=\"dict.removeFlexDemoBox()\">Remove Box</button>\n</div>\n</div>", false);
	phys.addBox(1300, 150, 600, 600, 0.5, 30, `<div class="subSection" style="overflow-y: scroll;"><h1>Rotate, Transform</h1><div id="rotDemoContainer"><div id="rotateDemo"><div class="propDemo cf ff">front</div><div class="propDemo cf fl">left</div><div class="propDemo cf fr">right</div><div class="propDemo cf fba">back</div><div class="propDemo cf ft">top</div><div class="propDemo cf fbt">bottom</div></div></div><div id="rotateDemoSliders" class="demoSliders"></div></div>`, false)
	phys.addCircle(100, 150, 75);
	phys.addCircle(300, 150, 75);
	phys.addCircle(500, 150, 75);
	phys.addCircle(700, 150, 75);
	phys.addCircle(900, 150, 75);
	phys.addCircle(1100, 150, 75);
	phys.addCircle(1300, 150, 75);
	phys.addCircle(1500, 150, 75);
	phys.addCircle(1700, 150, 75);

	phys.addBox(w.innerWidth / 2, w.innerHeight + 50, w.innerWidth, 100, 0.5, 1, "", true);
	phys.addBox(w.innerWidth / 2, -50, w.innerWidth, 100, 0.5, 1, "", true);
	phys.addBox(-50, w.innerHeight / 2, 100, w.innerHeight, 0.5, 1, "", true);
	phys.addBox(w.innerWidth + 50, w.innerHeight / 2, 100, w.innerHeight, 0.5, 1, "", true);

	phys.sliderSetup(-10, 10, 0.01, 1, "gravY", "Y Axis Gravity", "1", "engine.world.gravity.y", "", d.getElementById("optionsSliders"), "");
	phys.sliderSetup(-10, 10, 0.01, 1, "gravX", "X Axis Gravity", "0", "engine.world.gravity.x", "", d.getElementById("optionsSliders"), "");
	phys.sliderSetup(10, 2000, 1, 500, "expForce", "Explosion Force", "500", "expForce", "", d.getElementById("optionsSliders"), "");
	phys.sliderSetup(30, 1000, 1, 30, "boxMass", "Box Mass", "30", "boxMass", "", d.getElementById("optionsSliders"), "");

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
		if (oldH !== w.innerHeight || oldW !== w.innerWidth) {
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
				for (let i = 0; i < boxes.length - 13; i++) {
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
					if (extraBoxes.length > 0) {
						phys.enactForce(extraBoxes, exBoxProp, {x: explode.x, y: explode.y, rv: false});
					}
					explode.d = false;
					break;
				// on RMB, pull every object toward the mouse - until it is released
				case 2:
					phys.enactForce(boxes, boxProp, {x: explode.x, y: explode.y, rv: true}, 4, 4);
					if (extraBoxes.length > 0) {
						phys.enactForce(extraBoxes, exBoxProp, {x: explode.x, y: explode.y, rv: true});
					}
					break;
			}
		}

		if (showOptions) {
			d.getElementById("options").style.display = "block";
		} else {
			d.getElementById("options").style.display = "none";
		}
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

	/*d.body.addEventListener('resize', () => {
		console.log("Resizing")
		composite.remove(engine.world, boxes[boxes.length - 1]);
		composite.remove(engine.world, boxes[boxes.length - 1]);
		composite.remove(engine.world, boxes[boxes.length - 1]);
		composite.remove(engine.world, boxes[boxes.length - 1]);
		boxes.splice(boxes.length - 4, 4);
		addBox(w.innerWidth + 50, w.innerHeight / 2, 100, w.innerHeight, 0.5, 1, "", true);
		addBox(w.innerWidth / 2, w.innerHeight + 50, w.innerWidth, 100, 0.5, 1, "", true);
		addBox(-50, w.innerHeight / 2, 100, w.innerHeight, 0.5, 1, "", true);
		addBox(w.innerWidth / 2, -50, w.innerWidth, 100, 0.5, 1, "", true);
	});*/

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
		dict.sliderSetup(0, 1000, 1, 1, "flexBasis", "Flex Basis", "Unset", "flexBasis", i, flexDemoBoxes[i], true, "px");
		dict.sliderSetup(0, 1000, 1, 1, "flexRawWidth", "Raw Width", "Unset", "width", i, flexDemoBoxes[i], true, "px");
		dict.sliderSetup(0, 1, 0.001, 1, "flexGrow", "Flex Grow", "1", "flexGrow", i, flexDemoBoxes[i], true, "");
		dict.sliderSetup(0, 1, 0.001, 1, "flexShrink", "Flex Shrink", "1", "flexShrink", i, flexDemoBoxes[i], true, "");
	}

	d.getElementById("flexDirection").addEventListener('change', function() {
		d.getElementById("flexDemoContainer").style.flexDirection = d.getElementById("flexDirection").value;
	});

	d.getElementById("flexWrap").addEventListener('change', function() {
		d.getElementById("flexDemoContainer").style.flexWrap = d.getElementById("flexWrap").value;
	});

	const boxShadowContainer = d.getElementById("boxShadowDemoSliders");
	const boxShadowDemo = d.getElementById("boxShadowDemo");
	dict.sliderSetup(0, 100, 1, 0, "boxShadowX", "offset-x", "0", "", 1, boxShadowContainer, false,  "px");
	dict.sliderSetup(0, 100, 1, 0, "boxShadowY", "offset-y", "0", "", 1, boxShadowContainer, false,  "px");
	dict.sliderSetup(0, 100, 1, 0, "boxShadowBlur", "blur-radius", "0", "", 1, boxShadowContainer, false,  "px");
	dict.sliderSetup(0, 100, 1, 0, "boxShadowSpread", "spread-radius", "0", "", 1, boxShadowContainer, false,  "px");

	const rotDemo = d.getElementById("rotateDemo");
	const rotDemoSld = d.getElementById("rotateDemoSliders");
	dict.sliderSetup(0, 360, 1, 0, "rotateZ", "Rotate Z", "0", "", 1, rotDemoSld, false, "deg");
	dict.sliderSetup(0, 360, 1, 0, "rotateX", "Rotate X", "0", "", 1, rotDemoSld, false, "deg");
	dict.sliderSetup(0, 360, 1, 0, "rotateY", "Rotate Y", "0", "", 1, rotDemoSld, false, "deg");
	dict.sliderSetup(-1000, 100, 1, -100, "translateZ", "Translate Z", "-100", "", 1, rotDemoSld, false, "px");
	dict.sliderSetup(-1000, 1000, 1, 0, "translateX", "Translate X", "0", "", 1, rotDemoSld, false, "px");
	dict.sliderSetup(-1000, 1000, 1, 0, "translateY", "Translate Y", "0", "", 1, rotDemoSld, false, "px");

	setInterval(() => {
		const bsx = d.getElementById("boxShadowXDemoSlide1").value;
		const bsy = d.getElementById("boxShadowYDemoSlide1").value;
		const bsblur = d.getElementById("boxShadowBlurDemoSlide1").value;
		const bsspread = d.getElementById("boxShadowSpreadDemoSlide1").value;
		boxShadowDemo.style.boxShadow = `${bsx}px ${bsy}px ${bsblur}px ${bsspread}px black`;

		const rz = d.getElementById("rotateZDemoSlide1").value;
		const rx = d.getElementById("rotateXDemoSlide1").value;
		const ry = d.getElementById("rotateYDemoSlide1").value;
		const tz = d.getElementById("translateZDemoSlide1").value;
		const tx = d.getElementById("translateXDemoSlide1").value;
		const ty = d.getElementById("translateYDemoSlide1").value;
		rotDemo.style.transform = `rotateZ(${rz}deg) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${tz}px) translateX(${tx}px) translateY(${ty}px)`;
	}, 50)
});
