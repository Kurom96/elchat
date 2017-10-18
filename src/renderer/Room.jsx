"use strict";

import React from "react";
import Message from "./Message";

import LinvoDB from "linvodb3";
import async from "async";

import dummydata from "./dummydata";
import dummyevent from "./dummyevent";

LinvoDB.defaults.store = {db: require("level-js")};

const ROOM_STYLE = {
    padding: "10px 30px"
};

const BUTTON_STYLE = {
    marginLeft: 10
};

// ダミーデータ
let dummydataX = [];

// const dbindex = {
//     "batting": { type: String, index: true },
//     "pitching": { type: String, index: true },
//     "player_code": { type: String, index: true },
//     "simple_player_code": { type: String, index: true }
// };

const dbindex = {
    index: {type: Number, index: true}
};

export default class Room extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            description: "",
            messages: [],
            dbIdStart: "0",
            dbCount: "10",
            dbDatalimit: "1000",
            dbQuery: `{"index": 33}`,
            dbLimit: "10",
            dbName: "dummy300"
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
        dummydataX = [];
        for (let i = 0; i < datacount; i++) {
            dummydataX.push(Object.assign({}, dummyevent, {_id: `${dummyevent._id}_${i}`, index: i}));
        }

        //
        // const recordCount = 911;
        // const dummydata1000 = dummydata.slice(0, recordCount);
        // const times = Math.ceil(datacount / recordCount);
        //
        // dummydataX = [];
        //
        // let tmpdummy;
        // for (let i = 0; i < times; i++) {
        //     tmpdummy = dummydata1000.map(val => Object.assign({}, val));
        //     dummydataX = dummydataX.concat(tmpdummy);
        // }
        // // ID加工
        // dummydataX.map((val, idx) => {
        //     val.player_code = val.player_code + idx;
        //     val._id = val.player_code;
        //     return val;
        // });
        // dummydataX = dummydataX.slice(0, datacount);
    }

    handleOnPost() {
        const dbName = `dummy1000_0`;
        if (!this.dbs[dbName]) {
            this.dbs[dbName] = new LinvoDB(`dummy1000_0`, dbindex, {});
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
        // const dbName = this.state.dbName || "dummy1000_0";
        // if (!this.dbs[dbName]) {
        //     this.dbs[dbName] = new LinvoDB(dbName, dbindex, {});
        // }
        // const db = this.dbs[dbName];
        //
        // let query;
        // try {
        //     query = JSON.parse(this.state.dbQuery);
        // } catch(e) {
        //     console.error(e);
        //     return;
        // }
        // const cursor = db.find(query);
        // const limit = Number(this.state.dbLimit || "1000");
        // cursor.limit(limit);
        // console.time("find");
        // cursor.exec((err, docs) => {
        //     if (err) {
        //         console.error(err);
        //         return;
        //     }
        //     console.log(`${dbName} docs.length: ${docs.length}`);
        //     console.timeEnd("find");
        // });

        const tasks = [];
        for (let i = 0; i < this.state.dbCount; i++) {
            tasks.push(this.createFindPromise(i));
        }

        console.log("FINDALLDB start");
        console.time("FINDALLDB");
        const result = tasks.reduce((pre, cur) => pre.then(cur.bind(this)), Promise.resolve());

        result.then(() => {
            console.timeEnd("FINDALLDB");
        }).catch((err) => {
            console.timeEnd("FINDALLDB");
            console.log(err);
        });
    }

    createFindPromise(index) {
        return () => {
            return new Promise((resolve, reject) => {
                const dbName = `${(this.state.dbName || "dummy")}_${index}`;
                if (!this.dbs[dbName]) {
                    this.dbs[dbName] = new LinvoDB(dbName, dbindex, {});
                }
                const db = this.dbs[dbName];

                let query;
                try {
                    // query = JSON.parse(this.state.dbQuery);
                    // query = { "index": index };
                    // query = {$or: [{"index": 1}, {"index": 300}, {"index": 600}, {"index": 900}, {"index": 1200}, {"index": 1500}]};
                    query = [];
                    for (let i = 0; i < 30000; i += 300) {
                        query.push({"index": i});
                    }
                    query = {$or: query};
                } catch (e) {
                    console.error(e);
                    return;
                }
                const cursor = db.find(query);
                const limit = Number(this.state.dbLimit || "1000");
                cursor.limit(limit);
                console.time(`find_${index}`);
                cursor.exec((err, docs) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                        return;
                    }
                    console.log(`${dbName} docs.length: ${docs.length}`);
                    console.timeEnd(`find_${index}`);
                    resolve(docs);
                });
            });
        };
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
            this.dbs[dbName] = new LinvoDB(dbName, dbindex, {});
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
        const {messages} = this.state;
        return (
            <div style={ROOM_STYLE} ref={room => this.room = room}>
                <div className="list-group">
                    {messages.map(m => <Message key={m.key} message={m}/>)}
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
                <button className="btn btn-large btn-primary" style={BUTTON_STYLE} onClick={this.handleOnCreate}>
                    create
                </button>
                <button className="btn btn-large btn-primary" style={BUTTON_STYLE} onClick={this.handleOnPost}>post 1
                </button>
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
                <button className="btn btn-large btn-primary" style={BUTTON_STYLE} onClick={this.handleOnFind}>Find
                </button>
            </div>
        );
    }
}