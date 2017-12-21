import { combineReducers } from 'redux'

// TODO: add action filtering management depending on action criteria
// TODO: redact readme
export default class ReducerCombiner {

    constructor(initialReducers = {}) {
        this.reducers = initialReducers;
        this.updateHandler = null;

        this.onUpdate = this.onUpdate.bind(this);

        Object.keys(this.reducers).forEach((key) => {
            this.propagateUpdateHandler(this.reducers[key]);
        });
    }

    addReducer(key, reducer) {
        if (this.reducers[key]) {
            throw Error('Already existing reducer');
        }

        this.reducers[key] = reducer;
        this.propagateUpdateHandler(reducer);

        this.onUpdate();
    }

    removeReducer(key, preserveState = false) {
        if (this.reducers[key]) {
            const reducer = this.reducers[key];
            delete this.reducers[key];
            if (reducer instanceof ReducerCombiner) {
                reducer.deleteUpdateHandler();
            }

            // if not preserved, state will be delete on next action call
            // to preserve it, inject a passthrough function
            if (preserveState) {
                this.reducers[key] = (state = {}) => state;
            }
        }

        this.onUpdate();
    }

    updateReducer(key, reducer) {
        this.reducers[key] = reducer;
        this.propagateUpdateHandler(reducer);

        this.onUpdate();
    }

    combineReducers() {
        const finalReducersKeys = Object.keys(this.reducers);
        const finalReducers = {};
        finalReducersKeys.forEach((key) => {
            const reducer = this.reducers[key];
            if (reducer instanceof ReducerCombiner) {
                finalReducers[key] = reducer.combineReducers();
            } else {
                finalReducers[key] = reducer;
            }
        });

        return (finalReducersKeys.length > 0) ? combineReducers(finalReducers) : (state = {}) => state;
    }

    setUpdateHandler(handler) {
        this.updateHandler = handler;
    }

    deleteUpdateHandler() {
        this.updateHandler = null;
    }

    propagateUpdateHandler(reducer) {
        if (reducer instanceof ReducerCombiner) {
            reducer.setUpdateHandler(this.onUpdate);
        }
    }

    onUpdate() {
        this.updateHandler && this.updateHandler();
    }
}