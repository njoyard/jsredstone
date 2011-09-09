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

define({
	root: {
		tools: {
			clear: "New world",
			load: "Load World",
			save: "Save World",
			erase: "Erase tool (E)",
			solid: "Solid block (S)",
			wire: "Redstone wire (W)",
			torch: "Redstone torch (T)",
			repeater: "Redstone repeater (R)",
			button: "Button (B)"
		},
		loadsave: {
			load: {
				title: "Load world",
				subtitle1: "From browser Local Storage:",
				lsbtn: "Load",
				subtitle2: "or paste saved world code below:",
				textbtn: "Load",
				selectworld: "Please select a world to load"
			},
			save: {
				title: "Save world",
				lsbtn: "Save",
				subtitle1: "To browser Local Storage:",
				subtitle2: "or copy world code below:",
				overwrite: "Overwrite saved world '%s' ?",
				selectworld: "Please select a world name to save to"
			},
			close: "Close",
			choose: "- Choose saved world -",
			newsave: "- New saved world -"
		}
	}/*,
	'fr': true*/
});
