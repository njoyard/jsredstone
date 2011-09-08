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

define(['block/block', 'const'],
function (Block, cst) {
	var RepeaterBlock,
		nb = Block.NB;

	RepeaterBlock = function (world, coords, args) {
		var rt = cst.repeaterTicks;
		RepeaterBlock.baseCtor.call(this, world, coords);

		this.chargeBuf = [];
		this.chargePtr = 0;
		
		this.setDelay(args.delay);
		this.setDirection(args.dir);
		
		this.ontick = (function(tickcount) {
			var b, c;
			
			c = this.chargeBuf[(this.chargePtr - rt[this.delay - 1] + 8) % 8];
			this.setCharge(c > 0 ? cst.maxCharge : 0);
			
			// Save input charge in buffer and move pointer forward
			b = this.get(nb.revkey(this.dir));
			if (typeof b !== 'undefined') {
				c = b.getChargeFrom(this.dir);
			} else {
				c = 0;
			}
			
			this.chargeBuf[this.chargePtr] = c;
			this.chargePtr = (this.chargePtr + 1) % 8;
		}).bind(this);
		
		world.subscribe('tick', this.ontick);
	};
	RepeaterBlock.inherit(Block);

	RepeaterBlock.type = 'repeater';

	RepeaterBlock.tryPlace = function(world, coords, mouse) {
		var dir, block, retval;

		/* Block underneath must be solid */
		if (coords.z !== 0) {
			block = world.get(nb.add(coords, nb.d));
			if (block.type !== 'solid') {
				return;
			}
		}

		if (mouse.indexOf('n') !== -1) {
			dir = 'n';
		} else if (mouse.indexOf('s') !== -1) {
			dir = 's';
		} else if (mouse.indexOf('e') !== -1) {
			dir = 'e';
		} else if (mouse.indexOf('w') !== -1) {
			dir = 'w';
		}

		if (typeof dir !== 'undefined') {
			return { css: 'rep1off_'+ dir, args: { dir: dir, delay: 1 } };
		}
	};

	RepeaterBlock.prototype.updateClass = function() {
		this.setClass('rep' + this.delay + (this.charge > 0 ? 'on' : 'off') + '_' + this.dir);
	};

	RepeaterBlock.prototype.setCharge = function(charge) {
		var b = this.get(this.dir);
		
		this.charge = charge;
		this.updateClass();
		
		// Send charge to block in front of repeater
		if (typeof b !== 'undefined') {
			b.setChargeFrom('repeater', nb.revkey(this.dir), this.charge);
		}
	};

	RepeaterBlock.prototype.setDelay = function (delay) {
		this.delay = delay;
		this.updateClass();
	};

	RepeaterBlock.prototype.setDirection = function(dir) {
		this.dir = dir;
		this.setCharge(0);
	};
	
	RepeaterBlock.prototype.getChargeFrom = function(dir) {
		// Answer 0 unless block requesting charge is in front of repeater
		return dir === this.dir ? this.charge : 0;
	};
	
	RepeaterBlock.prototype.onWorldChanged = function(coords) {
		var block;
		
		/* Request removal if block below was removed */
		if (nb.equals(coords, nb.add(this.coords, nb.d))) {
			block = this.world.get(coords);
			if (typeof block !== 'undefined' && block.type !== 'solid') {
				return true;
			}
		}
		
		return false;
	};
	
	RepeaterBlock.prototype.onRemove = function() {
		this.setCharge(0);
		this.world.unsubscribe('tick', this.ontick);
	};
	
	RepeaterBlock.prototype.onClick = function() {
		this.setDelay(this.delay == 4 ? 1 : this.delay + 1);
	};
	
	RepeaterBlock.prototype.serialize = function() {
		return {
			args: {delay: this.delay, dir: this.dir},
			dep: nb.d
		};
	};

	return RepeaterBlock;
});
