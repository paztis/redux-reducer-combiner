import chai from 'chai';
import { createStore } from 'redux';
import ReducerCombiner from '../src/';

const {expect} = chai;

describe('reducers', () => {
    let store;
    const initialStore = {};

    const counterType = 'increment';
    const counterAction = { type: counterType };
    const counterReducer = (state = 0, action) =>
        action.type === counterType ? state + 1 : state;

    const stackType = 'push';
    const stackAction = { type: stackType, value: 'a' };
    const stackReducer = (state = [], action) =>
        action.type === stackType ? [...state, action.value] : state;

    const concatType = 'concat';
    const concatAction = { type: concatType, value: 'x' };
    const concatReducer = (state = '', action) =>
        action.type === concatType ? state + action.value : state;

    beforeEach(() => {
        store = createStore((state) => state, initialStore);
    });

    it('empty combiner', () => {
        const rc = new ReducerCombiner();

        store.replaceReducer(rc.combineReducers());
        expect(store.getState()).to.deep.equal(initialStore);

        store.dispatch({ type: '' });
        expect(store.getState()).to.deep.equal(initialStore);
    });

    it('inited combiner', () => {
        const rc = new ReducerCombiner({
            counter: counterReducer,
            stack: stackReducer
        });

        store.replaceReducer(rc.combineReducers());
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [] });

        store.dispatch(counterAction);
        expect(store.getState()).to.deep.equal({ counter: 1, stack: [] });

        store.dispatch(stackAction);
        expect(store.getState()).to.deep.equal({ counter: 1, stack: ['a'] });
    });

    it('addition on combiner', () => {
        const rc = new ReducerCombiner({
            counter: counterReducer
        });
        rc.setUpdateHandler(() => {
            store.replaceReducer(rc.combineReducers());
        });

        store.replaceReducer(rc.combineReducers());
        expect(store.getState()).to.deep.equal({ counter: 0 });

        store.dispatch(counterAction);
        expect(store.getState()).to.deep.equal({ counter: 1 });

        rc.addReducer('stack', stackReducer);
        expect(store.getState()).to.deep.equal({ counter: 1, stack: [] });

        store.dispatch(counterAction);
        expect(store.getState()).to.deep.equal({ counter: 2, stack: [] });

        store.dispatch(stackAction);
        expect(store.getState()).to.deep.equal({ counter: 2, stack: ['a'] });
    });

    it('addition of same key on combiner', () => {
        const rc = new ReducerCombiner({
            counter: counterReducer
        });
        rc.setUpdateHandler(() => {
            store.replaceReducer(rc.combineReducers());
        });

        store.replaceReducer(rc.combineReducers());
        expect(store.getState()).to.deep.equal({ counter: 0 });

        const additionF = () => {rc.addReducer('counter', stackReducer);};
        expect(additionF).to.throw();
    });

    it('suppression on combiner', () => {
        const rc = new ReducerCombiner({
            counter: counterReducer,
            stack: stackReducer,
            concat: concatReducer
        });
        rc.setUpdateHandler(() => {
            store.replaceReducer(rc.combineReducers());
        });

        store.replaceReducer(rc.combineReducers());
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [], concat: '' });

        rc.removeReducer('counter', true);
        store.dispatch(counterAction);
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [], concat: '' });

        store.dispatch(stackAction);
        expect(store.getState()).to.deep.equal({ counter: 0, stack: ['a'], concat: '' });

        store.dispatch(concatAction);
        expect(store.getState()).to.deep.equal({ counter: 0, stack: ['a'], concat: 'x' });

        rc.removeReducer('concat', false);
        store.dispatch(stackAction);
        expect(store.getState()).to.deep.equal({ counter: 0, stack: ['a', 'a'] });
    });

    it('update on combiner', () => {
        const rc = new ReducerCombiner({
            counter: counterReducer,
            stack: stackReducer,
            concat: concatReducer
        });
        rc.setUpdateHandler(() => {
            store.replaceReducer(rc.combineReducers());
        });

        store.replaceReducer(rc.combineReducers());
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [], concat: '' });

        store.dispatch(counterAction);
        store.dispatch(stackAction);
        store.dispatch(concatAction);
        expect(store.getState()).to.deep.equal({ counter: 1, stack: ['a'], concat: 'x' });

        rc.updateReducer('counter', (state = 0, action) =>
            action.type === counterType ? state + 10 : state);
        store.dispatch(counterAction);
        expect(store.getState()).to.deep.equal({ counter: 11, stack: ['a'], concat: 'x' });

        rc.updateReducer('stack', (state = [], action) =>
            action.type === stackType ? [...state, 'b', action.value] : state);
        store.dispatch(stackAction);
        expect(store.getState()).to.deep.equal({ counter: 11, stack: ['a', 'b', 'a'], concat: 'x' });

        rc.updateReducer('concat', (state = '', action) =>
            action.type === concatType ? state + 'y' + action.value : state);
        store.dispatch(concatAction);
        expect(store.getState()).to.deep.equal({ counter: 11, stack: ['a', 'b', 'a'], concat: 'xyx' });
    });

    it('nested inited combiner', () => {
        const rcChild = new ReducerCombiner();

        const rcRoot = new ReducerCombiner({
            counter: counterReducer,
            stack: stackReducer,
            child: rcChild
        });
        rcRoot.setUpdateHandler(() => {
            store.replaceReducer(rcRoot.combineReducers());
        });

        store.replaceReducer(rcRoot.combineReducers());
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [], child: {} });

        rcChild.addReducer('concat', concatReducer);
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [], child: { concat: '' } });

        store.dispatch(concatAction);
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [], child: { concat: 'x' } });
    });

    it('nested combiner addition', () => {
        const rcChild = new ReducerCombiner({});

        const rcRoot = new ReducerCombiner({
            counter: counterReducer,
            stack: stackReducer
        });
        rcRoot.setUpdateHandler(() => {
            store.replaceReducer(rcRoot.combineReducers());
        });

        store.replaceReducer(rcRoot.combineReducers());
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [] });

        rcChild.addReducer('concat', concatReducer);
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [] });

        store.dispatch(concatAction);
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [] });

        rcRoot.addReducer('child', rcChild);
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [], child: { concat: '' } });

        store.dispatch(concatAction);
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [], child: { concat: 'x' } });
    });

    it('nested combiner suppression', () => {
        const rcChild = new ReducerCombiner({
            concat: concatReducer
        });

        const rcRoot = new ReducerCombiner({
            counter: counterReducer,
            stack: stackReducer,
            child: rcChild
        });
        rcRoot.setUpdateHandler(() => {
            store.replaceReducer(rcRoot.combineReducers());
        });

        store.replaceReducer(rcRoot.combineReducers());
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [], child: { concat: ''} });

        store.dispatch(concatAction);
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [], child: { concat: 'x' } });

        rcRoot.removeReducer('child', true);
        store.dispatch(concatAction);
        expect(store.getState()).to.deep.equal({ counter: 0, stack: [], child: { concat: 'x' } });
    });
});
