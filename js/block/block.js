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

define([],
function () {
	var Block;

	Block = function (world, coords) {
		this.world = world;
		this.coords = coords;
		this.type = this.__proto__.constructor.type;
		this.element = undefined;
		this.class = undefined;
		world.set(coords, this);
	};

	Block.type = 'block';

	/* Neighbour blocks utilities */
	Block.NB = {
		/* same level */
		n: {x: 0, y: -1, z: 0},
		s: {x: 0, y: 1, z: 0},
		e: {x: 1, y: 0, z: 0},
		w: {x: -1, y: 0, z: 0},
		ne: {x: 1, y: -1, z: 0},
		se: {x: 1, y: 1, z: 0},
		nw: {x: -1, y: -1, z: 0},
		sw: {x: -1, y: 1, z: 0},

		/* down */
		d: {x: 0, y: 0, z: -1},
		dn: {x: 0, y: -1, z: -1},
		ds: {x: 0, y: 1, z: -1},
		de: {x: 1, y: 0, z: -1},
		dw: {x: -1, y: 0, z: -1},
		dne: {x: 1, y: -1, z: -1},
		dse: {x: 1, y: 1, z: -1},
		dnw: {x: -1, y: -1, z: -1},
		dsw: {x: -1, y: 1, z: -1},

		/* up */
		u: {x: 0, y: 0, z: 1},
		un: {x: 0, y: -1, z: 1},
		us: {x: 0, y: 1, z: 1},
		ue: {x: 1, y: 0, z: 1},
		uw: {x: -1, y: 0, z: 1},
		une: {x: 1, y: -1, z: 1},
		use: {x: 1, y: 1, z: 1},
		unw: {x: -1, y: -1, z: 1},
		usw: {x: -1, y: 1, z: 1},

		/* Neighbour lists */
		adjacent: ['n', 's', 'e', 'w', 'ne', 'se', 'nw', 'sw',
			'd', 'dn', 'ds', 'de', 'dw', 'dne', 'dse', 'dnw', 'dsw',
			'u', 'un', 'us', 'ue', 'uw', 'une', 'use', 'unw', 'usw'],
		
		/* Reverse key */
		revkey: function(k) {
			return k.toUpperCase().replace('N', 's').replace('S', 'n').replace('E', 'w').replace('W', 'e').replace('U', 'd').replace('D', 'u');
		},

		/* Operations */
		diff: function (a, b) {
			return {
				x: a.x - b.x,
				y: a.y - b.y,
				z: a.z - b.z
			};
		},
		add: function (a, b) {
			return {
				x: a.x + b.x,
				y: a.y + b.y,
				z: a.z + b.z
			};
		},
		equals: function (a, b) {
			return a.x === b.x && a.y === b.y && a.z === b.z;
		},
		str: function(a) {
			return '(' + a.x + ',' + a.y + ',' + a.z + ')';
		},
		key: function(a) {
			var ret = '';
			
			if (a.z === 1) {
				ret += 'u';
			} else if (a.z === -1) {
				ret += 'd';
			}
			
			if (a.y === 1) {
				ret += 's';
			} else if (a.y === -1) {
				ret += 'n';
			}
			
			if (a.x === 1) {
				ret += 'e';
			} else if (a.x === -1) {
				ret += 'w';
			}
			
			return ret;
		}
	};

	/* Relative block getter; c can be either a coords object or a cardinal position */
	Block.prototype.get = function(c) {
		var coords = (typeof c === 'string' ? Block.NB[c] : c);
	
		return this.world.get({
			x: coords.x + this.coords.x,
			y: coords.y + this.coords.y,
			z: coords.z + this.coords.z
		});
	};

	/* Get this block charge as seen from the block at cardinal position relkey */
	Block.prototype.getChargeFrom = function (relkey) {
		return 0;
	};

	/* Transmit charge to this block
		type: source block type
		relkey: source block cardinal position
		charge: amount of charge to transmit */
	Block.prototype.setChargeFrom = function (type, relkey, charge) {
	};

	/* Set block class. Call with cls=undefined to set initial class */
	Block.prototype.setClass = function(cls) {
		var i, len, cl;

		if (typeof this.element === 'undefined') {
			this.class = cls;
		} else {
			cl = this.element.classList;
			if (typeof cls === 'undefined' && typeof this.class !== undefined) {
				cl.remove('B_empty');
				cl.add('B_' + this.class);
			} else {
				cl.remove('B_' + this.class);
				cl.add('B_' + cls)
				this.class = cls;
			}
		}
	};
	
	/* Called when the DOM element has been created for this block (accessible with this.element) */
	Block.prototype.onElementCreated = function() { };

	/* Called when a neighbour block has changed type (empty => non-empty or the reverse)
	   coords contains the coordinates of the block that changed.

	   Must return true if the block must be removed as a consequence of the world change.
	 */
	Block.prototype.onWorldChanged = function(coords) { return false; };

	/* Called before removing block from the world */
	Block.prototype.onRemove = function() { };
	
	Block.prototype.onClick = function() { };
	
	Block.prototype.onHover = function() { };
	
	/* World save block serialization
		Return undefined if the block is empty or otherwise not serializable
		Else return an object with the following keys (all optional) :
		- args: an object to pass as a constructor argument
		- dep: a coordinates object pointing to a block that must be restored (thus saved) before this one */
	Block.prototype.serialize = function() {
		return undefined;
	};

	return Block;
});
