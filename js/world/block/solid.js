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
	var SolidBlock;

	SolidBlock = function (world, coords) {
		SolidBlock.baseCtor.call(this, world, coords);
		this.cssclass = 'solid';
		
		this.charge = {
			strong: 0,
			strongsrc: [],
			wires: []
		};
		
		this.nbhood.removed.add(this.onNeighbourRemoved, this);
	};
	SolidBlock.inherit(Block);

	SolidBlock.prototype.type = 'solid';

	SolidBlock.tryPlace = function(nbhood, mouse) {
		/* Solid block can be placed anywhere */
		return { css: 'solid', args: {} };
	};

	SolidBlock.prototype.getChargeFrom = function (key) {
		var me = this.charge,
			weak = 0;
		
		if (me.strong > 0) {
			return me.strong;
		} else {
			// Look for charge from connected wires
			me.wires.forEach((function(key) {
				var charge = this.nbhood[key].getChargeFrom(this.nbhood.reverse(key));
				if (charge > weak) {
					weak = charge;
				}
			}).bind(this));
			
			return weak;
		}
		
		return (me.strong > 0 ? me.strong : me.weak);
	};

	SolidBlock.prototype.setChargeFrom = function (type, source, charge) {
		var me = this.charge,
			idx, prevstrong;
			
		if (typeof this.removing !== 'undefined') {
			// Ignore charges received when removing
			return;
		}
		
		if (type !== 'wire') {
			idx = me.strongsrc.indexOf(source);
			prevstrong = me.strong;
			
			if (charge < me.strong && idx !== -1) {
				// Strong source removed
				me.strongsrc.splice(idx, 1);
				if (me.strongsrc.length === 0) {
					me.strong = 0;
				}
			} else if (charge > 0 && idx === -1) {
				// New strong source
				me.strongsrc.push(source);
				me.strong = cst.maxCharge;
			}
			
			if (prevstrong != me.strong) {
				// Send new strong charge to connected wires
				me.wires.forEach((function(key) {
					this.nbhood[key].setChargeFrom('solid', this.nbhood.reverse(key), me.strong);
				}).bind(this));
			}
		} else {
			// Just remember connected wires
			idx = me.wires.indexOf(source);
			if (idx === -1) {
				// New connection: send strong charge
				me.wires.push(source);
				this.nbhood[source].setChargeFrom('solid', this.nbhood.reverse(source), me.strong);
			}
		}
	};
	
	SolidBlock.prototype.onNeighbourRemoved = function(key) {
		var me = this.charge;
		
		if (me.strongsrc.indexOf(key) !== -1) {
			this.setChargeFrom('remove', key, 0);
		} else if (me.wires.indexOf(key) !== -1) {
			me.wires.splice(me.wires.indexOf(key), 1);
		}
	};
	
	SolidBlock.prototype.serialize = function() {
		return {};
	};

	return SolidBlock;
});
