"use strict";

import React from "react";
import Message from "./Message";
import NewMessage from "./NewMessage";
import firebase from "firebase/firebase-browser";

import LinvoDB from "linvodb3";
import neDB from "nedb";
import dummydata from "./dummydata";
import async from "async";
import path from "path";

LinvoDB.defaults.store = { db: require("level-js") };
// LinvoDB.defaults.autoIndexing = false;
// LinvoDB.dbPath = path.resolve(__dirname);

const ROOM_STYLE = {
	padding: "10px 30px"
};

const BUTTON_STYLE = {
    marginLeft: 10
};

// ダミーデータ
let dummydataX = [];

// １件投入
// dummydataX = dummydataX.slice(0, 1);
// dummydataX[0]._id = "99999999";
// dummydataX[0].player_code = "99999999";
// dummydataX[0].player_name = "テスト太郎２";

// console.log(`dummydataX count: ${dummydataX.length}`);

export default class Room extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			description: "",
			messages: [],
            dbIdStart: "0",
            dbCount: "10",
            dbDatalimit: "1000"
		};
		// this.db = firebase.database();
        // this.handleMessagePost = this.handleMessagePost.bind(this);
        this.handleOnCreate = this.handleOnCreate.bind(this);
        this.handleOnPost = this.handleOnPost.bind(this);
        this.handleOnChangeStart = this.handleOnChangeStart.bind(this);
        this.handleOnChangeCount = this.handleOnChangeCount.bind(this);
        this.handleOnChangeDatalimit = this.handleOnChangeDatalimit.bind(this);
	}

	handleOnChangeDatalimit(e) {
	    this.setState({
            dbDatalimit: e.target.value
        })
    }

    handleOnChangeStart(e) {
        this.setState({
            dbIdStart: e.target.value
        });
    }

    handleOnChangeCount(e) {
        this.setState({
            dbCount: e.target.value
        });
    }

    /**
     * ダミーデータをしてされた件数にする
     * @param datacount
     */
    multiplyDummyData(datacount) {
        const dummydata1000 = dummydata.slice(0, 1000);
        const times = Math.ceil(datacount / 1000);

        dummydataX = [];

        let tmpdummy;
        for (let i = 0; i < times; i++) {
            tmpdummy = dummydata1000.map(val => Object.assign({}, val));
            dummydataX = dummydataX.concat(tmpdummy);
        }
        // ID加工
        dummydataX.map((val, idx) => {
            val.player_code = val.player_code + idx;
            val._id = val.player_code;
            return val;
        });
        dummydataX = dummydataX.slice(0, datacount);
    }

    handleOnPost() {
        const db = new LinvoDB(`dummy1000_0`, {
            "batting": { type: String, index: true },
            "pitching": { type: String, index: true },
            "player_code": { type: String, index: true },
            "simple_player_code": { type: String, index: true }
        }, {});

        // 1件保存
        console.time("save:one");
        let onedata = Object.assign({}, dummydataX[0]);
        delete onedata._id;
        const dummymodel = new db(onedata);
        dummymodel.save((err) => {
            console.timeEnd("save:one");
            if (err) {
                console.log(err);
                return;
            }
            console.log("done");
        });

    }

    handleOnCreate() {
	    let dbIdStart = Number(this.state.dbIdStart);
	    let dbCount = Number(this.state.dbCount);
	    this.multiplyDummyData(Number(this.state.dbDatalimit));
        const tasks = [];
        for (let i = dbIdStart; i < dbIdStart + dbCount; i++) {
            tasks.push((callback) => {
                this.createLinvo(i, (err) => {
                    callback(err);
                });
            })
        }

        console.time("save:all");
        async.series(tasks, (err, results) => {
            console.timeEnd("save:all");
            if (err) {
                console.error("ERROR");
                console.log(JSON.stringify(err));
                return;
            }
            console.log("done!!");
        });
        // this.initializeLinvoDb(() => {
        //    this.fetchRoom(roomId);
        // });
        // this.initializeNeDb(() => {
        // 	this.fetchRoom(roomId);
        // });
    }

	componentDidMount() {
		const { roomId } = this.props.params;
	}

    /**
     * DB量産用
     * @param db_num
     * @param cb
     */
    createLinvo(db_num, cb) {
        const db = new LinvoDB(`dummy${this.state.dbDatalimit}_${db_num}`, {
            "batting": { type: String, index: true },
            "pitching": { type: String, index: true },
            "player_code": { type: String, index: true },
            "simple_player_code": { type: String, index: true }
        }, {});

        console.log(`LinvoDB初期データ作成：dummy${this.state.dbDatalimit}_${db_num}`);
        let dummymodels = dummydataX.map((val) => new db(val));

        // save
        console.time("save");
        db.save(dummymodels, (err, docs) => {
            console.timeEnd("save");
            if (err) {
                console.log(`Save Error ${err.message}`)
                console.log(err);
                cb(err);
                return;
            }
            console.log(`saveEnd: ${docs.length}`);
            cb(null, docs);
        });
    }

    initializeLinvoDb(cb) {
        console.time("load");
        this.db = new LinvoDB(`dummy${DUMMY_LENGTH}`, {
            "batting": { type: String, index: true },
            "pitching": { type: String, index: true },
            "player_code": { type: String, index: true },
            "simple_player_code": { type: String, index: true }
        }, {
            // filename: "kkkkk"
            // store: { db: leveljs }
        });
        console.timeEnd("load");

        // console.time("count");
        // this.db.find({}).count((err, count) => {
        //     console.timeEnd("count");
        //     if (count > 0) {
        //         cb();
        //         return;
        //     }
            console.log(`LinvoDB初期データ作成：`);

            let tasks = [];
            let dummymodels = dummydataX.map((val) => new this.db(val));

            // 1件保存
            // console.time("save");
            // dummymodels[0].save((err) => {
            //     console.timeEnd("save");
            //     if (err) {
            //         console.log(err);
            //         return;
            //     }
            //     console.log("done");
            // });

            // async
            // for (let model of dummymodels) {
            //     tasks.push((callback) => {
            //         model.save((err) => {
            //             callback(err, model);
            //         });
            //     });
            // }
            // console.time("async");
            // async.series(tasks, (err, results) => {
            //     console.timeEnd("async");
            //     if (err) {
            //         console.log(`save error: ${err.message}`);
            //         console.log(err);
            //         return;
            //     }
            //     cb();
            // });

            // Promise
            // console.time("promise");
            // for (let model of dummymodels) {
            //     tasks.push(new Promise((resolve, reject) => {
            //         model.save((err) => {
            //             if (err) {
            //                 reject(err);
            //                 return;
            //             }
            //             resolve();
            //         });
            //     }));
            // }
            // Promise.all(tasks)
            //     .then(() => {
            //         console.timeEnd("promise");
            //         cb();
            //     })
            //     .catch((err) => {
            //         console.timeEnd("promise");
            //         console.log(`save error: ${err.message}`);
            //         console.log(err);
            //     });

            // save
            console.time("save");
            this.db.save(dummymodels, (err, docs) => {
                console.timeEnd("save");
                if (err) {
                    console.log(`Save Error ${err.message}`)
                    console.log(err);
                    return;
                }
                console.log(`saveEnd: ${docs.length}`);
                cb();
            });
        // });
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

    createFindTask(query, limit) {
        return (callback) => {
            const key = JSON.stringify(query) + limit;
            console.time(key);
            const db = this.db.find(query);
            if (limit) {
                db.limit(limit);
            }
            db.exec((err, docs) => {
                console.timeEnd(key);
                callback(err);
            });
        };
    }

	fetchRoom(roomId) {
		// FirebaseのDBからチャットルーム詳細データの参照を取得
		// this.fbChatRoomRef = this.db.ref("/chatrooms/" + roomId);

        let tasks = [
            this.createFindTask({}, 1),
            this.createFindTask({}, 100),
            this.createFindTask({}, 200),
            this.createFindTask({}, 300),
            this.createFindTask({}, 400),
            this.createFindTask({}, 500),
            this.createFindTask({}, 600),
            this.createFindTask({}, 700),
            this.createFindTask({}, 800),
            this.createFindTask({}, 900),
            this.createFindTask({}, 1000)
        ];

        async.series(tasks, (err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log("done!");
        });
    }

	render() {
		const { messages } = this.state;
		return (
			<div style={ROOM_STYLE} ref={room => this.room = room}>
				<div className="list-group">
					{messages.map(m => <Message key={m.key} message={m} />)}
				</div>
                <div>１DBのデータ件数</div>
                <input
                    type="text"
                    className="form-control"
                    value={this.state.dbDatalimit}
                    onChange={this.handleOnChangeDatalimit}
                />
                <div>DBの開始インデックス</div>
                <input
                    type="text"
                    className="form-control"
                    value={this.state.dbIdStart}
                    onChange={this.handleOnChangeStart}
                />
                <div>作成するDB数</div>
                <input
                    type="text"
                    className="form-control"
                    value={this.state.dbCount}
                    onChange={this.handleOnChangeCount}
                />
                <button className="btn btn-large btn-primary" style={BUTTON_STYLE} onClick={this.handleOnCreate}>create</button>
                <button className="btn btn-large btn-primary" style={BUTTON_STYLE} onClick={this.handleOnPost}>post 1</button>
			</div>
		);
	}
}