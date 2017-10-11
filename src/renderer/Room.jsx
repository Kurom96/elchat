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
            dbDatalimit: "1000",
            dbQuery: `{"batting": "L"}`,
            dbLimit: "1000",
            dbName: "dummy1000_0"
		};
        // ボタン
        this.handleOnCreate = this.handleOnCreate.bind(this);
        this.handleOnPost = this.handleOnPost.bind(this);
        this.handleOnFind = this.handleOnFind.bind(this);

        // Change
        this.handleOnChangeStart = this.handleOnChangeStart.bind(this);
        this.handleOnChangeCount = this.handleOnChangeCount.bind(this);
        this.handleOnChangeDatalimit = this.handleOnChangeDatalimit.bind(this);
        this.handleOnChangeQuery = this.handleOnChangeQuery.bind(this);
        this.handleOnChangeLimit = this.handleOnChangeLimit.bind(this);
        this.handleOnChangeName = this.handleOnChangeName.bind(this);

        this.dbs = {};
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

    handleOnChangeQuery(e) {
	    this.setState({
            dbQuery: e.target.value
        });
    }

    handleOnChangeLimit(e) {
	    this.setState({
            dbLimit: e.target.value
        });
    }

    handleOnChangeName(e) {
	    this.setState({
            dbName: e.target.value
        });
    }

    /**
     * ダミーデータを指定された件数にする
     * @param datacount
     */
    multiplyDummyData(datacount) {
        const recordCount = 911;
        const dummydata1000 = dummydata.slice(0, recordCount);
        const times = Math.ceil(datacount / recordCount);

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
        const dbName = `dummy1000_0`;
        if (!this.dbs[dbName]) {
            this.dbs[dbName] = new LinvoDB(`dummy1000_0`, {
                "batting": { type: String, index: true },
                "pitching": { type: String, index: true },
                "player_code": { type: String, index: true },
                "simple_player_code": { type: String, index: true }
            }, {});
        }
        const db = this.dbs[dbName];

        // 1件保存
        console.time("save:one");
        let onedata = Object.assign({}, dummydata[0]);
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
    }

    handleOnFind() {
        const dbName = this.state.dbName || "dummy1000_0";
        if (!this.dbs[dbName]) {
            const index = {
                "batting": { type: String, index: true },
                "pitching": { type: String, index: true },
                "player_code": { type: String, index: true },
                "simple_player_code": { type: String, index: true }
            };
            this.dbs[dbName] = new LinvoDB(dbName, index, {});
        }
        const db = this.dbs[dbName];

        let query;
        try {
            query = JSON.parse(this.state.dbQuery);
        } catch(e) {
            console.error(e);
            return;
        }
        const cursor = db.find(query);
        const limit = Number(this.state.dbLimit || "1000");
        cursor.limit(limit);
        console.time("find");
        cursor.exec((err, docs) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`${dbName} docs.length: ${docs.length}`);
            console.timeEnd("find");
        });
    }

	componentDidMount() {
	}

    /**
     * DB量産用
     * @param db_num
     * @param cb
     */
    createLinvo(db_num, cb) {
        const dbName = `dummy${this.state.dbDatalimit}_${db_num}`;
        if (!this.dbs[dbName]) {
            this.dbs[dbName] = new LinvoDB(dbName, {
                "batting": { type: String, index: true },
                "pitching": { type: String, index: true },
                "player_code": { type: String, index: true },
                "simple_player_code": { type: String, index: true }
            }, {});
        }

        const db = this.dbs[dbName];

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
                <div>&nbsp;</div>
                <div>DB name</div>
                <input
                    type="text"
                    className="form-control"
                    value={this.state.dbName}
                    onChange={this.handleOnChangeName}
                />
                <div>Query</div>
                <input
                    type="text"
                    className="form-control"
                    value={this.state.dbQuery}
                    onChange={this.handleOnChangeQuery}
                />
                <div>Limit</div>
                <input
                    type="text"
                    className="form-control"
                    value={this.state.dbLimit}
                    onChange={this.handleOnChangeLimit}
                />
                <button className="btn btn-large btn-primary" style={BUTTON_STYLE} onClick={this.handleOnFind}>Find</button>
			</div>
		);
	}
}