//log('thread_util')
let max = 10;
let isPrintError = true;
let thread_arr = [];

//辅助线程
let rt = create_thread();

function setPrintError(t) {
    isPrintError = t;
}

function setThredMax(i) {
    i = Math.round(i);
    if (i > 0 && i <= 100) {
        max = i;
    } else {
        throw new Error('参数错误!有效值:1-100')
    }
}

function run(callback, no_switch, no_wait) {
    let self_th = threads.currentThread();
    return rt.run(() => {
        let th;
        ok:
            while (true) {
                for (let i = 0; i < max; i++) {
                    let t = thread_arr[i];
                    if (!t) {
                        thread_arr[i] = th = create_thread();
                        break ok;
                    } else if (thread_arr[i].state !== '运行中') {

                        th = thread_arr[i];
                        break ok;
                    }
                }
            }
        return th.run(callback, no_switch, false, self_th);
    }, true)
}

function create_thread() {
    let thread = createAjThread();

    return {
        run,
        get state() {
            return thread.thread_state;
        },
        kill() {
            thread.thread_state = '已停止';
            thread.th.interrupt();
        }
    }

    function run(callback, no_switch, no_wait, to_self_th) {
        if (thread.thread_state == '已停止') {
            thread = createAjThread();
        }

        if (no_wait && thread.thread_state == '运行中') {
            return Promise.reject(new Error('线程忙碌')).catch((err) => {
                if (isPrintError) {
                    console.error(err);
                    //console.trace(err)
                }
                throw err;
            })
        }
        thread.thread_state = '运行中';
        let self_th = to_self_th || threads.currentThread();

        thread.lock.lock();
        let promise;
        if (thread.init === false) {
            promise = thread.initAdd(tun);
        } else {
            promise = tun();
        }

        thread.lock.unlock();
        return promise;

        function tun() {

            return new Promise((re, rj) => {
                thread.th.setImmediate(() => {
                    try {
                        let res = callback();
                        if (no_switch) {
                            return re(res);
                        } else if (!self_th.setImmediate) {
                            console.warn('调用线程不支持切回原线程!');
                            return re(res);
                        } else {
                            return self_th.setImmediate(() => re(res)); //切换原来的线程执行后面代码
                        }
                    } catch (err) {
                        if (no_switch) {
                            return rj(err);
                        } else if (!self_th.setImmediate) {
                            console.warn('调用线程不支持切回原线程!');
                            return rj(err);
                        } else {
                            return self_th.setImmediate(() => rj(err)); //切换原来的线程执行后面代码
                        }
                    } finally {
                        thread.thread_state = '空闲';
                    }
                });
            }).catch((err) => {
                if (isPrintError) {
                    console.error(err);
                }
                throw err;
            })
        }

    }

    function createAjThread() {
        let thread = {};
        //线程锁
        thread.lock = threads.lock();
        thread.thread_state = '空闲';
        thread.init_arr = [];
        thread.initAdd = function(callback) {
            return new Promise((re) => {
                thread.init_arr.push(() => {
                    return re(callback())
                })
            })
        }
        thread.init = false;
        thread.th = threads.start(function() {
            thread.lock.lock();
            thread.init = true;
            thread.init_arr.forEach((r) => r())
            //log('vs:',thread.init_arr.length)
            thread.lock.unlock();
            //启动一个计时器保证线程不会终止运行
            setInterval(() => {}, 1000);
        });


        return thread;
    }
}

exports.setPrintError = setPrintError;
exports.setThredMax = setThredMax;
exports.run = run;
exports.create_thread = create_thread;