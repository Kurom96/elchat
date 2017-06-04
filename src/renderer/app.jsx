"use strict";

import React from "react";
import {render} from "react-dom";
import {Router, Route, hashHistory} from "react-router";
import Login from "./Login";
import Signup from "./Signup";
import Rooms from "./Rooms";
import Room from "./Room";
import firebase from "firebase/firebase-browser";
import firebaseConfig from "../firebase/config";

const appRouting = (
	<Router history={hashHistory}>
		<Route paht="/">
			<Route path="login" component={Login}></Route>
			<Route path="signup" component={Signup}></Route>
			<Route path="rooms" component={Rooms}>
				<Route path=":roomId" component={Room}></Route>
			</Route>
		</Route>
	</Router>
);

if (!location.hash.length) {
	location.hash = "#/login";
}

firebase.initializeApp(firebaseConfig);

render(appRouting, document.getElementById("app"));
