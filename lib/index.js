"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _redux = require("redux");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ReducerCombiner =
/*#__PURE__*/
function () {
  function ReducerCombiner() {
    var _this = this;

    var initialReducers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ReducerCombiner);

    this.reducers = initialReducers;
    this.updateHandler = null;
    this.onUpdate = this.onUpdate.bind(this);
    Object.keys(this.reducers).forEach(function (key) {
      _this.propagateUpdateHandler(_this.reducers[key]);
    });
  }

  _createClass(ReducerCombiner, [{
    key: "addReducer",
    value: function addReducer(key, reducer) {
      if (this.reducers[key]) {
        throw Error('Already existing reducer');
      }

      this.reducers[key] = reducer;
      this.propagateUpdateHandler(reducer);
      this.onUpdate();
    }
  }, {
    key: "removeReducer",
    value: function removeReducer(key) {
      var preserveState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.reducers[key]) {
        var reducer = this.reducers[key];
        delete this.reducers[key];

        if (reducer instanceof ReducerCombiner) {
          reducer.deleteUpdateHandler();
        } // if not preserved, state will be delete on next action call
        // to preserve it, inject a passthrough function


        if (preserveState) {
          this.reducers[key] = function () {
            var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return state;
          };
        }
      }

      this.onUpdate();
    }
  }, {
    key: "updateReducer",
    value: function updateReducer(key, reducer) {
      this.reducers[key] = reducer;
      this.propagateUpdateHandler(reducer);
      this.onUpdate();
    }
  }, {
    key: "combineReducers",
    value: function combineReducers() {
      var _this2 = this;

      var finalReducersKeys = Object.keys(this.reducers);
      var finalReducers = {};
      finalReducersKeys.forEach(function (key) {
        var reducer = _this2.reducers[key];

        if (reducer instanceof ReducerCombiner) {
          finalReducers[key] = reducer.combineReducers();
        } else {
          finalReducers[key] = reducer;
        }
      });
      return finalReducersKeys.length > 0 ? (0, _redux.combineReducers)(finalReducers) : function () {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return state;
      };
    }
  }, {
    key: "setUpdateHandler",
    value: function setUpdateHandler(handler) {
      this.updateHandler = handler;
    }
  }, {
    key: "deleteUpdateHandler",
    value: function deleteUpdateHandler() {
      this.updateHandler = null;
    }
  }, {
    key: "propagateUpdateHandler",
    value: function propagateUpdateHandler(reducer) {
      if (reducer instanceof ReducerCombiner) {
        reducer.setUpdateHandler(this.onUpdate);
      }
    }
  }, {
    key: "onUpdate",
    value: function onUpdate() {
      this.updateHandler && this.updateHandler();
    }
  }]);

  return ReducerCombiner;
}();

exports.default = ReducerCombiner;