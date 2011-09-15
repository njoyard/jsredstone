/*
This file is part of JSRedstone - A Javascript Minecraft Redstone simulator
Copyright (c) 2011 Nicolas Joyard

JSRedstone is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

JSRedstone is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with JSRedstone.  If not, see <http://www.gnu.org/licenses/>.
*/

define(['util/const'],
function(cst) {
	return function(gui) {
		var elements, state, worldEditor = {},
			getMouseZones, moveViewport, setMouseAction, setVBlock, removeVBlock;
		
		state = {
			level: 0,			// Current editing level
			top: 0,				// Viewport Y offset
			left: 0,			// Viewport X offset
			vbclass: '',		// Current VBlock CSS class
			mouseHash: '',		// Mouse position cache
			vpcRule: undefined, // CSS rule for viewport items
			mouse: {
				hash: ''
			},
			tool: { type: 'none' }
		};
		
		elements = {
			levels: []
		};
		
		/* Returns a string with chars indicating in which zones the pointer is (n, s, e, w, c)
			in the current block. Returns undefined if unchanged since last call. */
		getMouseZones = function(bx, by, ox, oy) {
			var mouse = '', mhash;

			if (ox > 8 && ox < 24 && oy > 8 && oy < 24) {
				mouse += 'c';
			}

			if (ox > oy) {
				if (oy < 31 - ox) {
					mouse += 'n';
				} else if (oy > 31 - ox) {
					mouse += 'e';
				}
			} else if (ox < oy) {
				if (oy < 31 - ox) {
					mouse += 'w';
				} else if (oy > 31 - ox) {
					mouse += 's';
				}
			}

			mhash = bx + ':' + by + ':' + mouse;
			if (state.mouse.hash === mhash) {
				return;
			}

			state.mouse.hash = mhash;
			return mouse;
		};
		
		/* Move viewport content to (offsetX, offsetY) */
		moveViewport = function(offsetX, offsetY, relative) {
			var dss, rules, i, j;
			
			if (typeof state.vpcRule === 'undefined') {
				// Find CSS rule to match viewport content
				
				dss = document.styleSheets;
				findrule: for (i = 0; i < dss.length; i++) {
					if (dss[i].cssRules) {
						rules = dss[i].cssRules;
						for (j = 0; j < rules.length; j++) {
							if (rules[j].selectorText === '.vpitem') {
								state.vpcRule = rules[j];
								break findrule;
							}
						}
					}
				}
			}
			
			if (relative) {
				offsetX += state.left;
				offsetY += state.top;
			}
			
			state.left = offsetX;
			state.vpcRule.style.marginLeft = offsetX + 'px';
			elements.viewport.style.backgroundPositionX = offsetX + 'px';
			elements.yaxis.style.marginLeft = offsetX + 'px';
			
			state.top = offsetY;
			state.vpcRule.style.marginTop = offsetY + 'px';
			elements.viewport.style.backgroundPositionY = offsetY + 'px';
			elements.xaxis.style.marginTop = offsetY + 'px';
		};
		
		/* Find out what can be done with current tool at mouse position (mouseX, mouseY)
			Mouse coordinates are optional; if unspecified, recompute action with last known coordinates */
		setMouseAction = function(mouseX, mouseY) {
			var bs, ex, ey, bx, by, ox, oy,
				coords, block, nbhood, mouse, ret,
				tool = state.tool;
				
			if (typeof mouseX === 'undefined') {
				mouseX = state.mouse.X;
				mouseY = state.mouse.Y;
				
				// Force recompute
				state.mouse.hash = '';
			} else {
				state.mouse.X = mouseX;
				state.mouse.Y = mouseY;
			} 
	
			if (tool.type === 'none') {
				state.mouseAction = undefined;
				return;
			}
			
			bs = cst.blockSize;
			ex = mouseX - state.left;
			ey = mouseY - state.top;
			bx = Math.floor(ex / bs);
			by = Math.floor(ey / bs);
			ox = ex - bx * bs;
			oy = ey - by * bs;
			coords = {x: bx, y: by, z: state.level};
			block = gui.world.get(coords);
				
			// Set status text to block coordinates
			gui.status.innerText = '(' + bx + ', ' + by + ', ' + state.level + ')';
			
			if (tool.type === 'place') {
				// block place tool
	
				if (typeof block === 'undefined') {
					mouse = getMouseZones(bx, by, ox, oy);
					
					if (typeof mouse !== 'undefined') {
						nbhood = gui.world.findNeighbours(coords);
						ret = tool.placeClass.tryPlace(nbhood, mouse);
	
						if (typeof ret !== 'undefined' && typeof ret.css !== 'undefined') {
							setVBlock(bx, by, 'B_' + ret.css);
							state.mouseAction = {
								place: {
									coords: coords,
									class: tool.placeClass,
									css: ret.css,
									args: ret.args
								}
							};
						} else {
							removeVBlock();
							state.mouseAction = undefined;
						}
					}
				} else {
					state.mouseHash = undefined;
					removeVBlock();
					state.mouseAction = undefined;
				}
			} else if (tool.type === 'erase') {
				if (typeof block === 'undefined') {
					removeVBlock();
					state.mouseAction = undefined;
				} else {
					setVBlock(bx, by, 'remove');
					state.mouseAction = {
						remove: {
							coords: coords
						}
					};
				}
			}
		};
		
		/* Place virtual block at coordinates (x, y) with CSS class className */
		setVBlock = function(x, y, className) {
			var vb = elements.vblock,
				bs = cst.blockSize;
			
			if (className !== state.vbclass) {
				if (state.vbclass !== '') {
					vb.classList.remove(state.vbclass);
				}
				vb.classList.add(className);
				state.vbclass = className;
			}
			
			if (vb.parentNode === null) {
				elements.viewport.appendChild(vb);
			}
			
			vb.style.top = (bs * y) + 'px';
			vb.style.left = (bs * x) + 'px';
		};
		
		/* Remove virtual block */
		removeVBlock = function() {
			var vb = elements.vblock;
			
			if (vb.parentNode !== null) {
				vb.parentNode.removeChild(vb);
			}
		};
	
		/* Render world editor into viewport */
		worldEditor.render = function(viewport) {
			var mousemove, mousewheel, i, e;
			
			elements.viewport = viewport;
			
			// Levels
			for (i = 0; i < cst.maxHeight; i++) {
				e = document.createElement('div');
				e.classList.add('level');
				if (i === 0) {
					e.classList.add('active');
				}
				elements.levels.push(e);
				viewport.appendChild(e);
			}
			
			// Axes
			e = document.createElement('div');
			e.id = 'xaxis';
			viewport.appendChild(e);
			elements.xaxis = e;
			e = document.createElement('div');
			e.id = 'yaxis';
			viewport.appendChild(e);
			elements.yaxis = e;
			
			// Virtual Block (shows block that can be placed at cursor position */
			e = document.createElement('div');
			e.classList.add('vblock');
			e.classList.add('vpitem');
			elements.vblock = e;
		
			// Set mousemove event
			mousemove = (function(e) { return this.mouseMove(e); }).bind(this);
			viewport.addEventListener('mousemove', function(e) { mousemove(e); });
			
			// Set mousewheel events
			mousewheel = (function(e) {
				var delta = e.detail ? e.detail * -1 : e.wheelDelta / 40;
				if (delta > 0) {
					this.setLevel(state.level + 1);
				}
				if (delta < 0) {
					this.setLevel(state.level - 1);
				}
			}).bind(this);
			viewport.addEventListener('DOMMouseScroll', function(e) { mousewheel(e); });
			viewport.addEventListener('mousewheel', function(e) { mousewheel(e); });
			
			
			moveViewport(150, 70);
		};
		
		worldEditor.setTool = function(tool) {
			state.tool = tool;
			setMouseAction();
		};
		
	
		worldEditor.mouseMove = function(e) {
			setMouseAction(e.clientX, e.clientY);
		};
		
		/* Set current editing level */
		worldEditor.setLevel = function(level) {
			var i, levels = elements.levels;
			level = Math.max(0, Math.min(cst.maxHeight - 1, level));
			
			if (level !== state.level) {
				levels[state.level].classList.remove('active');
				levels[level].classList.add('active');
				
				if (level > state.level) {
					for (i = state.level; i < level; i++) {
						levels[i].classList.add('below');
					}
				} else {
					for (i = level; i < state.level; i++) {
						levels[i].classList.remove('below');
					}
				}
				
				state.level = level;
				setMouseAction();
			}
		};
		
		return worldEditor;
	};
});

