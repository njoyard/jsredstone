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

define(['lib/signals'],
function(signals) {
	var Neighborhood, lk, nk;
	
	Neighborhood = function(block) {
		this.block = block;	
		
		this.added = new signals.Signal();
		this.removed = new signals.Signal();
	}

	/* LEVEL_KEYS: keys for neighbours at the same level */
	Neighborhood.prototype.LEVEL_KEYS = Neighborhood.LEVEL_KEYS = lk = [
		'n', 's', 'e', 'w', 'ne', 'se', 'nw', 'sw',
	];
	
	/* NEIGHBOUR_KEYS: keys for all neighbours (incl. above and below) */
	nk = lk.map(function(x) { return x; }).concat(['u']).
		concat(lk.map(function(x) { return 'u' + x; })).
		concat(['d']).concat(lk.map(function(x) { return 'd' + x; }));
	Neighborhood.prototype.NEIGHBOUR_KEYS = Neighborhood.NEIGHBOUR_KEYS = nk;
	
	/* Transform coordinates into neighbour key */
	Neighborhood.prototype.keyFromCoords = Neighborhood.keyFromCoords = function(coords) {
		var ret = '';
		
		if (coords.z === -1) {
			ret += 'd';
		} else if (coords.z === 1) {
			ret += 'u';
		}
		
		if (coords.y === -1) {
			ret += 'n';
		} else if (coords.y === 1) {
			ret += 's';
		}
		
		if (coords.x === -1) {
			ret += 'w';
		} else if (coords.x === 1) {
			ret += 'e';
		}
		
		return ret;
	};
	
	/* Transform neighbour key into coordinates */
	Neighborhood.prototype.coordsFromKey = Neighborhood.coordsFromKey = function(key) {
		var ret = { x: 0, y: 0, z: 0 };
		
		if (key.indexOf('d') !== -1) {
			ret.z = -1;
		} else if (key.indexOf('u') !== -1) {
			ret.z = 1;
		}
		
		if (key.indexOf('n') !== -1) {
			ret.y = -1;
		} else if (key.indexOf('s') !== -1) {
			ret.y = 1;
		}
		
		if (key.indexOf('w') !== -1) {
			ret.x = -1;
		} else if (key.indexOf('e') !== -1) {
			ret.x = 1;
		}
		
		return ret;
	};
	
	/* Reverse neighbour key or coordinates */
	Neighborhood.prototype.reverse = function(o) {
		var ob;
		
		if (typeof o === 'string') {
			ob = this.coordsFromKey(o);
			return this.keyFromCoords({ x: -ob.x, y: -ob.y, z: -ob.z });
		} else {
			return {x: -o.x, y: -o.y, z: -o.z };
		}
	};
	
	/* Add a neighbour */
	Neighborhood.prototype.add = function(key, block) {
		if (typeof this[key] !== 'undefined') {
			throw "Cannot redefine neighbour";
		}
		
		this[key] = block;
		console.log(this.block.coords.x + ","+this.block.coords.y +","+this.block.coords.z+ " - add block at " + key);
		this.added.dispatch(key, block);
	}
	
	/* Remove a neighbour */
	Neighborhood.prototype.remove = function(key) {
		if (typeof this[key] === 'undefined') {
			throw "Cannot remove undefined neighbour";
		}
		
		delete this[key];
		console.log(this.block.coords.x + ","+this.block.coords.y +","+this.block.coords.z+ " - remove block at " + key);
		this.removed.dispatch(key);
	}
	
	/* Associate neighbour blocks */
	Neighborhood.prototype.bindAll = function(blocks) {
		var block, key, rkey;
		
		for (key in blocks) {
			if (blocks.hasOwnProperty(key) && key !== 'coords') {
				block = blocks[key];
				rkey = this.reverse(key);
				
				this.add(key, block);
				block.nbhood.add(rkey, this.block);
			}
		}
	};
	
	/* Unbind all neighbours (to be called on block removal) */
	Neighborhood.prototype.unbindAll = function() {
		var keys = this.NEIGHBOUR_KEYS,
			len = keys.length,
			i, rkey;
			
		for (i = 0; i < len; i++) {
			if (typeof this[keys[i]] !== 'undefined') {
				this.remove(keys[i]);
				rkey = this.reverse(keys[i]);
				this[keys[i]].nbhood.remove(rkey);
			}
		}
	};
	
	return Neighborhood;
});
