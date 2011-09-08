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

define(
['lib/i18n!nls/lang',
'util/storage',
'lib/sprintf'],
function(lang, storage, sprintf) {
	var elements, init, show, hide, lshandler, texthandler,
		state = {}, loadsave = {};
	
	init = function() {
		var e, boxcreate;
		elements = {};
		
		/* Background */
		e = document.createElement('div');
		e.classList.add('loadsave_bg');
		e.style.display = 'none';
		document.body.appendChild(e);
		elements.bg = e;
		
		/* Box */
		e = document.createElement('div');
		e.classList.add('loadsave_box');
		e.style.display = 'none';
		elements.box = e;
		
		boxcreate = function(tag, container) {
			container = container || 'box';
			return elements[container].appendChild(document.createElement(tag));
		};
		
		/* Box title */
		elements.title = boxcreate('h1');
		
		/* LocalStorage part */
		elements.subtitle1 = boxcreate('h2');
		
		elements.select = boxcreate('select');
		
		e = boxcreate('input');
		e.type ='text';
		elements.input = e;
		
		e = boxcreate('input');
		e.type = 'button';
		e.addEventListener('click', lshandler);
		elements.lsbtn = e;
		
		/* Text part */
		elements.subtitle2 = boxcreate('h2');
		elements.textarea = boxcreate('textarea');
		
		/* Buttons */
		elements.buttons = boxcreate('div');
		
		e = boxcreate('input', 'buttons');
		e.type = 'button';
		e.addEventListener('click', texthandler);
		elements.textbtn = e;
		
		e = boxcreate('input', 'buttons');
		e.type = 'button';
		e.classList.add('close');
		e.addEventListener('click', hide);
		elements.closebtn = e;
		
		document.body.appendChild(elements.box);
	};
	
	hide = function() {
		elements.box.style.display = 'none';
		elements.bg.style.display = 'none';
	};
	
	show = function (save, curworld) {
		var i, e, wl,
			key = save ? "save" : "load";
		
		elements.title.innerText = lang.loadsave[key].title;
		elements.subtitle1.innerText = lang.loadsave[key].subtitle1;
		elements.lsbtn.value = lang.loadsave[key].lsbtn;
		elements.subtitle2.innerText = lang.loadsave[key].subtitle2;
		elements.textbtn.value = lang.loadsave[key].textbtn;
		elements.closebtn.value = lang.loadsave.close;
		
		// Display world name input only on save
		elements.input.style.display = save ? '' : 'none';
		
		// Enable textarea only on load
		elements.textarea.readOnly = save ? true : false;
		elements.textbtn.style.display = save ? 'none' : '';
		
		// Fill select box with world list
		while(elements.select.firstChild) {
			elements.select.removeChild(elements.select.firstChild);
		}
		
		e = document.createElement('option');
		e.value = '-';
		e.innerText = lang.loadsave.choose;
		elements.select.appendChild(e);
		
		if (save) {
			e = document.createElement('option');
			e.value = '-';
			e.innerText = lang.loadsave.newsave;
			elements.select.appendChild(e);
		}
		
		wl = storage.getSavedWorlds();
		for (i = 0; i < wl.length; i++) {
			e = document.createElement('option');
			e.innerText = wl[i];
			e.value = wl[i];
			elements.select.appendChild(e);
			if (wl[i] === curworld) {
				elements.select.value = wl[i];
			}
		}
		
		elements.bg.style.display = 'block';
		elements.box.style.display = 'block';
	};
	
	lshandler = function() {
		var wn = elements.select.value,
			inp = elements.input.value,
			wl = storage.getSavedWorlds();
			
		if (state.mode === 'save') {
			if (wn === '-') {
				wn = inp;
			}
			
			if (wn === '') {
				window.alert(lang.loadsave.save.selectworld);
				return;
			}
			
			if (wl.indexOf(wn) !== -1) {
				if (!window.confirm(sprintf(lang.loadsave.save.overwrite, wn))) {
					return;
				}
			}
			
			storage.saveWorld(state.gui, wn);
		} else {
			if (wn === '-') {
				window.alert(lang.loadsave.load.selectworld);
				return;
			}
			
			storage.loadWorld(state.gui, wn);
		}
		
		hide();
	};
	
	texthandler = function() {
		var worldcode = elements.textarea.innerText;
		
		storage.restoreWorld(state.gui, worldcode);
		hide();
	};
	
	loadsave.showsave = function(gui) {
		if (typeof elements === 'undefined') {
			init();
		}
		show(true);
		
		state.worldcode = storage.getWorldString(gui);
		elements.textarea.innerText = state.worldcode;
		state.mode = 'save';
		state.gui = gui;
	};
	
	loadsave.showload = function(gui) {
		if (typeof elements === 'undefined') {
			init();
		}
		show(false);
		
		// Empty textarea
		elements.textarea.innerText = '';
		state.mode = 'load';
		state.gui = gui;
	};
	
	return loadsave;
});

