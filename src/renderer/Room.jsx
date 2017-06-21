"use strict";

import React from "react";
import Message from "./Message";
import NewMessage from "./NewMessage";
import firebase from "firebase/firebase-browser";

import LinvoDB from "linvodb3";
import neDB from "nedb";
import dummydata from "./dummydata";
import path from "path";

LinvoDB.defaults.store = { db: require("level-js") };
LinvoDB.defaults.autoIndexing = false;
// LinvoDB.dbPath = path.resolve(__dirname);

const ROOM_STYLE = {
	padding: "10px 30px"
};

// ダミーデータをxx倍に
let times = 1;
let dummydataX = [];
let tmpdummy;
for (let i = 0; i < times; i++) {
    tmpdummy = dummydata.map(val => Object.assign({}, val));
    dummydataX = dummydataX.concat(tmpdummy);
}
dummydataX.map((val, idx) => {
    val.player_code = val.player_code + idx;
    val._id = val.player_code;
    return val;
});
console.log(`dummydataX count: ${dummydataX.length}`);

export default class Room extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			description: "",
			messages: []
		};
		// this.db = firebase.database();
        this.handleMessagePost = this.handleMessagePost.bind(this);
	}

	componentDidMount() {
		const { roomId } = this.props.params;
        this.initializeLinvoDb(() => {
		    this.fetchRoom(roomId);
        });
		// this.initializeNeDb(() => {
		// 	this.fetchRoom(roomId);
		// });
	}

    initializeLinvoDb(cb) {
        console.time("load");
        this.db = new LinvoDB("hoge", {
            "__c": Number,
            "__u": Number,
            "affiliation_history": String,
            "batting": String,
            "birthday": String,
            "birthplace": String,
            "blood_type": String,
            "face_file": String,
            "height": Number,
            "is_latest": String,
            "join_scene": String,
            "join_year": String,
            "last_game_date": String,
            "note": String,
            "pitching": String,
            "player_code": { type: String, index: true },
            "player_name": String,
            "player_name_en": String,
            "player_no": { type: String, index: true },
            "player_short_name": String,
            "season": Number,
            "simple_player_code": { type: String, index: true },
            "throwing_style": String,
            "weight": Number
        }, {
            filename: "kkkkk"
            // store: { db: leveljs }
        });
        console.timeEnd("load");

        // const cb_org = cb;
        // cb = () => {
        //     console.time("indexing");
        //     this.db.ensureIndex({
        //         fieldName: "simple_player_code"
        //     }, () => {
        //         console.timeEnd("indexing");
        //         cb_org();
        //     });
        // };

        console.time("count");
        this.db.find({}).count((err, count) => {
            console.timeEnd("count");
            if (count > 0) {
                cb();
                return;
            }
            console.log("LinvoDB初期データ作成");

            console.time("promise");
            let tasks = [];
            let dummymodels = dummydataX.map((val) => new this.db(val));
            for (let model of dummymodels) {
                tasks.push(new Promise((resolve, reject) => {
                    model.save((err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve();
                    });
                }));
            }
            Promise.all(tasks)
                .then(() => {
                    console.timeEnd("promise");
                    cb();
                })
                .catch((err) => {
                    console.timeEnd("promise");
                    console.log(`save error: ${err.message}`);
                    console.log(err);
                });

            // this.db.save(dummymodels, (err, docs) => {
            //     if (err) {
            //         console.log(`Save Error ${err.message}`)
            //         console.log(err);
            //         return;
            //     }
            //     console.log(`saveEnd: ${docs.length}`);
            //     cb();
            // });
        });
    }

	initializeNeDb(cb) {
        console.time("load");
        this.db = new neDB({ filename: "palyer.db" });
        this.db.loadDatabase();
        console.timeEnd("load");

        console.time("count");
        this.db.count({}, (err, count) => {
            console.timeEnd("count");
        	if (count > 0) {
        		cb();
        		return;
			}
            console.time("save:all");
            this.db.insert(
                dummydataX, (err, docs) => {
                    console.timeEnd("save:all");
                    console.log(docs.length);
                    cb();
                }
            );
        });
    }

	componentWillReceiveProps(nextProps) {
		const { roomId } = nextProps.params;
		if (roomId === this.props.params.roomId) {
			return;
		}
		if (this.stream) {
			// メッセージ監視を解除
			this.stream.off();
		}
		this.setState({ messages: [] });
		this.fetchRoom(roomId);
	}

	componentDidUpdate() {
		setTimeout(() => {
			// 画面下端へスクロール
			this.room.parentNode.scrollTop = this.room.parentNode.scrollHeight;
		}, 0);
	}

	componentWillUnmount() {
		if( this.stream ) {
			// メッセージ監視を解除
			this.stream.off();
		}
	}

	handleMessagePost(message) {
		const newItemRef = this.fbChatRoomRef.child("messages").push();
		this.user = this.user || firebase.auth().currentUser;
		return newItemRef.update({
			writtenBy: {
				uid: this.user.uid,
				displayName: this.user.displayName,
				photoURL: this.user.photoURL
			},
			time: Date.now(),
			text: message
		});
	}

	fetchRoom(roomId) {
		// FirebaseのDBからチャットルーム詳細データの参照を取得
		// this.fbChatRoomRef = this.db.ref("/chatrooms/" + roomId);

        console.time("find:all");
        this.db.find({}, (err, docs) => {
            console.timeEnd("find:all");
            console.log(`docs.length: ${docs.length}`)
            console.time("find:spc:1");
            this.db.find({"simple_player_code": "1"}, (err, docs) => {
                console.timeEnd("find:spc:1");
                console.log(`docs.length: ${docs.length}`)
                console.time("find:player_code:200304310610");
                this.db.find({"player_code": "200304310610"}, (err, docs) => {
                    console.timeEnd("find:player_code:200304310610");
                    console.log(`docs.length: ${docs.length}`);
                });
            });
        });

		// this.fbChatRoomRef.once("value").then(snapshot => {
		// 	const { description } = snapshot.val();
		// 	this.setState({ description });
		// 	window.document.title = description;
		// });
		// this.stream = this.fbChatRoomRef.child("messages").limitToLast(10);
		// this.stream.on("child_added", item => {
		// 	const { messages } = this.state || [];
		// 	// 追加されたメッセージをstateにセット
		// 	messages.push(Object.assign({ key: item.key }, item.val()));
		// 	this.setState({ messages });
		// });
	}

	render() {
		const { messages } = this.state;
		return (
			<div style={ROOM_STYLE} ref={room => this.room = room}>
				<div className="list-group">
					{messages.map(m => <Message key={m.key} message={m} />)}
				</div>
				<NewMessage onMessagePost={this.handleMessagePost} />
			</div>
		);
	}
}