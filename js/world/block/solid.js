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
			weak: 0,
			strongsrc: [],
			weaksrc: undefined,
			isstrong: false
		};
	};
	SolidBlock.inherit(Block);

	SolidBlock.prototype.type = 'solid';

	SolidBlock.tryPlace = function(nbhood, mouse) {
		/* Solid block can be placed anywhere */
		return { css: 'solid', args: {} };
	};

	SolidBlock.prototype.getChargeFrom = function (key) {
		var me = this.charge;
		return me.strong > 0 ? me.strong : me.weak;
	};

	SolidBlock.prototype.setChargeFrom = function (type, source, charge) {
		var me = this.charge,
			dirs = ['u', 'n', 's', 'e', 'w'],
			strong = (type !== 'wire'),
			idx;
			
		if (typeof this.removing !== 'undefined') {
			// Ignore charges received when removing
			return;
		}
		
		if (strong) {
			idx = me.strongsrc.indexOf(source);
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
		} else {
			if (me.strong > 0) {
				// Strong source is always stronger
				this.nbhood[source].setChargeFrom('solid', this.nbhood.reverse(source), me.strong);
			}
			
			// Update weak charge
			if (charge > me.weak) {
				me.weak = charge;
				me.weaksrc = source;
			} else if (source === me.weaksrc) {
				me.weak = 0;
				me.weaksrc = undefined;
			}
		}
		
		// Propagate strong charge to wires around and above
		dirs.forEach((function(dir) {
			var b = this.nbhood[dir];
			
			if (typeof b !== 'undefined' && b.type === 'wire') {
				b.setChargeFrom('solid', this.nbhood.reverse(dir), me.strong);
			}
		}).bind(this));
	};
	
	SolidBlock.prototype.serialize = function() {
		return {};
	};

	return SolidBlock;
});
