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
	var Block;

	Block = function (world, coords) {
		this.coords = coords;
		this.world = world;
		
		/* Neighbours helper */
		this.nbhood = new Neighborhood(this);
		
		/* Dispatched when the block requests its own removal */
		this.requestedRemoval = new signals.Signal();
		
		/* Dispatched when the block is removed from the world */
		this.removed = new signals.Signal();
		
		/* Dispatched when the HTML element representing this block is ready */
		this.createdElement = new signals.Signal();
		
		/* Dispatched when the element is clicked */
		this.clicked = new signals.Signal();
		
		// On element created: set CSS class
		this.createdElement.addOnce(this.setClass, this);
		
		// On element created: set onclick listener
		this.createdElement.addOnce(function() {
			var block = this;
			this.element.addEventListener('click', function() {	block.clicked.dispatch(); });
		}, this);
		
		// On removal: remove element (low priority - execute last)
		this.removed.addOnce(function() {
			if (this.element && this.element.parentNode) {
				this.element.parentNode.removeChild(this.element);
			}
		}, this, -100);
	};

	Block.prototype.type = 'block';

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

	/* Set block CSS class. If called before element is created, class is stored
	   until setClass is called again with cls = undefined */
	Block.prototype.setClass = function(cls) {
		var cl;
		
		if (typeof this.element === 'undefined') {
			this.cssclass = cls;
		} else {
			cl = this.element.classList;
			if (typeof cls === 'undefined') {
				if (typeof this.cssclass !== 'undefined') {
					cl.add('B_' + this.cssclass);
				}
			} else {
				if (typeof this.cssclass !== 'undefined') {
					cl.remove('B_' + this.cssclass);
				}
				cl.add('B_' + cls);
				this.cssclass = cls;
			}
		}
	};
	
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
