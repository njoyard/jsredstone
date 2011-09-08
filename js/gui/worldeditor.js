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

define(['blocks'],
function(blocks) {
	var WorldEditor,
		nb = blocks.Block.NB,
		ceq = nb.equals,
		adj = nb.adjacent;

	WorldEditor = function(gui) {
		this.gui = gui;
	};

	/* Set current level editor to lvl */
	WorldEditor.prototype.setLevel = function(lvl) {
		var i, len = this.levels.length;

		lvl = Math.min(len - 1, Math.max(0, lvl));
		this.gui.setLevelInput(lvl);
		this.curLevel = lvl;
		for (i = 0; i < len; i++) {
			this.levels[i].style.visibility = (i <= lvl ? "visible" : "hidden");
		}
	};

	/* Place VBlock */
	WorldEditor.prototype.setVBlock = function (coords, cls) {
		var vb = this.vblock;

		if (typeof coords === 'undefined' || typeof vb.coords === 'undefined' || !ceq(coords, vb.coords) || cls !== vb.curClass) {
			// VBlock changed coordinates or disappeared
			this.removeVBlock();

			if (typeof coords !== 'undefined') {
				this.levels[coords.z].rows[coords.y].blocks[coords.x].appendChild(vb);
				vb.coords = coords;

				if (cls !== vb.curClass) {
					vb.classList.remove('B_' + vb.curClass);
					vb.classList.add('B_' + cls);
					vb.curClass = cls;
				}
			}
		}
	};

	/* Remove VBlock */
	WorldEditor.prototype.removeVBlock = function() {
		var vb = this.vblock;

		if (typeof vb.parentElement !== 'undefined' && vb.parentElement !== null) {
			vb.parentElement.removeChild(vb);
		}

		vb.coords = undefined;
	};

	/* Render world editor into viewport */
	WorldEditor.prototype.render = function(viewport) {
		var level, lvlbg, row, block, be,
			mousemove, mousemovedoc, mouseclick, mousewheel,
			x, y, z, height, width, depth,
			world = this.gui.world;

		mousemove = (function(blockelement, e) {
			this.mouseMoveBlock(blockelement, e);
		}).bind(this);

		mousemovedoc = (function() {
			this.removeVBlock();
			this.clickAction = undefined;
		}).bind(this);

		mouseclick = (function(blockelement) {
			this.clickBlock(blockelement);
		}).bind(this);

		mousewheel = (function(e) {
			this.scrollWheel(e);
		}).bind(this);

		document.addEventListener('mousemove', function(e) { mousemovedoc(); });
		viewport.addEventListener('DOMMouseScroll', function(e) { mousewheel(e); });
		viewport.addEventListener('mousewheel', function(e) { mousewheel(e); });

		this.levels = [];
		for (z = 0, depth = world.size.depth; z < depth; z++) {
			level = document.createElement('div');
			level.classList.add('level');

			lvlbg = document.createElement('div');
			lvlbg.classList.add('levelbg');
			level.appendChild(lvlbg);

			level.rows = [];
			for (y = 0, height = world.size.height; y < height; y++) {
				row = document.createElement('div');
				row.classList.add('levelrow');
				row.style.top = (32 * y) + "px";

				row.blocks = [];
				for (x = 0, width = world.size.width; x < width; x++) {
					be = document.createElement('div');
					be.classList.add('block');
					be.addEventListener('mousemove', function(e) { mousemove(this, e); e.stopPropagation(); });
					be.addEventListener('click', function() { mouseclick(this); }, false);
					be.addEventListener('mouseover', function() { this.block.onHover(); });

					block = world.get({x:x, y:y, z:z});
					block.element = be;
					be.block = block;
					block.onElementCreated();
					block.setClass();

					row.blocks.push(be);
					row.appendChild(be);
				}

				level.rows.push(row);
				level.appendChild(row);
			}

			this.levels.push(level);
			viewport.appendChild(level);
		};

		this.vblock = document.createElement('div');
		this.vblock.classList.add('vblock');
	};

	WorldEditor.prototype.scrollWheel = function(e) {
		var delta = e.detail ? e.detail * -1 : e.wheelDelta / 40;
		if (delta > 0) {
			this.setLevel(this.curLevel + 1);
		}
		if (delta < 0) {
			this.setLevel(this.curLevel - 1);
		}
	};

	/* Returns a string with chars indicating in which zones the pointer is (n, s, e, w, c)
	  in the current block. Returns undefined if unchanged from last call. */
	WorldEditor.prototype.getMouseBlockPos = function(coords, e) {
		var mouse = '', mhash,
			ex = e.offsetX, ey = e.offsetY;

		if (ex > 8 && ex < 24 && ey > 8 && ey < 24) {
			mouse += 'c';
		}

		if (ex > ey) {
			if (ey < 31 - ex) {
				mouse += 'n';
			} else if (ey > 31 - ex) {
				mouse += 'e';
			}
		} else if (ex < ey) {
			if (ey < 31 - ex) {
				mouse += 'w';
			} else if (ey > 31 - ex) {
				mouse += 's';
			}
		}

		mhash = coords.x + ':' + coords.y + ':' + coords.z + ':' + mouse;
		if (this.lastMouseHash === mhash) {
			return;
		}

		this.lastMouseHash = mhash;
		return mouse;
	};

	/* Block mousemove handler */
	WorldEditor.prototype.mouseMoveBlock = function(element, e) {
		var coords = element.block.coords,
			type = element.block.type,
			gui = this.gui,
			tool = gui.tools[gui.curTool],
			world = gui.world,
			ret, mouse;

		if (typeof tool === 'undefined') {
			this.clickAction = undefined;
			return;
		}

		if (typeof tool.placeClass !== 'undefined') {
			// block place tool

			if (type === 'empty') {
				mouse = this.getMouseBlockPos(coords, e);
				if (typeof mouse !== 'undefined') {
					ret = tool.placeClass.tryPlace(world, coords, mouse);

					if (typeof ret !== 'undefined' && typeof ret.css !== 'undefined') {
						this.setVBlock(coords, ret.css);
						this.clickAction = {
							place: {
								coords: coords,
								class: tool.placeClass,
								css: ret.css,
								args: ret.args
							}
						};
					} else {
						this.removeVBlock();
						this.clickAction = undefined;
					}
				}
			} else {
				this.lastMouseHash = undefined;
				this.removeVBlock();
				this.clickAction = undefined;
			}
		} else if (this.gui.curTool === 'shovel') {
			if (type === 'empty') {
				this.removeVBlock();
				this.clickAction = undefined;
			} else {
				this.setVBlock(coords, 'remove');
				this.clickAction = {
					remove: {
						coords: coords
					}
				};
			}
		}
	};

	WorldEditor.prototype.removeBlock = function(element, coords) {
		var world = this.gui.world,
			block;

		// Dissociate old block
		block = element.block;
		block.onRemove();
		element.classList.remove('B_' + block.class);
		element.block = undefined;
		block.element = undefined;

		// Create new empty block and associate with element
		block = new blocks.Empty(world, coords);
		element.block = block;
		block.element = element;
		block.setClass();

	};

	WorldEditor.prototype.addBlock = function(element, coords, cls, args) {
		var world = this.gui.world,
			block;
			
		if (typeof element === 'undefined') {
			element = this.levels[coords.z].rows[coords.y].blocks[coords.x];
		}

		// Dissociate old block
		block = element.block;
		element.block = undefined;
		block.element = undefined;

		// Create new block and associate with element
		block = new cls(world, coords, args);
		element.block = block;
		block.element = element;
		block.onElementCreated();
		block.setClass();
	};
	
	WorldEditor.prototype.clearWorld = function() {
		var x, y, z, height, width, depth,
			world = this.gui.world,
			block, element;
		
		for (z = 0, depth = world.size.depth; z < depth; z++) {
			for (y = 0, height = world.size.height; y < height; y++) {
				for (x = 0, width = world.size.width; x < width; x++) {
					block = world.get({x:x, y:y, z:z});
					element = block.element;
					
					if (typeof block !== 'undefined' && block.type !== 'empty') {
						// Dissociate old block
						block = element.block;
						block.onRemove();
						element.classList.remove('B_' + block.class);
						element.block = undefined;
						block.element = undefined;

						// Create new empty block and associate with element
						block = new blocks.Empty(world, {x:x, y:y, z:z});
						element.block = block;
						block.element = element;
						block.setClass();
					}
				}
			}
		}
	};

	/* Block click handler */
	WorldEditor.prototype.clickBlock = function(element) {
		var coords = element.block.coords,
			world = this.gui.world,
			wc = false,
			act, len, i, block;

		if (typeof this.clickAction !== 'undefined') {
			act = this.clickAction.place;
			if (typeof act != 'undefined') {
				if (ceq(act.coords, coords)) {
					wc = true;
					this.addBlock(element, coords, act.class, act.args);
				} else {
					this.clickAction = undefined;
				}
			}

			act = this.clickAction.remove;
			if (typeof act != 'undefined') {
				if (ceq(act.coords, coords)) {
					wc = true;
					this.removeBlock(element, coords);
				} else {
					this.clickAction = undefined;
				}
			}

			if (wc) {
				// Launch world change events
				for (i = 0, len = adj.length; i < len; i++) {
					block = world.get(nb.add(coords, nb[adj[i]]));
					if (typeof block !== 'undefined') {
						if (block.onWorldChanged(coords)) {
							this.removeBlock(block.element, block.coords);
						}
					}
				}
			}
		} else {
			element.block.onClick();
		}
	};

	return WorldEditor;
});
