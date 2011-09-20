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
		dirs = ['n', 's', 'e', 'w'];

	/* Examine the world around to find connections
		Return an object with n, s, e, w as keys. Each key is present only when there is a connection at this cardinal point.
		Each value is either 'u', '' or 'd' depending on whether the connected block is above, at the same level or below.
	*/
	getConnections = function(nbhood) {
		var out = {}, cnt = 0, only = '',
			i, j, dir, b1, b2;

		for (i = 0; i < 4; i++) {
			dir = dirs[i];

			/* Wire upwards and no block above ? */
			b1 = nbhood['u' + dir]
			b2 = nbhood['u'];
			if ((typeof b1 !== 'undefined' && b1.type === 'wire') && typeof b2 === 'undefined') {
				out[dir] = 'u';
				cnt++;
				only = dir;
				continue;
			}

			/* Wire, torch or button at the same level */
			b1 = nbhood[dir];
			if (typeof b1 !== 'undefined' && (b1.type === 'wire' || b1.type === 'torch' || b1.type === 'button')) {
				out[dir] = '';
				cnt++;
				only = dir;
				continue;
			}

			/* Wire or torch downwards and no block above it */
			b1 = nbhood['d' + dir];
			b2 = nbhood[dir];
			if ((typeof b1 !== 'undefined' && (b1.type === 'wire' || b1.type === 'torch')) &&
				(typeof b2 === 'undefined')) {
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
		this.ovl.classList.add('wire_overlay');
		
		this.clabel = document.createElement('span');
		this.clabel.classList.add('wire_label');
		
		this.connections = {};
		
		this.nbhood.added.add(this.onNeighbourAdded, this);
		this.nbhood.removed.add(this.onNeighbourRemoved, this);
		this.createdElement.add(this.onElementCreated, this);
	};
	WireBlock.inherit(Block);

	WireBlock.prototype.type = 'wire';

	WireBlock.tryPlace = function(nbhood, mouse) {
		var block = nbhood.d;
		
		// Try placement only when block below is solid
		if (nbhood.coords.z === 0 || (typeof block !== 'undefined' && block.type === 'solid')) {
			return {
				css: "rson_" + classFromConnections(getConnections(nbhood)),
				args: []
			};
		}
	};
	
	WireBlock.prototype.onElementCreated = function() {
		this.updateClass();
		this.element.appendChild(this.ovl);
		this.element.appendChild(this.clabel);
	};

	WireBlock.prototype.updateClass = function() {
		this.setClass('rson_' + classFromConnections(this.connections));
	};
	
	WireBlock.prototype.setClass = function(cls) {
		var cl = this.ovl.classList;
		
		WireBlock.base.setClass.call(this, cls);
		
		this.ovl.style.opacity = 1 - (this.charge.curcharge / cst.maxCharge);
		this.clabel.innerText = this.charge.curcharge === 0 ? '' : this.charge.curcharge;
		
		if (typeof cls !== 'undefined') {
			if (typeof this.ovlclass !== 'undefined' && this.ovlclass !== cls) {
				cl.remove(this.ovlclass);
			}
			
			if (this.ovlclass !== cls) {
				this.ovlclass = 'B_' + cls.replace('on', 'off');
				cl.add(this.ovlclass);
			}
		}
	};
	
	WireBlock.prototype.setChargeFrom = function (type, source, charge) {
		var me = this.charge,
			conns = this.connections,
			b = this.nbhood[source],
			c, conn;

		if (typeof this.removing !== 'undefined') {
			// Ignore charges received when removing
			return;
		}
			
		if (source !== me.cursource && (charge + 1) < (me.curcharge - 1)) {
			// receiving power from a less powered part, send back our charge
			if (typeof b !== 'undefined' && b.type === 'wire') {
				b.setChargeFrom('wire', this.nbhood.reverse(source), me.curcharge - 1);
			}
			return;
		}
		
		if (charge > me.curcharge) {
			// new source
			me.curcharge = charge;
			me.cursource = source;
		} else if (source === me.cursource && charge < me.curcharge) {
			// current source lowers its input
			me.curcharge = charge
			me.cursource = charge == 0 ? undefined : source;
		} else {
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
		var conns = this.connections,
			me = this.charge,
			b , c;
			
		for (c in conns) {
			if (conns.hasOwnProperty(c)) {
				conn = conns[c] + c; // Concatenate level and direction
				
				if (typeof me.cursource === 'undefined' || conn !== me.cursource) {
					b = this.nbhood[conn];
					if (typeof b !== 'undefined' && (b.type === 'wire' || b.type === 'solid')) {
						b.setChargeFrom('wire', this.nbhood.reverse(conn), Math.max(0, me.curcharge - 1));
					}
				}
			}
		}
		
		b = this.nbhood.d;
		if (typeof b !== 'undefined') {
			b.setChargeFrom('wire', 'u', me.curcharge);
		}
	};
	
	WireBlock.prototype.onNeighbourAdded = function(key, block) {
		/* Update connections */
		this.connections = getConnections(this.nbhood);
		this.updateClass();
		this.propagateCharge();
	};
	
	WireBlock.prototype.onNeighbourRemoved = function(key) {
		if (key === 'd') {
			// Lost supporting block
			this.requestedRemoval.dispatch();
		} else {
			this.connections = getConnections(this.nbhood);
			this.updateClass();
			this.setChargeFrom('removed', key, 0);
		}
	};
	
	WireBlock.prototype.serialize = function() {
		return {
			dep: 'd'
		};
	};


	return WireBlock;
});
