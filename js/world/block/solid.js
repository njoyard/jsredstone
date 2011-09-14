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

define(['world/block/block'],
function(Block) {
	var SolidBlock,
		nb = Block.NB;

	SolidBlock = function (world, coords) {
		SolidBlock.baseCtor.call(this, world, coords);
		this.cssclass = 'solid';
		this.charge = {
			current: 0,
			cursource: undefined,
			charges: {}
		};
	};
	SolidBlock.inherit(Block);

	SolidBlock.prototype.type = 'solid';

	SolidBlock.tryPlace = function(world, coords, mouse) {
		/* Solid block can be placed anywhere */
		return { css: 'solid', args: {} };
	};

	SolidBlock.prototype.getChargeFrom = function (relkey) {
		return this.charge.current;
	};

	SolidBlock.prototype.setChargeFrom = function (type, source, charge) {
		var // tstr = Block.NB.str(this.coords),
			charges = this.charge.charges,
			s, i, b,
			dirs = ['n', 's', 'e', 'w', 'u'];
			
		// Update input charges
		if (charge > 0) {
			charges[source] = charge;
		} else {
			delete charges[source];
		}
		
		// Update resulting charges
		if (charge > this.charge.current) {
			this.charge.current = charge;
			this.charge.cursource = source;
		} else if (charge < this.charge.current && source === this.charge.cursource) {
			this.charge.current = 0;
			this.charge.cursource = undefined;
			for (s in charges) {
				if (charges.hasOwnProperty(s) && charges[s] > this.charge.current) {
					this.charge.current = charges[s]
					this.charge.cursource = s;
				}
			}
			// console.log(tstr + " new charge " + this.charge.current + " from " + this.charge.cursource);
		}
		
		// Propagate to wires around and above if source type is not wire
		if (type !== 'wire') {
			for (i = 0; i < 5; i++) {
				b = this.get(dirs[i]);
				if (typeof b !== 'undefined' && b.type === 'wire') {
					b.setChargeFrom('solid', nb.revkey(dirs[i]), this.charge.current);
				}
			}
		}
	};
	
	SolidBlock.prototype.serialize = function() {
		return {};
	};

	return SolidBlock;
});
