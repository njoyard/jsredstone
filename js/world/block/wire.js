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

define(['world/block/block', 'util/const'],
function(Block, cst) {
	var WireBlock, getConnections, classFromConnections,
		dirs = ['n', 's', 'e', 'w'],
		nb = Block.NB;

	/* Examine the world around to find connections
		Return an object with n, s, e, w as keys. Each key is present only when there is a connection at this cardinal point.
		Each value is either 'u', '' or 'd' depending on whether the connected block is above, at the same level or below.
	*/
	getConnections = function(world, coords) {
		var out = {}, cnt = 0, only = '',
			i, j, dir, b1, b2;

		for (i = 0; i < 4; i++) {
			dir = dirs[i];

			/* Redstone upwards and no block above ? */
			b1 = world.get(nb.add(coords, nb['u' + dir]));
			b2 = world.get(nb.add(coords, nb.u));
			if ((typeof b1 !== 'undefined' && b1.type === 'wire') && (typeof b2 === 'undefined' || b2.type === 'empty')) {
				out[dir] = 'u';
				cnt++;
				only = dir;
				continue;
			}

			/* Redstone, torch or button at the same level */
			b1 = world.get(nb.add(coords, nb[dir]));
			if (typeof b1 !== 'undefined' && (b1.type === 'wire' || b1.type === 'torch' || b1.type === 'button')) {
				out[dir] = '';
				cnt++;
				only = dir;
				continue;
			}

			/* Redstone or torch downwards and no block at the same level */
			b1 = world.get(nb.add(coords, nb['d' + dir]));
			b2 = world.get(nb.add(coords, nb[dir]));
			if ((typeof b1 !== 'undefined' && (b1.type === 'wire' || b1.type === 'torch')) &&
				(typeof b2 === 'undefined' || b2.type === 'empty')) {
				out[dir] = 'd';
				cnt++;
				only = dir;
				continue;
			}
		}
		
		// If only one connection is found, add a connection at the other end
		if (cnt == 1) {
			switch(only) {
			case 'n':
				out['s'] = '';
				break;
			case 's':
				out['n'] = '';
				break;
			case 'e':
				out['w'] = '';
				break;
			case 'w':
				out['e'] = '';
				break;
			}
		}
		
		return out;
	};
	
	classFromConnections = function (conns) {
		var out = '';
		
		if (typeof conns.n !== 'undefined') {
			out += 'n';
		}
		if (typeof conns.s !== 'undefined') {
			out += 's';
		}
		if (typeof conns.e !== 'undefined') {
			out += 'e';
		}
		if (typeof conns.w !== 'undefined') {
			out += 'w';
		}
		
		if (out === '') {
			out = 'nsew';
		}
		
		return out;
	};

	WireBlock = function (world, coords, args) {
		WireBlock.baseCtor.call(this, world, coords);

		this.charge = {
			curcharge: 0,
			cursource: undefined
		};
		
		this.ovl = document.createElement('div');
		this.ovl.classList.add('block');
		this.ovl.classList.add('rs_ovl');
		
		this.clabel = document.createElement('span');
		this.clabel.classList.add('rs_label');
		
		this.connections = getConnections(this.world, this.coords);
		this.updateClass();
		this.propagateCharge();
	};
	WireBlock.inherit(Block);

	WireBlock.type = 'wire';

	WireBlock.tryPlace = function(world, coords, mouse) {
		var block = world.get(nb.add(coords, nb.d));

		if (coords.z === 0 || (typeof block !== 'undefined' && block.type === 'solid')) {
			return {
				css: "rson_" + classFromConnections(getConnections(world, coords)),
				args: []
			};
		}
	};

	WireBlock.prototype.updateClass = function() {
		this.setClass('rson_' + classFromConnections(this.connections));
	};
	
	WireBlock.prototype.setClass = function(cls) {
		this.ovl.style.opacity = 1 - (this.charge.curcharge / cst.maxCharge);
		this.clabel.innerText = this.charge.curcharge === 0 ? '' : this.charge.curcharge;
		
		if (typeof this.class !== 'undefined') {
			this.ovl.classList.remove('B_' + this.class.replace('on', 'off'));
		}
		
		if (typeof cls !== 'undefined') {
			this.ovl.classList.add('B_' + cls.replace('on', 'off'));
		}
		
		if (typeof cls === 'undefined' && typeof this.class !== 'undefined') {
			this.ovl.classList.add('B_' + this.class.replace('on', 'off'));
		}
		
		WireBlock.base.setClass.call(this, cls);
	};
	
	WireBlock.prototype.setChargeFrom = function (type, source, charge) {
		var //tc = nb.str(this.coords),
			me = this.charge,
			conns = this.connections,
			b = this.get(source),
			c, conn;
			
		// console.log(tc + " receive " + charge + " from " + source);

		if (typeof this.removing !== 'undefined') {
			// Ignore charges received when removing
			// console.log("+ removing; charge ignored");
			return;
		}
			
		if (source !== me.cursource && b.type === 'wire' && (charge + 1) < (me.curcharge - 1)) {
			// receiving power from a less powered part, send back our charge
			// console.log("+ send back because curcharge = " + me.curcharge);
			b.setChargeFrom('wire', nb.revkey(source), me.curcharge - 1);
			return;
		}
		
		// TODO manage multiple sources (when max charge is received equally from multiple sources)
		if (charge > me.curcharge) {
			// new source
			// console.log("+ this is the new source");
			me.curcharge = charge;
			me.cursource = source;
		} else if (source === me.cursource && charge < me.curcharge) {
			// current source lowers its input
			// console.log("+ current source lowers charge");
			me.curcharge = charge
			me.cursource = charge == 0 ? undefined : source;
		} else {
			// console.log("+ done");
			return;
		}
		
		this.updateClass();
		this.propagateCharge();
	};
	
	WireBlock.prototype.getChargeFrom = function(dir) {
		return this.charge.curcharge;
	};
	
	// Propagate charge to connections except current source, and to block below
	WireBlock.prototype.propagateCharge = function () {
		var //tc = nb.str(this.coords),
			conns = this.connections,
			me = this.charge,
			b , c;
			
		// console.log(tc + " propagating");
		for (c in conns) {
			if (conns.hasOwnProperty(c)) {
				conn = conns[c] + c; // Concatenate level and direction
				if (typeof me.cursource === 'undefined' || conn !== me.cursource) {
					b = this.get(conn);
					if (typeof b !== 'undefined' && (b.type === 'wire' || b.type === 'solid')) {
						// console.log("+ propagate to " + conn);
						b.setChargeFrom('wire', nb.revkey(conn), Math.max(0, me.curcharge - 1));
					}
				}
			}
		}
		
		b = this.get('d');
		if (typeof b !== 'undefined') {
			b.setChargeFrom('wire', 'u', me.curcharge);
		}
	};
	
	WireBlock.prototype.onWorldChanged = function(coords) {
		var block;
		
		/* Request removal if block below was removed */
		if (nb.equals(coords, nb.add(this.coords, nb.d))) {
			block = this.world.get(coords);
			if (typeof block !== 'undefined' && block.type !== 'solid') {
				return true;
			}
		}
		
		/* Update connections */
		this.connections = getConnections(this.world, this.coords);
		this.updateClass();
		
		return false;
	};
	
	WireBlock.prototype.onRemove = function() {
		var i, me = this.charge;
		
		if (typeof this.ovl.offsetParent !== 'undefined') {
			this.ovl.offsetParent.removeChild(this.ovl);
		}
		
		
		if (typeof this.clabel.offsetParent !== 'undefined') {
			this.clabel.offsetParent.removeChild(this.clabel);
		}
		
		this.removing = true;
		
		// Remove charge and propagate it
		me.curcharge = 0;
		me.cursource = undefined;
		this.propagateCharge();
	};
	
	WireBlock.prototype.onElementCreated = function() {
		this.element.appendChild(this.ovl);
		this.element.appendChild(this.clabel);
	};
	
	WireBlock.prototype.serialize = function() {
		return {
			dep: nb.d
		};
	};

	return WireBlock;
});
