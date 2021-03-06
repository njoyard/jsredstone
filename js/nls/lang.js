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
			clear: "New world (Alt-N)",
			load: "Load World (Alt-O)",
			save: "Save World (Alt-S)",
			pan: "Pan tool (P or middle mouse button)",
			erase: "Erase tool (E)",
			solid: "Solid block (S)",
			wire: "Redstone wire (W)",
			torch: "Redstone torch (T)",
			repeater: "Redstone repeater (R)",
			button: "Button (B)",
			lever: "Lever (L)"
		},
		
		loadsave: {
			load: {
				title: "Load world",
				subtitle1: "From browser Local Storage:",
				lsbtn: "Load",
				subtitle2: "or paste saved world code below:",
				textbtn: "Load",
				selectworld: "Please select a world to load",
				rembtn: "Delete",
				deleteworld: "Delete saved world '%s' ?",
				selectdworld: "Please select a world to delete"
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
			newsave: "- New saved world -",
			losechanges: "Current world has been modified, are you sure you want to lose changes ?"
		}
	}/*,
	'fr': true*/
});
