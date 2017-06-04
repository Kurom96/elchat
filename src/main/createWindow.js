"use strict";

import {BrowserWindow} from "electron";

let win;

export default function createWindow() {
	win = new BrowserWindow();
	win.loadURL(`file://${__dirname}/../../index.html`);
	win.on("close", () => {
		win = null;
	});
}