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

define(['world/neighborhood', 'lib/signals'],
function (Neighborhood, signals) {
	var World;

	World = function () {
		this.blocks = {};
		this.tickCount = 0;
		this.edited = false;
		
		this.ticked = new signals.Signal();
	};
	
	/* Empty world and return elements */
	World.prototype.empty = function() {
		var bz, bzy, x, y, z, elements = [];
		
		for (z in this.blocks) {
			if (this.blocks.hasOwnProperty(z)) {
				bz = this.blocks[z];
				for (y in bz) {
					if (bz.hasOwnProperty(y)) {
						bzy = bz[y];
						for (x in bzy) {
							if (bzy.hasOwnProperty(x)) {
								elements.push(bzy[x].element);
								delete bzy[x];
							}
						}
						delete bz[y];
					}
				}
				delete this.blocks[z];
			}
		}
		
		return elements;
	};
	
	/* World block getter */
	World.prototype.get = function(coords) {
		if (typeof this.blocks[coords.z] === 'undefined') {
			return undefined;
		}
		
		if (typeof this.blocks[coords.z][coords.y] === 'undefined') {
			return undefined;
		}
		
		return this.blocks[coords.z][coords.y][coords.x]
	};
	
	/* World block setter */
	World.prototype.set = function(coords, block) {
		if (typeof this.blocks[coords.z] === 'undefined') {
			this.blocks[coords.z] = {};
		}
		
		if (typeof this.blocks[coords.z][coords.y] === 'undefined') {
			this.blocks[coords.z][coords.y] = {};
		}
		
		this.blocks[coords.z][coords.y][coords.x] = block;
		block.nbhood.bindAll(this.findNeighbours(coords));
		
		this.edited = true;
	};
	
	/* World block unsetter */
	World.prototype.unset = function(coords) {
		var block;
		
		if (typeof this.blocks[coords.z] === 'undefined' ||
			typeof this.blocks[coords.z][coords.y] === 'undefined' ||
			typeof this.blocks[coords.z][coords.y][coords.x] === 'undefined') {
			throw "Cannot remove undefined block";
		}
		
		block = this.blocks[coords.z][coords.y][coords.x];
		delete this.blocks[coords.z][coords.y][coords.x];
		block.nbhood.unbindAll();
		
		this.edited = true;
	};
	
	/* Search for neighbour blocks and return them in a { key: block } object */
	World.prototype.findNeighbours = function(coords) {
		var x, y, z, bz, by, block, key,
			nbhood = {coords: coords};
		
		for (z = -1; z <= 1; z++) {
			bz = this.blocks[coords.z + z];
		 	if (typeof bz === 'undefined') {
		 		continue;
		 	}
		 	
			for (y = -1; y <= 1; y++) {
				by = bz[coords.y + y];
				if (typeof by === 'undefined') {
					continue;
				}
				
				for (x = -1; x <= 1; x++) {
					block = by[coords.x + x];
					if (typeof block !== 'undefined') {					
						key = Neighborhood.keyFromCoords({ x:x, y:y, z:z });
						if (key !== '') {
							nbhood[key] = block;
						}
					}
				}
			}
		}
		
		return nbhood;
	};

	World.prototype.tick = function () {
		this.ticked.dispatch(++this.tickCount);
	};

	return World;
});
