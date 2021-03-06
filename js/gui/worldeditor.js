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

define(['util/const', 'util/storage', 'world/blocks'],
function(cst, storage, blocks) {
	return function(gui) {
		var elements, state, worldEditor = {},
			getMouseZones, moveViewport,
			findMouseAction, performMouseAction,
			setVBlock, removeVBlock,
			addBlock, removeBlock, updateMaxes,
			mouseDown, mouseUp, mouseMove, mouseWheel,
			saveState, restoreState;
		
		state = {
			level: 0,
			top: 0,
			left: 0,
			vbclass: '',
			mouse: { hash: '', button: false },
			tool: { type: 'none' },
			maxes: {
				x: {},
				y: {},
				maxX: -Infinity,
				minX: Infinity,
				maxY: -Infinity,
				minY: Infinity
			},
			undo: [],
			undoing: false
		};
		
		elements = { levels: [] };
		
		
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
			var dss, rules, i, j,
				maxes = state.maxes,
				arrows = elements.arrows;
			
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
			
			/* Arrows */
			if (-offsetY > (maxes.minY + 1) * cst.blockSize) {
				arrows.n.classList.add('visible');
			} else {
				arrows.n.classList.remove('visible');
			}
			
			if (-offsetX > (maxes.minX + 1) * cst.blockSize) {
				arrows.w.classList.add('visible');
			} else {
				arrows.w.classList.remove('visible');
			}
			
			if (maxes.maxY * cst.blockSize > window.innerHeight - offsetY) {
				arrows.s.classList.add('visible');
			} else {
				arrows.s.classList.remove('visible');
			}
			
			if (maxes.maxX * cst.blockSize > window.innerWidth - offsetX) {
				arrows.e.classList.add('visible');
			} else {
				arrows.e.classList.remove('visible');
			}
		};
		
		
		/* Find out what can be done with current tool at mouse position (mouseX, mouseY)
			Mouse coordinates are optional; if unspecified, recompute action with last known coordinates */
		findMouseAction = function(mouseX, mouseY) {
			var bs, ex, ey, bx, by, ox, oy,
				coords, block, nbhood, mouse, ret,
				tool = state.tool;
				
			if (typeof mouseX === 'undefined') {
				if (typeof state.mouse.X === 'undefined') {
					return;
				}
				
				mouseX = state.mouse.X;
				mouseY = state.mouse.Y;
				
				// Force recompute
				state.mouse.hash = '';
			} else {
				state.mouse.X = mouseX;
				state.mouse.Y = mouseY;
			} 
	
			if (tool.type === 'none' || tool.type === 'pan') {
				delete state.mouse.action;
				removeVBlock();
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
							state.mouse.action = {
								type: 'place',
								coords: coords,
								class: tool.placeClass,
								css: ret.css,
								args: ret.args
							};
						} else {
							delete state.mouse.action;
							removeVBlock();
						}
					}
				} else {
					state.mouse.hash = '';
					delete state.mouse.action;
					removeVBlock();
				}
			} else if (tool.type === 'erase') {
				if (typeof block === 'undefined') {
					delete state.mouse.action;
					removeVBlock();
				} else {
					setVBlock(bx, by, 'remove');
					state.mouse.action = { type: 'remove', coords: coords };
				}
			}
		};
		
		
		/* Perform current mouse action */
		performMouseAction = function() {
			var act = state.mouse.action;
			
			if (typeof act !== 'undefined') {
				switch (act.type) {
				case 'place':
					addBlock(act.coords, act.class, act.args);
					break;
					
				case 'remove':
					removeBlock(act.coords);
					break;
				}
			}
			
			findMouseAction();
		};
		
		
		/* Add a block */
		addBlock = function(coords, blockClass, args) {
			var world = gui.world,
				block = world.get(coords),
				bs = cst.blockSize,
				e;
				
			if (typeof block !== 'undefined') {
				throw "Cannot place block, a block already exists here";
			}
			
			/* Create world block */
			block = new blockClass(world, coords, args);
			block.requestedRemoval.addOnce(function() { removeBlock(coords); });
			
			world.set(coords, block);
			updateMaxes(coords);
			
			/* Create UI block */
			e = document.createElement('div');
			e.classList.add('block');
			e.classList.add('vpitem');
			e.style.left = (coords.x * bs) + 'px';
			e.style.top = (coords.y * bs) + 'px';
			elements.levels[coords.z].appendChild(e);
			
			block.element = e;
			block.createdElement.dispatch();
			blockClass.placed.dispatch(1);
			
			if (!state.undoing) {
				state.undo.push(function() {
					removeBlock(coords);
				});
			}
		};
		
		
		/* Remove a block */
		removeBlock = function(coords) {
			var world = gui.world,
				block = world.get(coords),
				blockargs,
				blockclass;
				
			if (typeof block === 'undefined') {
				throw "No block to remove";
			}
			
			blockargs = block.serialize().args;
			blockclass = block.constructor;
			
			block.removed.dispatch();
			world.unset(coords);
			updateMaxes(coords, true);
			blockclass.placed.dispatch(-1);
			
			if (!state.undoing) {
				state.undo.push(function() {
					addBlock(coords, blockclass, blockargs);
				});
			}
		};
		
		
		/* Maintain x, y extrema values by keeping each coordinate usage count */
		updateMaxes = function(coords, remove) {
			var mx = state.maxes,
				x = coords.x,
				y = coords.y;
			
			if (remove) {
				if (mx.x[x] === 1) {
					delete mx.x[x];
					
					if (x === mx.maxX) {
						mx.maxX = Math.max.apply(Math, Object.keys(mx.x));
					}
					if (x === mx.minX) {
						mx.minX = Math.min.apply(Math, Object.keys(mx.x));
					}
				} else {
					mx.x[x] -= 1;
				}
				
				if (mx.y[y] === 1) {
					delete mx.y[y];
					
					if (y === mx.maxY) {
						mx.maxY = Math.max.apply(Math, Object.keys(mx.y));
					}
					if (y === mx.minY) {
						mx.minY = Math.min.apply(Math, Object.keys(mx.y));
					}
				} else {
					mx.y[y] -= 1;
				}
			} else {
				if (typeof mx.x[x] === 'undefined') {
					mx.x[x] = 1;
					
					if (typeof mx.maxX === 'undefined' || x > mx.maxX) {
						mx.maxX = x;
					}
					if (typeof mx.minX === 'undefined' || x < mx.minX) {
						mx.minX = x;
					}
				} else {
					mx.x[x] += 1;
				}
				
				if (typeof mx.y[y] === 'undefined') {
					mx.y[y] = 1;
					
					if (typeof mx.maxY === 'undefined' || y > mx.maxY) {
						mx.maxY = y;
					}
					if (typeof mx.minY === 'undefined' || y < mx.minY) {
						mx.minY = y;
					}
				} else {
					mx.y[y] += 1;
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
		
		
		/* Mouse wheel handler: change levels */
		mouseWheel = (function(e) {
			var delta = e.detail ? e.detail * -1 : e.wheelDelta / 40;
			if (delta > 0) {
				this.setLevel(state.level + 1);
			}
			if (delta < 0) {
				this.setLevel(state.level - 1);
			}
		}).bind(worldEditor);
		
		
		/* Mouse move handler */
		mouseMove = function(e) {
			if (state.mouse.button && (state.tool.type === 'pan' || e.button === 1)) {
				moveViewport(e.clientX - state.pan.prevX, e.clientY - state.pan.prevY, true);
				state.pan.prevX = e.clientX;
				state.pan.prevY = e.clientY;
			} else {
				findMouseAction(e.clientX, e.clientY);
			
				if (state.mouse.button) {
					performMouseAction();
				}
			}
			
			e.preventDefault();
		};
		
		
		/* Mouse down handler */
		mouseDown = function(e) {
			state.mouse.button = true;
			
			if (state.tool.type === 'pan' || e.button === 1) {
				state.pan = {
					prevX: e.clientX,
					prevY: e.clientY
				};
			} else {
				performMouseAction();
			}
			
			e.preventDefault();
		};
		
		
		/* Mouse up handler */
		mouseUp = function(e) {
			state.mouse.button = false;
			
			if (state.tool.type === 'pan' || e.button === 1) {
				delete state.pan;
			}
		};
		
		
		/******************** Public World Editor interface ********************/
	
	
		/* Render world editor into viewport */
		worldEditor.render = function(viewport) {
			var i, e;
			
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
			
			// Virtual Block (shows block that can be placed at cursor position)
			e = document.createElement('div');
			e.classList.add('vblock');
			e.classList.add('vpitem');
			elements.vblock = e;
			
			// Side arrows (show when blocks are outside the viewport)
			elements.arrows = {};
			cst.dirs.forEach(function(dir) {
				var e = document.createElement('div');
				e.classList.add('arrow');
				e.classList.add('arrow_' + dir);
				viewport.appendChild(e);
				elements.arrows[dir] = e;
			});
		
			// Set mouse events
			viewport.addEventListener('mousemove', function(e) { mouseMove(e); });
			viewport.addEventListener('mousedown', function(e) { mouseDown(e); });
			viewport.addEventListener('mouseup', function(e) { mouseUp(e); });
			
			// Set mousewheel events
			viewport.addEventListener('DOMMouseScroll', function(e) { mouseWheel(e); });
			viewport.addEventListener('mousewheel', function(e) { mouseWheel(e); });
		};
		
		
		/* Set editor tool */
		worldEditor.setTool = function(tool) {
			var undofunc;
			
			switch(tool.type) {
				case 'undo':
					undofunc = state.undo.pop();
					if (typeof undofunc !== 'undefined') {
						state.undoing = true;
						undofunc();
						state.undoing = false;
					}
					return;
					
				case 'place':
					elements.viewport.style.cursor = 'crosshair';
					break;
					
				case 'pan':
					elements.viewport.style.cursor = 'move';
					break;
					
				default:
					elements.viewport.style.cursor = 'default';
					break;
			}
		
			state.tool = tool;
			findMouseAction();
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
				findMouseAction();
			}
		};
		
		
		/* Returns an object representing current editor state (incl. world) that can be restored
			with restoreState later */
		worldEditor.saveState = function() {
			var savedWorld,
				world = gui.world,
				vworld = {},
				X, Y, Z, saveBlock,
				bZ, bZY;
			
			savedWorld = [];
		
			saveBlock = function(x, y, z) {
				var block, b, db;
				
				if (vworld[z] && vworld[z][y] && vworld[z][y][x]) {
					// Block already saved
					return; 
				}
			
				block = world.get({ x:x, y:y, z:z });
				if (typeof block !== 'undefined') {
					b = block.serialize();
				
					if (typeof b !== 'undefined') {
						// Remember we saved this block
						vworld[z] = vworld[z] || {};
						vworld[z][y] = vworld[z][y] || {};
						vworld[z][y][x] = true;
				
						// Save block dependency first
						if (typeof b.dep !== 'undefined' && typeof block.nbhood[b.dep] !== 'undefined') {
							db = block.nbhood[b.dep];
							saveBlock(db.coords.x, db.coords.y, db.coords.z);
						}
			
						// Save block
						if (typeof b.args !== 'undefined' && b.args != null) {
							savedWorld.push([
								x, y, z,
								block.type.substring(0, 2),
								b.args
							]);
						} else {
							savedWorld.push([
								x, y, z,
								block.type.substring(0, 2)
							]);
						}
					}
				}
			};
			
			for (Z in world.blocks) {
				if (world.blocks.hasOwnProperty(Z)) {
					bZ = world.blocks[Z];
					for (Y in bZ) {
						if (bZ.hasOwnProperty(Y)) {
							bZY = bZ[Y];
							for (X in bZY) {
								if (bZY.hasOwnProperty(X)) {
									saveBlock(X, Y, Z);
								}
							}
						}
					}
				}
			}
			
			return {
				v: 2,
				l: state.level,
				x: state.left,
				y: state.top,
				w: savedWorld
			};
		};
		
		
		/* Restores editor state as returned by saveState */
		worldEditor.restoreState = function(stateobj) {
			if (stateobj.v === 2) {
				// Stop world ticks
				gui.stopTicking();
				
				// Empty world
				gui.world.empty().forEach(function(e) {
					if (e.parentNode) {
						e.parentNode.removeChild(e);
					}
				});
				
				// Reset maxes
				state.maxes = {
					x: {},
					y: {},
					maxX: -Infinity,
					minX: Infinity,
					maxY: -Infinity,
					minY: Infinity
				};
				
				// Reset GUI
				gui.resetted.dispatch();
			
				// Restore blocks
				stateobj.w.forEach(function(b) {
					var coords = { x: b[0], y: b[1], z: b[2] },
						blockClass = blocks.abbr[b[3]],
						args = b[4];
						
					addBlock(coords, blockClass, args);
				});
				
				// Restore level and panning
				this.setLevel(stateobj.l);
				moveViewport(stateobj.x, stateobj.y);
			
				// Reset undo history
				state.undo = [];
				
				// Mark world as not edited
				gui.world.edited = false;
				
				// Restart ticking
				gui.startTicking();
			}
		};
		
		
		/* Starts a new world */
		worldEditor.newWorld = function() {
			// Stop world ticks
			gui.stopTicking();
			
			// Empty world
			gui.world.empty().forEach(function(e) {
				if (e.parentNode) {
					e.parentNode.removeChild(e);
				}
			});
			
			// Reset level and panning
			this.setLevel(0);
			moveViewport(0, 0);
				
			// Reset GUI
			gui.resetted.dispatch();
			
			// Reset undo history
			state.undo = [];
			
			// Mark world as not edited
			gui.world.edited = false;
				
			// Restart ticking
			gui.startTicking();
		};
		
		return worldEditor;
	};
});
