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

var JSR;
if (typeof JSR === 'undefined') {
	JSR = (function() {
		var protoDef,
			interfaces,
			slice = Array.prototype.slice;


		/* Prototype enhancement helper */
		protoDef = function (ctor, properties) {
			var prop;

			for (prop in properties) {
				if (properties.hasOwnProperty(prop) &&
					typeof ctor.prototype[prop] === 'undefined') {
					ctor.prototype[prop] = properties[prop];
				}
			}
		};


		/*
		 * Functional utilities
		 */

		protoDef(Function, {
			bind: function (thisVal) {
				var fn = this,
					args = slice.call(arguments, 1);
				return function() {
					return fn.apply(thisVal, args.concat(slice.call(arguments)));
				};
			},

			inherit: (function () {
				var F = function () {};
				return function(P) {
					F.prototype = P.prototype;
					this.prototype = new F();
					this.baseCtor = P;
					this.base = P.prototype;
					this.prototype.constructor = this;
				};
			})(),

			method: function (name, func) {
				this.prototype[name] = func;
				return this;
			}
		});

		return {
			protoDef: protoDef
		};
	})();
}

define(['gui/gui', 'world/world'],
function (Gui, World) {
	require.ready(function () {
		var world = new World(),
			gui = new Gui(world);

		gui.render();
	});
});

